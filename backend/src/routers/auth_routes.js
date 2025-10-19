import { Router } from "express";
import { 
    recuperarPasswordUniversal, 
    comprobarTokenPasswordUniversal, 
    crearNuevoPasswordUniversal,
    confirmarCambioEmailUniversal
} from "../controllers/auth_controller.js";
import { validate } from "../middlewares/zodValidations.js";
import { recuperarPasswordSchema, crearNuevoPasswordSchema } from "../schemas/passwordSchema.js";
import docente from "../models/docente.js";

const router = Router();

// Rutas unificadas para recuperación de contraseña (admin y docente)
router.post('/passwordrecovery', validate(recuperarPasswordSchema), recuperarPasswordUniversal);
router.get('/passwordrecovery/:token', comprobarTokenPasswordUniversal);
router.post('/newpassword/:token', validate(crearNuevoPasswordSchema), crearNuevoPasswordUniversal);

// Ruta universal para confirmar cambio de email
router.get('/confirm-email-change/:token', confirmarCambioEmailUniversal);

export default router;