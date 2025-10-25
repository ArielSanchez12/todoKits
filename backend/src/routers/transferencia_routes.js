import { Router } from "express";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import {
  crearTransferencia,
  obtenerTransferenciaPorQR,
  confirmarTransferenciaOrigen,
  responderTransferenciaDestino,
  listarTransferencias,
} from "../controllers/transferencia_controller.js";

const router = Router();

// Admin crea solicitud de transferencia
router.post("/administrador/transferencia/crear", verificarTokenJWT, crearTransferencia);

// Listar transferencias (Admin)
router.get("/administrador/transferencias", verificarTokenJWT, listarTransferencias);

// Obtener transferencia por código QR (Público para escaneo)
router.get("/transferencia/:codigoQR", obtenerTransferenciaPorQR);

// Docente origen confirma transferencia (escanea QR)
router.patch("/docente/transferencia/:codigoQR/confirmar", verificarTokenJWT, confirmarTransferenciaOrigen);

// Docente destino responde a la transferencia
router.patch("/docente/transferencia/:codigoQR/responder", verificarTokenJWT, responderTransferenciaDestino);

export default router;