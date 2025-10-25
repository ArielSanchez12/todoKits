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
    const urlQR = `${process.env.URL_FRONTEND}/transferencia/${codigoQR}`;
    
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
    const docenteId = req.docenteBDD._id;

    const transferencia = await Transferencia.findOne({ codigoQR });

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    // Validar que sea el docente origen
    if (transferencia.docenteOrigen.toString() !== docenteId.toString()) {
      return res.status(403).json({ 
        msg: "No tienes permisos para confirmar esta transferencia" 
      });
    }

    // Validar estado
    if (transferencia.estado !== "pendiente_origen") {
      return res.status(400).json({ 
        msg: "Esta transferencia ya fue procesada" 
      });
    }

    // Actualizar transferencia
    transferencia.estado = "confirmado_origen";
    transferencia.observacionesOrigen = observaciones || "";
    transferencia.firmaOrigen = firma || "";
    transferencia.fechaConfirmacionOrigen = new Date();
    await transferencia.save();

    // Notificar al docente destino
    pusher.trigger("chat", "transferencia-confirmada-origen", {
      transferencia: await transferencia.populate([
        "docenteOrigen",
        "docenteDestino",
        "recursos",
        "recursosAdicionales",
      ]),
      para: transferencia.docenteDestino.toString(),
    });

    res.json({
      msg: "Transferencia confirmada. Esperando aceptación del docente destino",
      transferencia,
    });
  } catch (error) {
    console.error("Error al confirmar transferencia origen:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Aceptar/Rechazar transferencia (Docente B)
const responderTransferenciaDestino = async (req, res) => {
  try {
    const { id } = req.params;
    const { aceptar, observaciones, firma } = req.body;
    const docenteId = req.docenteBDD._id;

    const transferencia = await Transferencia.findById(id)
      .populate("prestamoOriginal")
      .populate("recursos")
      .populate("recursosAdicionales");

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    // Validar que sea el docente destino
    if (transferencia.docenteDestino.toString() !== docenteId.toString()) {
      return res.status(403).json({ 
        msg: "No tienes permisos para responder esta transferencia" 
      });
    }

    // Validar estado
    if (transferencia.estado !== "confirmado_origen") {
      return res.status(400).json({ 
        msg: "El docente origen aún no ha confirmado la transferencia" 
      });
    }

    if (aceptar) {
      // ACEPTAR TRANSFERENCIA

      // 1. Finalizar préstamo original
      const prestamoOriginal = await Prestamo.findById(transferencia.prestamoOriginal);
      prestamoOriginal.estado = "finalizado";
      prestamoOriginal.horaDevolucion = new Date();
      prestamoOriginal.observaciones += `\n[TRANSFERIDO] Recursos transferidos a ${transferencia.docenteDestino}`;
      await prestamoOriginal.save();

      // 2. Crear nuevo préstamo para docente destino
      const nuevoPrestamo = await Prestamo.create({
        recurso: transferencia.recursos[0], // Recurso principal
        docente: transferencia.docenteDestino,
        admin: transferencia.admin,
        motivo: {
          tipo: "Transferencia",
          descripcion: `Transferido desde ${transferencia.docenteOrigen}`,
        },
        estado: "activo",
        fechaPrestamo: new Date(),
        horaConfirmacion: new Date(),
        recursosAdicionales: transferencia.recursosAdicionales,
        observaciones: observaciones || "Recibido por transferencia",
        firmaDocente: firma || "",
      });

      // 3. Actualizar asignación de recursos
      await Recurso.updateMany(
        { _id: { $in: [...transferencia.recursos, ...transferencia.recursosAdicionales] } },
        { asignadoA: transferencia.docenteDestino }
      );

      // 4. Actualizar transferencia
      transferencia.estado = "finalizado";
      transferencia.observacionesDestino = observaciones || "";
      transferencia.firmaDestino = firma || "";
      transferencia.fechaConfirmacionDestino = new Date();
      await transferencia.save();

      // Notificar a todos
      pusher.trigger("prestamos", "transferencia-completada", {
        transferencia,
        nuevoPrestamo,
      });

      res.json({
        msg: "Transferencia aceptada exitosamente",
        nuevoPrestamo,
      });
    } else {
      // RECHAZAR TRANSFERENCIA
      transferencia.estado = "rechazado";
      transferencia.observacionesDestino = observaciones || "Transferencia rechazada";
      transferencia.fechaConfirmacionDestino = new Date();
      await transferencia.save();

      // Notificar rechazo
      pusher.trigger("chat", "transferencia-rechazada", {
        transferencia,
        para: transferencia.docenteOrigen.toString(),
      });

      res.json({
        msg: "Transferencia rechazada",
        transferencia,
      });
    }
  } catch (error) {
    console.error("Error al responder transferencia:", error);
    res.status(500).json({ msg: "Error en el servidor" });
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