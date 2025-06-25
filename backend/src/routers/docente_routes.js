import {Router} from 'express'
import { registrarDocente } from '../controllers/docente_controller.js'

const router = Router()

router.post('/docente/registro',registrarDocente)

export default router