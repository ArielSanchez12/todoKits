import prestamo from "../models/prestamo.js";
import recurso from "../models/recurso.js";
import docente from "../models/docente.js";
import Transferencia from "../models/transferencia.js";
import mongoose from "mongoose";

// Crear solicitud de préstamo (admin crea las solicitudes que les llegan a los docentes para que las confirmen)
const crearPrestamo = async (req, res) => {
  try {
    const datosPrestamo = req.validated || req.body;
    const adminId = req.adminEmailBDD._id;

    // Validar que el recurso exista y esté disponible
    const recursoExistente = await recurso.findById(datosPrestamo.recurso);
    if (!recursoExistente) {
      return res.status(404).json({ msg: "Recurso no encontrado" });
    }

    if (recursoExistente.estado !== "pendiente") {
      return res.status(400).json({
        msg: `El recurso ${recursoExistente.nombre} no está disponible para préstamo`
      });
    }

    // Validar que el docente exista
    const docenteExistente = await docente.findById(datosPrestamo.docente);
    if (!docenteExistente) {
      return res.status(404).json({ msg: "Docente no encontrado" });
    }

    // Validar recursos adicionales si existen en observaciones
    let recursosAdicionalesIds = [];
    if (datosPrestamo.observaciones) {
      const patron = /(KIT|LLAVE|PROYECTOR)\s*#(\d+)/gi;
      const matches = [...datosPrestamo.observaciones.matchAll(patron)];

      if (matches.length > 0) {
        const nombresRecursos = matches.map(m => `${m[1].toUpperCase()} #${m[2]}`);
        const recursosAdicionales = await recurso.find({
          nombre: { $in: nombresRecursos },
          _id: { $ne: datosPrestamo.recurso }
        });

        // Validar que todos estén disponibles
        const noDisponibles = recursosAdicionales.filter(r => r.estado !== "pendiente");
        if (noDisponibles.length > 0) {
          return res.status(400).json({
            msg: `Algunos recursos mencionados no están disponibles: ${noDisponibles.map(r => r.nombre).join(', ')}`
          });
        }

        recursosAdicionalesIds = recursosAdicionales.map(r => r._id);
      }
    }

    // Crear el préstamo
    const nuevoPrestamo = new prestamo({
      recurso: datosPrestamo.recurso,
      docente: datosPrestamo.docente,
      admin: adminId,
      motivo: datosPrestamo.motivo,
      observaciones: datosPrestamo.observaciones || "",
      recursosAdicionales: recursosAdicionalesIds,
      estado: "pendiente",
    });

    await nuevoPrestamo.save();

    // Cambiar estado del recurso principal a "activo" (bloqueado)
    recursoExistente.estado = "activo";
    recursoExistente.asignadoA = datosPrestamo.docente;
    await recursoExistente.save();

    // Cambiar estado de recursos adicionales a "activo"
    if (recursosAdicionalesIds.length > 0) {
      await recurso.updateMany(
        { _id: { $in: recursosAdicionalesIds } },
        {
          estado: "activo",
          asignadoA: datosPrestamo.docente
        }
      );
    }

    res.status(201).json({
      msg: "Solicitud de préstamo creada exitosamente. El docente debe confirmarla.",
      prestamo: nuevoPrestamo
    });
  } catch (error) {
    console.error("Error al crear préstamo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Listar préstamos del admin
const listarPrestamosAdmin = async (req, res) => {
  try {
    const prestamos = await prestamo
      .find({ admin: req.adminEmailBDD._id })
      .populate("recurso", "nombre tipo laboratorio aula contenido")
      .populate("docente", "nombreDocente apellidoDocente emailDocente")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido")
      .sort({ createdAt: -1 });

    res.status(200).json(prestamos);
  } catch (error) {
    console.error("Error al listar préstamos:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Listar préstamos del docente (pendientes y activos)
const listarPrestamosDocente = async (req, res) => {
  try {
    const docenteId = req.docenteBDD._id;

    const prestamos = await prestamo
      .find({
        docente: docenteId,
        estado: { $in: ["pendiente", "activo"] }
      })
      .populate("recurso", "nombre tipo laboratorio aula contenido")
      .populate("admin", "nombre apellido")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido")
      .sort({ createdAt: -1 });

    res.status(200).json(prestamos);
  } catch (error) {
    console.error("Error al listar préstamos del docente:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Historial de préstamos del docente
const historialPrestamosDocente = async (req, res) => {
  try {
    const docenteId = req.docenteBDD._id;

    const prestamos = await prestamo
      .find({
        docente: docenteId,
        estado: { $in: ["finalizado", "rechazado", "cancelado"] }
      })
      .populate("recurso", "nombre tipo laboratorio aula contenido")
      .populate("docente", "nombreDocente apellidoDocente emailDocente")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido")
      .sort({ horaDevolucion: -1, createdAt: -1 });

    res.status(200).json(prestamos);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Confirmar préstamo (Docente)
const confirmarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmar, motivoRechazo } = req.validated || req.body;
    const docenteId = req.docenteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de préstamo inválido" });
    }

    const prestamoExistente = await prestamo.findById(id);
    if (!prestamoExistente) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }

    // Verificar que el préstamo pertenezca al docente
    if (prestamoExistente.docente.toString() !== docenteId.toString()) {
      return res.status(403).json({ msg: "No tienes permiso para confirmar este préstamo" });
    }

    if (prestamoExistente.estado !== "pendiente") {
      return res.status(400).json({ msg: "Este préstamo ya fue procesado" });
    }

    if (confirmar) {
      // Confirmar préstamo
      prestamoExistente.estado = "activo";
      prestamoExistente.horaConfirmacion = new Date();
      //Firma = _id del docente (no string, no editable)
      prestamoExistente.firmaDocente = docenteId.toString();

      //DETECTAR SI ES TRANSFERENCIA
      const esTransferencia = prestamoExistente.motivo?.tipo === "Transferencia" ||
        prestamoExistente.observaciones?.includes("Transferido por");

      if (esTransferencia) {
        let codigoQR = null;
        let transferencia = null;

        // Buscar la transferencia asociada por el código en observaciones
        if (prestamoExistente.observaciones) {
          const codigoMatch = prestamoExistente.observaciones.match(/Código de transferencia: ([a-f0-9\-]+)/);
          if (codigoMatch && codigoMatch[1]) {
            codigoQR = codigoMatch[1];
            transferencia = await Transferencia.findOne({ codigoQR })
              .populate("prestamoOriginal")
              .populate("recursos")
              .populate("recursosAdicionales");
          }
        }

        if (transferencia && transferencia.prestamoOriginal) {
          //Guardar firma del docente destino
          transferencia.firmaDestino = docenteId.toString();
          transferencia.estado = "finalizado";
          transferencia.fechaConfirmacionDestino = new Date();
          await transferencia.save();

          // Obtener el préstamo original
          const prestamoOriginal = await prestamo.findById(transferencia.prestamoOriginal._id);

          if (prestamoOriginal && prestamoOriginal.estado === "activo") {
            // Calcular recursos que NO fueron seleccionados
            const recursosTransferidos = transferencia.recursos.map(r => r._id.toString());
            const recursosAdicionalesTransferidos = transferencia.recursosAdicionales.map(r => r._id.toString());
            const todosRecursosTransferidos = [...recursosTransferidos, ...recursosAdicionalesTransferidos];

            // Recursos que NO se transfieren (se devuelven)
            const recursosNoTransferidos = [];

            // Verificar recursos adicionales del préstamo original
            if (prestamoOriginal.recursosAdicionales && prestamoOriginal.recursosAdicionales.length > 0) {
              prestamoOriginal.recursosAdicionales.forEach(recursoId => {
                if (!todosRecursosTransferidos.includes(recursoId.toString())) {
                  recursosNoTransferidos.push(recursoId);
                }
              });
            }

            // Liberar recursos que NO se transfieren
            if (recursosNoTransferidos.length > 0) {
              await recurso.updateMany(
                { _id: { $in: recursosNoTransferidos } },
                {
                  estado: "pendiente",
                  asignadoA: null
                }
              );
            }

            // Finalizar préstamo original
            prestamoOriginal.estado = "finalizado";
            prestamoOriginal.horaDevolucion = new Date();
            prestamoOriginal.observaciones += `\n📤 [TRANSFERENCIA COMPLETADA] Transferido a ${req.docenteBDD.nombreDocente} ${req.docenteBDD.apellidoDocente} el ${new Date().toLocaleString('es-ES')}`;

            if (recursosNoTransferidos.length > 0) {
              prestamoOriginal.observaciones += `\n📦 Recursos devueltos (no transferidos): ${recursosNoTransferidos.length} adicional(es)`;
            }

            await prestamoOriginal.save();
            // Actualizar transferencia
            transferencia.estado = "finalizado";
            transferencia.fechaConfirmacionDestino = new Date();
            await transferencia.save();
          }
        }
      }

      // Cambiar recursos a "prestado"
      await recurso.findByIdAndUpdate(prestamoExistente.recurso, {
        estado: "prestado"
      });

      // Cambiar recursos adicionales a "prestado"
      if (prestamoExistente.recursosAdicionales.length > 0) {
        await recurso.updateMany(
          { _id: { $in: prestamoExistente.recursosAdicionales } },
          { estado: "prestado" }
        );
      }

      await prestamoExistente.save();

      const prestamoPopulado = await prestamo
        .findById(prestamoExistente._id)
        .populate("recurso", "nombre tipo laboratorio aula contenido")
        .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido");

      res.status(200).json({
        msg: "Préstamo confirmado exitosamente",
        prestamo: prestamoPopulado
      });
    } else {
      // RECHAZAR PRÉSTAMO
      prestamoExistente.estado = "rechazado";
      prestamoExistente.observaciones += `\n[RECHAZADO] ${motivoRechazo || "Sin motivo especificado"}`;

      // Liberar recurso
      await recurso.findByIdAndUpdate(prestamoExistente.recurso, {
        estado: "pendiente",
        asignadoA: null
      });

      // Liberar recursos adicionales
      if (prestamoExistente.recursosAdicionales.length > 0) {
        await recurso.updateMany(
          { _id: { $in: prestamoExistente.recursosAdicionales } },
          { estado: "pendiente", asignadoA: null }
        );
      }

      await prestamoExistente.save();

      const prestamoPopulado = await prestamo
        .findById(prestamoExistente._id)
        .populate("recurso", "nombre tipo laboratorio aula contenido")
        .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido");

      res.status(200).json({ msg: "Préstamo rechazado", prestamo: prestamoPopulado });
    }
  } catch (error) {
    console.error("Error al confirmar préstamo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Finalizar préstamo - Devolución (docente devuelve los recursos)
const finalizarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacionesDevolucion } = req.validated || req.body;
    const docenteId = req.docenteBDD._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de préstamo inválido" });
    }

    const prestamoExistente = await prestamo.findById(id);
    if (!prestamoExistente) {
      return res.status(404).json({ msg: "Préstamo no encontrado. Actualiza la tabla para revisar que el préstamo siga activo." });
    }

    // Verificar que el préstamo pertenezca al docente
    if (prestamoExistente.docente.toString() !== docenteId.toString()) {
      return res.status(403).json({ msg: "No tienes permiso para finalizar este préstamo" });
    }

    if (prestamoExistente.estado !== "activo") {
      return res.status(400).json({ msg: "Préstamo no activo o finalizado por el Administrador. Actualiza la tabla." });
    }

    // Finalizar préstamo
    prestamoExistente.estado = "finalizado";
    prestamoExistente.horaDevolucion = new Date();
    if (observacionesDevolucion) {
      prestamoExistente.observaciones += `\n[DEVOLUCIÓN] ${observacionesDevolucion}`;
    }

    // Liberar recurso principal
    await recurso.findByIdAndUpdate(prestamoExistente.recurso, {
      estado: "pendiente",
      asignadoA: null
    });

    // Liberar recursos adicionales
    if (prestamoExistente.recursosAdicionales.length > 0) {
      await recurso.updateMany(
        { _id: { $in: prestamoExistente.recursosAdicionales } },
        { estado: "pendiente", asignadoA: null }
      );
    }

    await prestamoExistente.save();
    res.status(200).json({ msg: "Recurso devuelto exitosamente", prestamo: prestamoExistente });
  } catch (error) {
    console.error("Error al finalizar préstamo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Obtener detalle de préstamo
const obtenerPrestamo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de préstamo inválido" });
    }

    const prestamoExistente = await prestamo
      .findById(id)
      .populate("recurso", "nombre tipo laboratorio aula contenido")
      .populate("docente", "nombreDocente apellidoDocente emailDocente celularDocente")
      .populate("admin", "nombre apellido email")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido");

    if (!prestamoExistente) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }

    res.status(200).json(prestamoExistente);
  } catch (error) {
    console.error("Error al obtener préstamo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Cancelar préstamo pendiente (admin cancela la solicitud de prestamo pendiente enviada a algun docente)
const cancelarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;

    const prestamoEncontrado = await prestamo.findById(id);

    if (!prestamoEncontrado) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }

    // Solo se puede cancelar si está pendiente
    if (prestamoEncontrado.estado !== "pendiente") {
      return res.status(400).json({
        msg: "Solo se pueden cancelar préstamos pendientes"
      });
    }

    // Actualizar estado del préstamo
    prestamoEncontrado.estado = "rechazado";
    prestamoEncontrado.observaciones += `\n[CANCELADO - ADMIN] ${motivoCancelacion || "Cancelado por el administrador"}`;
    await prestamoEncontrado.save();

    // Liberar el recurso principal
    const recursoEncontrado = await recurso.findById(prestamoEncontrado.recurso);
    if (recursoEncontrado) {
      recursoEncontrado.estado = "pendiente";
      recursoEncontrado.asignadoA = null;
      await recursoEncontrado.save();
    }

    // Liberar recursos adicionales también
    if (prestamoEncontrado.recursosAdicionales && prestamoEncontrado.recursosAdicionales.length > 0) {
      await recurso.updateMany(
        { _id: { $in: prestamoEncontrado.recursosAdicionales } },
        {
          estado: "pendiente",
          asignadoA: null
        }
      );
    }

    //Populate para enviar datos completos
    const prestamoPopulado = await prestamo
      .findById(prestamoEncontrado._id)
      .populate("recurso", "nombre tipo laboratorio aula contenido")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido");

    res.status(200).json({
      msg: "Préstamo cancelado exitosamente",
      prestamo: prestamoPopulado,
    });
  } catch (error) {
    console.error("Error al cancelar préstamo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Finalizar préstamo (admin finaliza el prestamo activo de un docente en caso de que el docente se haya olvidado)
const finalizarPrestamoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacionesDevolucion } = req.body;

    const prestamoEncontrado = await prestamo.findById(id);

    if (!prestamoEncontrado) {
      return res.status(404).json({ msg: "Préstamo no encontrado" });
    }

    // Solo se puede finalizar si está activo
    if (prestamoEncontrado.estado !== "activo") {
      return res.status(400).json({
        msg: "Solo se pueden finalizar préstamos activos"
      });
    }

    // Actualizar estado del préstamo y guardar observaciones correctamente
    prestamoEncontrado.estado = "finalizado";
    prestamoEncontrado.horaDevolucion = new Date();

    // Agregar observaciones al campo existente en lugar de crear un campo nuevo
    if (observacionesDevolucion) {
      prestamoEncontrado.observaciones += `\n[DEVOLUCIÓN - ADMIN] ${observacionesDevolucion}`;
    } else {
      prestamoEncontrado.observaciones += `\n[DEVOLUCIÓN - ADMIN] Finalizado por el administrador`;
    }

    await prestamoEncontrado.save();

    // Liberar el recurso principal
    const recursoEncontrado = await recurso.findById(prestamoEncontrado.recurso);
    if (recursoEncontrado) {
      recursoEncontrado.estado = "pendiente";
      recursoEncontrado.asignadoA = null;
      await recursoEncontrado.save();
    }

    //Liberar recursos adicionales
    if (prestamoEncontrado.recursosAdicionales && prestamoEncontrado.recursosAdicionales.length > 0) {
      await recurso.updateMany(
        { _id: { $in: prestamoEncontrado.recursosAdicionales } },
        {
          estado: "pendiente",
          asignadoA: null
        }
      );
    }

    const prestamoPopulado = await prestamo
      .findById(prestamoEncontrado._id)
      .populate("recurso", "nombre tipo laboratorio aula contenido")
      .populate("recursosAdicionales", "nombre tipo laboratorio aula contenido");

    res.status(200).json({
      msg: "Préstamo finalizado exitosamente por el administrador",
      prestamo: prestamoPopulado,
    });
  } catch (error) {
    console.error("Error al finalizar préstamo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

export {
  crearPrestamo,
  listarPrestamosAdmin,
  listarPrestamosDocente,
  historialPrestamosDocente,
  confirmarPrestamo,
  finalizarPrestamo,
  obtenerPrestamo,
  cancelarPrestamo,
  finalizarPrestamoAdmin,
};
