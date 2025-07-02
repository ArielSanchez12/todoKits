import {Router} from 'express'
import { listarDocentes, registrarDocente } from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'

const router = Router()

router.post('/docente/register',verificarTokenJWT,registrarDocente)
router.get("/docente",verificarTokenJWT,listarDocentes)

export default router