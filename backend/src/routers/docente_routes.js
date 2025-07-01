import {Router} from 'express'
import { registrarDocente } from '../controllers/docente_controller.js'
import { verificarTokenJWT } from '../middlewares/jwt.js'

const router = Router()

router.post('/docente/register',verificarTokenJWT,registrarDocente)

export default router