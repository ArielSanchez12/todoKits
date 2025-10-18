import { Router } from 'express'
import { 
  loginDocente, 
  perfilDocente, 
  actualizarPasswordDocente, 
  recuperarPasswordDocente, 
  crearNuevoPasswordDocente, 
  confirmarNuevoEmailDocente, 
  comprobarTokenPasswordDocente,
  confirmarMailDocente
} from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'
import { validate } from "../middlewares/zodValidations.js"
import { updateDocentePasswordSchema } from "../schemas/docenteSchema.js"
import { recuperarPasswordSchema, crearNuevoPasswordSchema } from "../schemas/passwordSchema.js"

const router = Router()

// Rutas existentes con validación ZOD
router.get('/docente/confirm/:token', confirmarMailDocente)
router.post('/docente/login', loginDocente)
router.get('/docente/profile', verificarTokenJWT, perfilDocente)

// Nuevas rutas para manejar contraseña y correo similar a admin
router.put("/docente/actualizarpassword/:id", verificarTokenJWT, validate(updateDocentePasswordSchema), actualizarPasswordDocente)
router.get("/docente/confirm-new-email/:token", confirmarNuevoEmailDocente)

// Rutas para recuperación de contraseña
router.post('/docente/passwordrecovery', validate(recuperarPasswordSchema), recuperarPasswordDocente)
router.get('/docente/passwordrecovery/:token', comprobarTokenPasswordDocente)
router.post('/docente/newpassword/:token', validate(crearNuevoPasswordSchema), crearNuevoPasswordDocente)

export default router