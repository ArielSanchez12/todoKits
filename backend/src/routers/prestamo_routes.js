import { Router } from "express";
import {
  crearPrestamo,
  listarPrestamosAdmin,
  listarPrestamosDocente,
  historialPrestamosDocente,
  confirmarPrestamo,
  finalizarPrestamo,
  obtenerPrestamo,
  cancelarPrestamo,
  finalizarPrestamoAdmin,
} from "../controllers/prestamo_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import { validate } from "../middlewares/zodValidations.js";
import { 
  createPrestamoSchema,
  confirmarPrestamoSchema,
  finalizarPrestamoSchema
} from "../schemas/prestamoSchema.js";

const router = Router();

// RUTAS DEL ADMINISTRADOR PARA LOS PRESTAMOS

// Crear solicitud de préstamo 
router.post("/administrador/prestamo/crear", verificarTokenJWT, validate(createPrestamoSchema), crearPrestamo);

// Listar todos los préstamos del admin
router.get("/administrador/prestamos", verificarTokenJWT, listarPrestamosAdmin);

// Obtener detalle de un préstamo específico
router.get("/administrador/prestamo/:id", verificarTokenJWT, obtenerPrestamo);
// Cancelar un préstamo
router.patch("/administrador/prestamo/:id/cancelar",verificarTokenJWT,cancelarPrestamo);

// Finalizar préstamo - Devolver recurso (Admin)
router.patch("/administrador/prestamo/:id/finalizar",verificarTokenJWT,validate(finalizarPrestamoSchema),finalizarPrestamoAdmin);


// RUTAS DEL DOCENTE PARA LOS PRESTAMOS
// Listar préstamos activos y pendientes del docente
router.get("/docente/prestamos", verificarTokenJWT, listarPrestamosDocente);

// Historial de préstamos del docente
router.get("/docente/prestamos/historial", verificarTokenJWT, historialPrestamosDocente);

// Confirmar o rechazar préstamo (Docente)
router.patch("/docente/prestamo/:id/confirmar", verificarTokenJWT, validate(confirmarPrestamoSchema), confirmarPrestamo);

// Finalizar préstamo - Devolver recurso (Docente)
router.patch("/docente/prestamo/:id/finalizar", verificarTokenJWT, validate(finalizarPrestamoSchema), finalizarPrestamo);

// Obtener detalle de préstamo (Docente)
router.get("/docente/prestamo/:id", verificarTokenJWT, obtenerPrestamo);

export default router;