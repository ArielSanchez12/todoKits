import { Router } from "express";
import Mensaje from "../models/mensaje.js";
import Docente from "../models/docente.js";
import Admin from "../models/admin.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import Pusher from "pusher";
import Transferencia from "../models/transferencia.js";

const router = Router();

// Configura Pusher con tus claves
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
  const admin = await Admin.findById(req.docenteBDD.admin).select("_id nombre apellido direccion celular email rol avatar avatarIA");
  if (!admin) return res.status(404).json({ msg: "Admin no encontrado" });
  // Mapea los campos para el frontend, incluyendo avatar y avatarIA (por compatibilidad)
  res.json({
    _id: admin._id,
    nombre: admin.nombre,
    apellido: admin.apellido,
    avatar: admin.avatar,
    email: admin.email,
    rol: admin.rol
  });
});
//este comentario es solo para poder hace commit
// Obtener docentes del admin autenticado
router.get("/chat/docentes", verificarTokenJWT, async (req, res) => {
  if (!req.adminEmailBDD) return res.status(401).json({ msg: "No autorizado" });
  const docentes = await Docente.find({ admin: req.adminEmailBDD._id })
    .select("_id nombreDocente apellidoDocente avatarDocente avatarDocenteIA avatar avatarIA emailDocente");
  res.json(docentes);
});

router.post("/chat/send", verificarTokenJWT, async (req, res) => {
  const { texto, de, deNombre, para, paraNombre, deTipo, paraTipo } = req.body;
  const mensaje = await Mensaje.create({ texto, de, deNombre, para, paraNombre, deTipo, paraTipo });
  // Emitir evento a Pusher
  pusher.trigger("chat", "nuevo-mensaje", mensaje);
  res.json(mensaje);
});

// Obtener historial de chat entre el usuario autenticado y otro usuario
router.get("/chat/chat-history/:contactId", verificarTokenJWT, async (req, res) => {
  const miId = req.docenteBDD?._id || req.adminEmailBDD?._id;
  const contactId = req.params.contactId;
  const mensajes = await Mensaje.find({
    $or: [
      { de: miId, para: contactId },
      { de: contactId, para: miId }
    ]
  }).sort({ createdAt: 1 });
  res.json(mensajes);
});

// Obtener todos los mensajes del chat del usuario autenticado
router.get("/chat/all-messages/:userId", verificarTokenJWT, async (req, res) => {
  const { userId } = req.params;
  const mensajes = await Mensaje.find({
    $or: [{ de: userId }, { para: userId }]
  }).sort({ createdAt: 1 });
  res.json(mensajes);
});

router.post("/chat/enviar-transferencia", verificarTokenJWT, async (req, res) => {
  try {
    const { codigoTransferencia, docenteDestinoId } = req.body;

    // Validar que sea admin
    if (!req.adminEmailBDD) {
      return res.status(403).json({ msg: "Solo administradores pueden enviar transferencias" });
    }

    // Buscar la transferencia
    const transferencia = await Transferencia.findOne({ codigoQR: codigoTransferencia })
      .populate("prestamoOriginal")
      .populate("recursos", "nombre")
      .populate("recursosAdicionales", "nombre")
      .populate("docenteOrigen", "nombreDocente apellidoDocente")
      .populate("docenteDestino", "nombreDocente apellidoDocente");

    if (!transferencia) {
      return res.status(404).json({ msg: "Transferencia no encontrada" });
    }

    // Verificar que el docente destino sea correcto
    if (transferencia.docenteDestino._id.toString() !== docenteDestinoId) {
      return res.status(400).json({ msg: "El docente destino no coincide" });
    }

    // Construir URL del QR (la misma que usa el backend para generar)
    const urlQR = `${process.env.URL_FRONTEND}dashboard/transferencia/${transferencia.codigoQR}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlQR)}`;

    // Extraer nombres de recursos
    const nombresRecursos = [
      ...transferencia.recursos.map(r => r.nombre),
      ...transferencia.recursosAdicionales.map(r => r.nombre)
    ];
    const nombreDocenteOrigen = `${transferencia.docenteOrigen.nombreDocente} ${transferencia.docenteOrigen.apellidoDocente}`;

    // Crear mensaje especial
    const mensaje = await Mensaje.create({
      texto: `📦 Nueva transferencia de recursos`,
      de: req.adminEmailBDD._id,
      deTipo: "admin",
      para: docenteDestinoId,
      paraTipo: "docente",
      tipo: "transferencia",
      transferencia: {
        codigo: transferencia.codigoQR,
        qrImageUrl: qrImageUrl,
        recursos: nombresRecursos,
        docenteOrigen: nombreDocenteOrigen
      }
    });

    // Emitir evento a Pusher (para que se actualice el chat en tiempo real)
    pusher.trigger("chat", "nuevo-mensaje", mensaje);

    res.json({
      msg: "Transferencia enviada por chat exitosamente",
      mensaje
    });

  } catch (error) {
    console.error("Error al enviar transferencia por chat:", error);
    res.status(500).json({
      msg: "Error al enviar transferencia por chat",
      error: error.message
    });
  }
});

export default router;