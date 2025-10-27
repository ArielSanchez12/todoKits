import Transferencia from "../models/transferencia.js";
import Prestamo from "../models/prestamo.js";
import Recurso from "../models/recurso.js";
import Docente from "../models/docente.js";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import pusher from "../config/pusher.js";

// Crear solicitud de transferencia (Admin)
const crearTransferencia = async (req, res) => {
  try {
    const { prestamoId, docenteDestinoId, recursosSeleccionados } = req.body;
    const adminId = req.adminEmailBDD._id;

    // Validar préstamo existe y está activo
    const prestamo = await Prestamo.findById(prestamoId)
      .populate("recurso")
      .populate("recursosAdicionales")
      .populate("docente");

    if (!prestamo) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }

    if (prestamo.estado !== "activo") {
      return res.status(400).json({
        msg: "Solo se pueden transferir préstamos activos"
      });
    }

    // Validar docente destino existe
    const docenteDestino = await Docente.findById(docenteDestinoId);
    if (!docenteDestino) {
      return res.status(404).json({ msg: "Docente destino no encontrado" });
    }

    // Validar que no sea el mismo docente
    if (prestamo.docente._id.toString() === docenteDestinoId) {
      return res.status(400).json({
        msg: "No se puede transferir al mismo docente"
      });
    }

    // Generar código único para QR
    const codigoQR = uuidv4();

    // Crear transferencia
    const transferencia = await Transferencia.create({
      prestamoOriginal: prestamoId,
      docenteOrigen: prestamo.docente._id,
      docenteDestino: docenteDestinoId,
      admin: adminId,
      recursos: recursosSeleccionados.principales || [prestamo.recurso._id],
      recursosAdicionales: recursosSeleccionados.adicionales || prestamo.recursosAdicionales,
      codigoQR,
      estado: "pendiente_origen",
    });

    // Generar URL para el QR
    const urlQR = `${process.env.URL_FRONTEND}dashboard/transferencia/${codigoQR}`;

    // Generar imagen QR
    const qrImage = await QRCode.toDataURL(urlQR);

    // Emitir evento a Pusher para notificar al docente origen
    pusher.trigger("chat", "transferencia-solicitada", {
      transferencia: await transferencia.populate([
        "docenteOrigen",
        "docenteDestino",
        "recursos",
        "recursosAdicionales",
      ]),
      qrImage,
      para: prestamo.docente._id.toString(),
    });

    res.status(201).json({
      msg: "Solicitud de transferencia creada exitosamente",
      transferencia: await transferencia.populate([
        "docenteOrigen",
        "docenteDestino",
        "recursos",
        "recursosAdicionales",
      ]),
      qrImage,
      urlQR,
    });
  } catch (error) {
    console.error("Error al crear transferencia:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Obtener transferencia por código QR
const obtenerTransferenciaPorQR = async (req, res) => {
  try {
    const { codigoQR } = req.params;

    const transferencia = await Transferencia.findOne({ codigoQR })
      .populate("prestamoOriginal")
      .populate("docenteOrigen", "nombreDocente apellidoDocente emailDocente")
      .populate("docenteDestino", "nombreDocente apellidoDocente emailDocente")
      .populate("recursos", "nombre tipo laboratorio aula contenido")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido");

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    res.json(transferencia);
  } catch (error) {
    console.error("Error al obtener transferencia:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Confirmar transferencia desde origen (Docente A escanea QR)
const confirmarTransferenciaOrigen = async (req, res) => {
  try {
    const { codigoQR } = req.params;
    const { observaciones, firma } = req.body;

    if (!req.docenteBDD || !req.docenteBDD._id) {
      return res.status(401).json({
        msg: "Error de autenticación"
      });
    }

    const docenteId = req.docenteBDD._id;
    console.log("🔍 Buscando transferencia con código:", codigoQR);

    const transferencia = await Transferencia.findOne({ codigoQR })
      .populate("docenteOrigen", "nombreDocente apellidoDocente emailDocente")
      .populate("docenteDestino", "nombreDocente apellidoDocente emailDocente")
      .populate("recursos")
      .populate("recursosAdicionales")
      .populate("prestamoOriginal");

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    // Validar que sea el docente origen
    if (transferencia.docenteOrigen._id.toString() !== docenteId.toString()) {
      return res.status(403).json({
        msg: "No tienes permisos para confirmar esta transferencia",
        detalle: "Solo el docente origen puede confirmar"
      });
    }

    // Validar estado
    if (transferencia.estado !== "pendiente_origen") {
      return res.status(400).json({
        msg: "Esta transferencia ya fue procesada",
        estadoActual: transferencia.estado
      });
    }

    // Actualizar transferencia
    transferencia.estado = "confirmado_origen";
    transferencia.observacionesOrigen = observaciones || "";
    transferencia.firmaOrigen = firma;
    transferencia.fechaConfirmacionOrigen = new Date();
    await transferencia.save();

    console.log("✅ Transferencia confirmada por origen");

    // ✅ CORRECCIÓN: Incluir TODA la información en observaciones
    const nombreOrigenCompleto = `${transferencia.docenteOrigen.nombreDocente} ${transferencia.docenteOrigen.apellidoDocente}`;
    const emailOrigen = transferencia.docenteOrigen.emailDocente;

    let observacionesPrestamo = `📤 Transferido por: ${nombreOrigenCompleto}
Email: ${emailOrigen}
Estado reportado: ${observaciones || "Sin observaciones"}
Fecha de transferencia: ${new Date().toLocaleString('es-ES')}
Código de transferencia: ${codigoQR}`;

    // Contar recursos transferidos vs totales
    const totalRecursosOriginales = (transferencia.prestamoOriginal?.recursosAdicionales?.length || 0) + 1;
    const recursosTransferidos = transferencia.recursos.length + transferencia.recursosAdicionales.length;
    const recursosNoTransferidos = totalRecursosOriginales - recursosTransferidos;

    if (recursosNoTransferidos > 0) {
      observacionesPrestamo += `\n📦 Recursos: ${recursosTransferidos} de ${totalRecursosOriginales} (${recursosNoTransferidos} adicional/es no incluido/s)`;
    }

    // Crear préstamo pendiente para docente destino
    const nuevoPrestamoPendiente = await Prestamo.create({
      recurso: transferencia.recursos[0]?._id,
      docente: transferencia.docenteDestino._id,
      admin: transferencia.admin,
      motivo: {
        tipo: "Transferencia",
        descripcion: `Transferencia desde ${nombreOrigenCompleto}`,
      },
      estado: "pendiente",
      fechaPrestamo: new Date(),
      recursosAdicionales: transferencia.recursosAdicionales.map(r => r._id),
      observaciones: observacionesPrestamo, // ✅ AQUÍ VA TODA LA INFO
      firmaDocente: "",
    });

    console.log("📋 Préstamo pendiente creado para docente destino:", nuevoPrestamoPendiente._id);
    console.log("📝 Observaciones guardadas:", observacionesPrestamo);

    // Notificar al docente destino por Pusher
    pusher.trigger("chat", "transferencia-confirmada-origen", {
      transferencia,
      nuevoPrestamoPendiente,
      para: transferencia.docenteDestino._id.toString(),
    });

    res.json({
      msg: "Transferencia confirmada. El docente destino recibirá la solicitud en sus préstamos",
      transferencia: await transferencia.populate("prestamoOriginal"),
      nuevoPrestamoPendiente,
    });
  } catch (error) {
    console.error("❌ Error al confirmar transferencia origen:", error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message
    });
  }
};

// ✅ ELIMINAMOS O DEJAMOS COMO BACKUP - Ya no se usa directamente
// El docente destino confirma como un préstamo normal desde su tabla
const responderTransferenciaDestino = async (req, res) => {
  try {
    const { codigoQR } = req.params;
    const { aceptar, observaciones, firma, nuevoMotivo } = req.body;

    if (!req.docenteBDD || !req.docenteBDD._id) {
      return res.status(401).json({
        msg: "Error de autenticación"
      });
    }

    const docenteId = req.docenteBDD._id;
    console.log("🔍 Docente destino respondiendo:", docenteId);

    const transferencia = await Transferencia.findOne({ codigoQR })
      .populate("prestamoOriginal")
      .populate("docenteOrigen")
      .populate("docenteDestino")
      .populate("recursos")
      .populate("recursosAdicionales");

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    // Validar que sea el docente destino
    if (transferencia.docenteDestino._id.toString() !== docenteId.toString()) {
      return res.status(403).json({
        msg: "No tienes permisos para responder esta transferencia",
        detalle: "Solo el docente destino puede responder"
      });
    }

    // Validar estado
    if (transferencia.estado !== "confirmado_origen") {
      return res.status(400).json({
        msg: "El docente origen aún no ha confirmado la transferencia",
        estadoActual: transferencia.estado
      });
    }

    const firmaFinal = firma || `${req.docenteBDD.nombreDocente} ${req.docenteBDD.apellidoDocente}`;

    if (aceptar) {
      // ACEPTAR TRANSFERENCIA

      // 1. Finalizar préstamo original
      const prestamoOriginal = await Prestamo.findById(transferencia.prestamoOriginal._id);
      prestamoOriginal.estado = "finalizado";
      prestamoOriginal.horaDevolucion = new Date();
      prestamoOriginal.observaciones += `\n[TRANSFERIDO] Recursos transferidos a ${transferencia.docenteDestino.nombreDocente} ${transferencia.docenteDestino.apellidoDocente}`;
      await prestamoOriginal.save();

      // ✅ 2. Usar el nuevo motivo si se proporciona
      let motivoFinal = {
        tipo: "Transferencia",
        descripcion: `Transferido desde ${transferencia.docenteOrigen.nombreDocente} ${transferencia.docenteOrigen.apellidoDocente}`,
      };

      if (nuevoMotivo && nuevoMotivo.tipo) {
        motivoFinal = {
          tipo: nuevoMotivo.tipo,
          descripcion: nuevoMotivo.descripcion || motivoFinal.descripcion,
        };
      }

      // 3. Crear nuevo préstamo para docente destino
      const nuevoPrestamo = await Prestamo.create({
        recurso: transferencia.recursos[0],
        docente: transferencia.docenteDestino._id,
        admin: transferencia.admin,
        motivo: motivoFinal,
        estado: "activo",
        fechaPrestamo: new Date(),
        horaConfirmacion: new Date(),
        recursosAdicionales: transferencia.recursosAdicionales.map(r => r._id),
        observaciones: observaciones || "Recibido por transferencia",
        firmaDocente: firmaFinal,
      });

      // 4. Actualizar asignación de recursos
      const todosLosRecursos = [
        ...transferencia.recursos.map(r => r._id),
        ...transferencia.recursosAdicionales.map(r => r._id)
      ];

      await Recurso.updateMany(
        { _id: { $in: todosLosRecursos } },
        { asignadoA: transferencia.docenteDestino._id }
      );

      // 5. Actualizar transferencia
      transferencia.estado = "finalizado";
      transferencia.observacionesDestino = observaciones || "";
      transferencia.firmaDestino = firmaFinal;
      transferencia.fechaConfirmacionDestino = new Date();
      await transferencia.save();

      console.log("✅ Transferencia completada exitosamente");

      // Notificar
      pusher.trigger("prestamos", "transferencia-completada", {
        transferencia,
        nuevoPrestamo,
      });

      res.json({
        msg: "Transferencia aceptada exitosamente",
        nuevoPrestamo: await nuevoPrestamo.populate([
          "recurso",
          "recursosAdicionales",
          "docente"
        ]),
        transferencia,
      });
    } else {
      // RECHAZAR TRANSFERENCIA
      transferencia.estado = "rechazado";
      transferencia.observacionesDestino = observaciones || "Transferencia rechazada";
      transferencia.firmaDestino = firmaFinal;
      transferencia.fechaConfirmacionDestino = new Date();
      await transferencia.save();

      console.log("⚠️ Transferencia rechazada");

      pusher.trigger("chat", "transferencia-rechazada", {
        transferencia,
        para: transferencia.docenteOrigen._id.toString(),
      });

      res.json({
        msg: "Transferencia rechazada",
        transferencia,
      });
    }
  } catch (error) {
    console.error("❌ Error al responder transferencia:", error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message
    });
  }
};

// Listar transferencias (Admin)
const listarTransferencias = async (req, res) => {
  try {
    const adminId = req.adminEmailBDD._id;

    const transferencias = await Transferencia.find({ admin: adminId })
      .populate("docenteOrigen", "nombreDocente apellidoDocente")
      .populate("docenteDestino", "nombreDocente apellidoDocente")
      .populate("recursos", "nombre tipo")
      .sort({ createdAt: -1 });

    res.json(transferencias);
  } catch (error) {
    console.error("Error al listar transferencias:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

export {
  crearTransferencia,
  obtenerTransferenciaPorQR,
  confirmarTransferenciaOrigen,
  responderTransferenciaDestino,
  listarTransferencias,
};