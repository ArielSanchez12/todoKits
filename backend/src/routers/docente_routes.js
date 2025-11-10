import { Router } from 'express'
import { 
  perfilDocente, 
  confirmarMailDocente,
  actualizarPerfilDocente,
  actualizarPasswordDocente
} from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'
import { validate } from "../middlewares/zodValidations.js"
import { conditionalValidate } from "../middlewares/conditionalValidation.js"
import { 
  updateDocenteProfileSchema,
  updateDocentePasswordSchema
} from "../schemas/docenteSchema.js"

const router = Router()

// Confirmación de email inicial (cuando el admin crea al docente)
router.get('/docente/confirm/:token', confirmarMailDocente)

// Perfil del docente (protegido)
router.get('/docente/profile', verificarTokenJWT, perfilDocente)

// Actualizar perfil del docente (solo email y foto con los cards) (protegido)
router.put('/docente/actualizarperfil/:id', verificarTokenJWT, conditionalValidate(updateDocenteProfileSchema), actualizarPerfilDocente)

// Actualizar contraseña del docente
router.put('/docente/actualizarpassword/:id', verificarTokenJWT, validate(updateDocentePasswordSchema), actualizarPasswordDocente)

// Confirmar cambio de email
router.get("/docente/confirm-new-email/:token", confirmarNuevoEmailDocente)

// Actualizar contraseña del docente (protegido)
//router.put("/docente/actualizarpassword/:id", verificarTokenJWT, validate(updateDocentePasswordSchema), actualizarPasswordDocente)

export default router