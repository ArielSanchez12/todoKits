import { Router } from "express";
import pusher from "../config/pusher.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import Mensaje from "../models/mensaje.js";

const router = Router();

router.post("/chat/send", verificarTokenJWT, async (req, res) => {
  const { texto, para, paraTipo, paraNombre } = req.body;
  const de = req.docenteBDD?._id || req.adminEmailBDD?._id;
  const deTipo = req.docenteBDD ? "docente" : "admin";
  const deNombre = req.docenteBDD?.nombreDocente || req.adminEmailBDD?.nombreAdmin || "Desconocido";
  // Guarda el mensaje
  const mensaje = await Mensaje.create({ texto, de, deTipo, deNombre, para, paraTipo, paraNombre });
  // Notifica en tiempo real
  pusher.trigger("chat", "nuevo-mensaje", {
    _id: mensaje._id,
    texto,
    de,
    deTipo,
    deNombre,
    para,
    paraTipo,
    paraNombre,
    createdAt: mensaje.createdAt,
  });
  res.json(mensaje); // <-- Esto asegura que la respuesta es JSON
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