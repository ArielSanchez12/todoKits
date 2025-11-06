import { Router } from 'express'
import { 
  perfilDocente, 
  actualizarPasswordDocente, 
  confirmarNuevoEmailDocente, 
  confirmarMailDocente
} from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'
import { validate } from "../middlewares/zodValidations.js"
import { updateDocentePasswordSchema } from "../schemas/docenteSchema.js"

const router = Router()

// Confirmación de email inicial
router.get('/docente/confirm/:token', confirmarMailDocente)

// Perfil del docente (protegido)
router.get('/docente/profile', verificarTokenJWT, perfilDocente)

// Actualizar contraseña del docente (protegido)
router.put("/docente/actualizarpassword/:id", verificarTokenJWT, validate(updateDocentePasswordSchema), actualizarPasswordDocente)

// Confirmar cambio de email
router.get("/docente/confirm-new-email/:token", confirmarNuevoEmailDocente)

export default router