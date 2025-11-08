import { Router } from "express";
import Mensaje from "../models/mensaje.js";
import Docente from "../models/docente.js";
import Admin from "../models/admin.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import Pusher from "pusher";
import Transferencia from "../models/transferencia.js";

const router = Router();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Obtener admin del docente autenticado
router.get("/chat/admin", verificarTokenJWT, async (req, res) => {
  if (!req.docenteBDD) return res.status(401).json({ msg: "No autorizado" });
  const admin = await Admin.findById(req.docenteBDD.admin).select("_id nombre apellido direccion celular email rol avatar avatarOriginal");
  if (!admin) return res.status(404).json({ msg: "Admin no encontrado" });
  // Mapea los campos para el frontend, incluyendo avatar y avatarOriginal (por compatibilidad)
  res.json({
    _id: admin._id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    avatar: admin.avatar,
    avatarOriginal: admin.avatarOriginal,
    email: admin.email,
    rol: admin.rol
  });
});

// Obtener docentes del admin autenticado
router.get("/chat/docentes", verificarTokenJWT, async (req, res) => {
  if (!req.adminEmailBDD) return res.status(401).json({ msg: "No autorizado" });
  const docentes = await Docente.find({ admin: req.adminEmailBDD._id })
    .select("_id nombreDocente apellidoDocente avatarDocente avatarDocenteOriginal avatar emailDocente");
  res.json(docentes);
});

// ✅ ACTUALIZADO: Enviar mensaje con encriptación automática
router.post("/chat/send", verificarTokenJWT, async (req, res) => {
  try {
    const { texto, de, deNombre, para, paraNombre, deTipo, paraTipo, clientId, replyToId, replyToTexto } = req.body;
    const finalClientId = clientId || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const mensaje = await Mensaje.create({
      texto,
      de,
      deNombre,
      para,
      paraNombre,
      deTipo,
      paraTipo,
      clientId: finalClientId,
      estado: "delivered",
      replyToId: replyToId || null,
      replyToTexto: replyToTexto || null
    });

    const mensajeDesencriptado = mensaje.desencriptar();
    pusher.trigger("chat", "nuevo-mensaje", mensajeDesencriptado);
    res.json(mensajeDesencriptado);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ msg: "Error al enviar mensaje", error: error.message });
  }
});

// Historial: excluir mensajes ocultos para el usuario autenticado
router.get("/chat/chat-history/:contactId", verificarTokenJWT, async (req, res) => {
  try {
    const miId = req.docenteBDD?._id || req.adminEmailBDD?._id;
    const contactId = req.params.contactId;

    const mensajesEncriptados = await Mensaje.find({
      $and: [
        {
          $or: [
            { de: miId, para: contactId },
            { de: contactId, para: miId }
          ]
        },
        { hiddenFor: { $ne: miId } }
      ]
    }).sort({ createdAt: 1 });

    const mensajesDesencriptados = mensajesEncriptados.map(msg => msg.desencriptar());
    res.json(mensajesDesencriptados);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ msg: "Error al obtener historial", error: error.message });
  }
});

// Ocultar (eliminar para mí) un mensaje (cualquier emisor)
router.post("/chat/message/:id/hide", verificarTokenJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const miId = (req.docenteBDD?._id || req.adminEmailBDD?._id)?.toString();
    const msg = await Mensaje.findById(id);
    if (!msg) return res.status(404).json({ msg: "No existe" });

    if (!msg.hiddenFor.map(x => x.toString()).includes(miId)) {
      msg.hiddenFor.push(miId);
      await msg.save();
    }
    pusher.trigger("chat", "mensaje-oculto", { _id: msg._id, userId: miId });
    res.json({ msg: "Ocultado", _id: msg._id });
  } catch (e) {
    res.status(500).json({ msg: "Error ocultando" });
  }
});

// Ocultar múltiples (eliminar para mí)
router.post("/chat/messages/hide-many", verificarTokenJWT, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ msg: "Sin ids" });
    const miId = (req.docenteBDD?._id || req.adminEmailBDD?._id)?.toString();

    await Mensaje.updateMany(
      { _id: { $in: ids } },
      { $addToSet: { hiddenFor: miId } }
    );
    pusher.trigger("chat", "mensajes-ocultos", { ids, userId: miId });
    res.json({ msg: "Ocultados", ids });
  } catch (e) {
    res.status(500).json({ msg: "Error ocultando múltiples" });
  }
});

// ✅ CORREGIDO: Obtener todos los mensajes con sort ANTES de desencriptar
router.get("/chat/all-messages/:userId", verificarTokenJWT, async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Hacer el sort PRIMERO en la query, LUEGO desencriptar
    const mensajesEncriptados = await Mensaje.find({
      $or: [{ de: userId }, { para: userId }]
    }).sort({ createdAt: 1 });

    // ✅ Desencriptar después
    const mensajesDesencriptados = mensajesEncriptados.map(msg => msg.desencriptar());

    res.json(mensajesDesencriptados);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ msg: "Error al obtener mensajes", error: error.message });
  }
});

// ✅ ACTUALIZADO: Enviar transferencia (se encripta automáticamente)
router.post("/chat/enviar-transferencia", verificarTokenJWT, async (req, res) => {
  try {
    const { codigoTransferencia, docenteDestinoId, clientId } = req.body;

    if (!req.adminEmailBDD) {
      return res.status(403).json({ msg: "Solo administradores pueden enviar transferencias" });
    }

    const transferencia = await Transferencia.findOne({ codigoQR: codigoTransferencia })
      .populate("prestamoOriginal")
      .populate("recursos", "nombre")
      .populate("recursosAdicionales", "nombre")
      .populate("docenteOrigen", "nombreDocente apellidoDocente")
      .populate("docenteDestino", "nombreDocente apellidoDocente");

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    if (transferencia.docenteDestino._id.toString() !== docenteDestinoId) {
      return res.status(400).json({ msg: "El docente destino no coincide" });
    }

    const urlQR = `${process.env.URL_FRONTEND}dashboard/transferencia/${transferencia.codigoQR}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlQR)}`;

    const nombresRecursos = [
      ...transferencia.recursos.map(r => r.nombre),
      ...transferencia.recursosAdicionales.map(r => r.nombre)
    ];
    const nombreDocenteOrigen = `${transferencia.docenteOrigen.nombreDocente} ${transferencia.docenteOrigen.apellidoDocente}`;

    const finalClientId = clientId || `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const mensaje = await Mensaje.create({
      texto: `📦 Nueva transferencia de recursos`,
      de: req.adminEmailBDD._id,
      deTipo: "admin",
      para: docenteDestinoId,
      paraTipo: "docente",
      tipo: "transferencia",
      transferencia: {
        codigo: transferencia.codigoQR,
        qrImageUrl,
        recursos: nombresRecursos,
        docenteOrigen: nombreDocenteOrigen
      },
      clientId: finalClientId,
      estado: "delivered"
    });

    const mensajeDesencriptado = mensaje.desencriptar();
    pusher.trigger("chat", "nuevo-mensaje", mensajeDesencriptado);

    res.json({
      msg: "Transferencia enviada por chat exitosamente",
      mensaje: mensajeDesencriptado
    });

  } catch (error) {
    console.error("Error al enviar transferencia por chat:", error);
    res.status(500).json({
      msg: "Error al enviar transferencia por chat",
      error: error.message
    });
  }
});

// Marcar mensajes como leídos (bulk)
router.patch("/chat/read", verificarTokenJWT, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ msg: "Sin ids" });
    await Mensaje.updateMany(
      { _id: { $in: ids }, softDeleted: { $ne: true } },
      { $set: { estado: "read" } }
    );
    const updated = await Mensaje.find({ _id: { $in: ids } });
    const payload = updated.map(m => m.desencriptar());
    pusher.trigger("chat", "mensajes-leidos", payload);
    res.json({ msg: "Leídos", mensajes: payload });
  } catch (e) {
    res.status(500).json({ msg: "Error marcando leídos" });
  }
});

// Editar mensaje (≤10 min, no transferencia)
router.patch("/chat/message/:id", verificarTokenJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoTexto } = req.body;
    if (!nuevoTexto || !nuevoTexto.trim()) return res.status(400).json({ msg: "Texto vacío" });
    const msg = await Mensaje.findById(id);
    if (!msg) return res.status(404).json({ msg: "No existe" });
    const userId = req.docenteBDD?._id || req.adminEmailBDD?._id;
    if (msg.de.toString() !== userId.toString()) return res.status(403).json({ msg: "Sin permiso" });
    if (msg.tipo === "transferencia") return res.status(400).json({ msg: "No se puede editar transferencia" });
    const diffMin = (Date.now() - msg.createdAt.getTime()) / 60000;
    if (diffMin > 10) return res.status(400).json({ msg: "Tiempo de edición expirado" });
    msg.texto = nuevoTexto;
    msg.editedAt = new Date();
    await msg.save();
    const dec = msg.desencriptar();
    pusher.trigger("chat", "mensaje-editado", dec);
    res.json(dec);
  } catch (e) {
    res.status(500).json({ msg: "Error editando" });
  }
});

// Eliminar un mensaje (soft delete para ambos)
router.delete("/chat/message/:id", verificarTokenJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Mensaje.findById(id);
    if (!msg) return res.status(404).json({ msg: "No existe" });
    const userId = req.docenteBDD?._id || req.adminEmailBDD?._id;
    if (msg.de.toString() !== userId.toString()) return res.status(403).json({ msg: "Sin permiso" });
    msg.softDeleted = true;
    msg.texto = " "; // se sobreescribe para encriptar vacío
    await msg.save();
    const dec = msg.desencriptar();
    pusher.trigger("chat", "mensaje-eliminado", { _id: dec._id });
    res.json({ msg: "Eliminado", _id: dec._id });
  } catch (e) {
    res.status(500).json({ msg: "Error eliminando" });
  }
});

// Eliminar múltiples
router.post("/chat/messages/delete-many", verificarTokenJWT, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ msg: "Sin ids" });
    const userId = req.docenteBDD?._id || req.adminEmailBDD?._id;
    const msgs = await Mensaje.find({ _id: { $in: ids } });
    const permitidos = msgs.filter(m => m.de.toString() === userId.toString());
    await Mensaje.updateMany(
      { _id: { $in: permitidos.map(m => m._id) } },
      { $set: { softDeleted: true, texto: " " } }
    );
    pusher.trigger("chat", "mensajes-eliminados", { ids: permitidos.map(m => m._id) });
    res.json({ msg: "Eliminados", ids: permitidos.map(m => m._id) });
  } catch (e) {
    res.status(500).json({ msg: "Error eliminando múltiples" });
  }
});

export default router;