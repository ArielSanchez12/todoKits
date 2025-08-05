import { Router } from "express";
import Mensaje from "../models/mensaje.js";
import Docente from "../models/docente.js";
import Admin from "../models/admin.js";
import router from "./admin_routes.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";

const router = Router();
// Obtener admin del docente autenticado
router.get("/chat/admin", verificarTokenJWT, async (req, res) => {
  if (!req.docenteBDD) return res.status(401).json({ msg: "No autorizado" });
  const admin = await Admin.findById(req.docenteBDD.admin).select("_id nombreAdmin apellidoAdmin avatarAdmin emailAdmin");
  res.json(admin);
});

// Obtener docentes del admin autenticado
router.get("/chat/docentes", verificarTokenJWT, async (req, res) => {
  if (!req.adminEmailBDD) return res.status(401).json({ msg: "No autorizado" });
  const docentes = await Docente.find({ admin: req.adminEmailBDD._id }).select("_id nombreDocente apellidoDocente avatarDocente emailDocente");
  res.json(docentes);
});

router.post("/chat/send", verificarTokenJWT, async (req, res) => {
  const { texto, de, deNombre, para, paraNombre, deTipo, paraTipo } = req.body;
  const mensaje = await Mensaje.create({ texto, de, deNombre, para, paraNombre, deTipo, paraTipo });
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

export default router;