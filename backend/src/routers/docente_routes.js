import { Router } from 'express'
import { 
  listarDocentes, 
  loginDocente, 
  perfilDocente, 
  detalleDocente, 
  eliminarDocente, 
  actualizarDocente, 
  actualizarPasswordDocente, 
  recuperarPasswordDocente, 
  crearNuevoPasswordDocente, 
  confirmarNuevoEmailDocente, 
  comprobarTokenPasswordDocente 
} from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'
import { validate } from "../middlewares/zodValidations.js"
import { updateDocenteSchema, updateDocentePasswordSchema } from "../schemas/docenteSchema.js"
import { recuperarPasswordSchema, crearNuevoPasswordSchema } from "../schemas/passwordSchema.js"

const router = Router()

// Rutas existentes con validación ZOD
router.post('/docente/login', loginDocente)
router.get('/docente/profile', verificarTokenJWT, perfilDocente)
router.get("/docente/list", verificarTokenJWT, listarDocentes)
router.get("/docente/:id", verificarTokenJWT, detalleDocente)
router.delete("/docente/delete/:id", verificarTokenJWT, eliminarDocente)
router.put("/docente/update/:id", verificarTokenJWT, validate(updateDocenteSchema), actualizarDocente)

// Nuevas rutas para manejar contraseña y correo similar a admin
router.put("/docente/actualizarpassword/:id", verificarTokenJWT, validate(updateDocentePasswordSchema), actualizarPasswordDocente)
router.get("/docente/confirm-new-email/:token", confirmarNuevoEmailDocente)

// Rutas para recuperación de contraseña
router.post('/docente/passwordrecovery', validate(recuperarPasswordSchema), recuperarPasswordDocente)
router.get('/docente/passwordrecovery/:token', comprobarTokenPasswordDocente)
router.post('/docente/newpassword/:token', validate(crearNuevoPasswordSchema), crearNuevoPasswordDocente)

export default router