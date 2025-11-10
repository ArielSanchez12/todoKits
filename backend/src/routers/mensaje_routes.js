import { Router } from "express";
import {
  obtenerAdmin,
  obtenerDocentes,
  enviarMensaje,
  obtenerHistorial,
  ocultarMensaje,
  ocultarMultiples,
  obtenerTodosMensajes,
  enviarTransferencia,
  marcarLeidos,
  editarMensaje,
  eliminarMensaje,
  eliminarMultiples
} from "../controllers/mensaje_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";

const router = Router();

// Obtener contactos
router.get("/chat/admin", verificarTokenJWT, obtenerAdmin);
router.get("/chat/docentes", verificarTokenJWT, obtenerDocentes);

// Mensajes básicos
router.post("/chat/send", verificarTokenJWT, enviarMensaje);
router.get("/chat/chat-history/:contactId", verificarTokenJWT, obtenerHistorial);
router.get("/chat/all-messages/:userId", verificarTokenJWT, obtenerTodosMensajes);

// Ocultar mensajes
router.post("/chat/message/:id/hide", verificarTokenJWT, ocultarMensaje);
router.post("/chat/messages/hide-many", verificarTokenJWT, ocultarMultiples);

// Transferencias
router.post("/chat/enviar-transferencia", verificarTokenJWT, enviarTransferencia);

// Marcar leídos
router.patch("/chat/read", verificarTokenJWT, marcarLeidos);

// Editar y eliminar
router.patch("/chat/message/:id", verificarTokenJWT, editarMensaje);
router.delete("/chat/message/:id", verificarTokenJWT, eliminarMensaje);
router.post("/chat/messages/delete-many", verificarTokenJWT, eliminarMultiples);

export default router;