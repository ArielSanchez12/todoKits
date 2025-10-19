import { Router } from "express";
import { 
    recuperarPasswordUniversal, 
    comprobarTokenPasswordUniversal, 
    crearNuevoPasswordUniversal 
} from "../controllers/auth_controller.js";
import { validate } from "../middlewares/zodValidations.js";
import { recuperarPasswordSchema, crearNuevoPasswordSchema } from "../schemas/passwordSchema.js";

const router = Router();

// Rutas unificadas para recuperación de contraseña (admin y docente)
router.post('/passwordrecovery', validate(recuperarPasswordSchema), recuperarPasswordUniversal);
router.get('/passwordrecovery/:token', comprobarTokenPasswordUniversal);
router.post('/newpassword/:token', validate(crearNuevoPasswordSchema), crearNuevoPasswordUniversal);

export default router;