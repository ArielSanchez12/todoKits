import { Router } from "express";
import pusher from "../config/pusher.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import Mensaje from "../models/mensaje.js";

const router = Router();

router.post("/chat/send", verificarTokenJWT, async (req, res) => {
  const { texto, para, paraTipo } = req.body;
  const de = req.docenteBDD?._id || req.adminEmailBDD?._id;
  const deTipo = req.docenteBDD ? "docente" : "admin";
  // Guarda el mensaje
  const mensaje = await Mensaje.create({ texto, de, deTipo, para, paraTipo });
  // Notifica en tiempo real
  pusher.trigger("chat", "nuevo-mensaje", {
    _id: mensaje._id,
    texto,
    de,
    deTipo,
    para,
    paraTipo,
    createdAt: mensaje.createdAt,
  });
  res.json(mensaje);
});

router.get("/chat/chat-history/:userId", verificarTokenJWT, async (req, res) => {
  const miId = req.docenteBDD?._id || req.adminEmailBDD?._id;
  const userId = req.params.userId;
  // Busca mensajes entre los dos usuarios
  const mensajes = await Mensaje.find({
    $or: [
      { de: miId, para: userId },
      { de: userId, para: miId }
    ]
  }).sort({ createdAt: 1 });
  res.json(mensajes);
});

export default router;