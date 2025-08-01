import { Router } from 'express'
import { listarDocentes, registrarDocente, loginDocente, perfilDocente, detalleDocente, eliminarDocente, actualizarDocente } from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'

const router = Router()

router.post('/docente/register', verificarTokenJWT, registrarDocente)
router.post('/docente/login', loginDocente)
router.get('/docente/profile', verificarTokenJWT, perfilDocente)
router.get("/docente/list", verificarTokenJWT, listarDocentes)
router.get("/docente/:id", verificarTokenJWT, detalleDocente)
router.delete("/docente/delete/:id", verificarTokenJWT, eliminarDocente)
router.put("/docente/update/:id", verificarTokenJWT, actualizarDocente)

export default router