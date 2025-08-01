import { Router } from "express";
import { listarTratamiento, registrarTratamiento, eliminarTratamiento, pagarTratamiento } from "../controllers/tratamiento_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";


const router = Router()

router.post('/tratamiento/register', verificarTokenJWT, registrarTratamiento)
router.get('/tratamiento/list', verificarTokenJWT, listarTratamiento)
router.delete('/tratamiento/:id', verificarTokenJWT, eliminarTratamiento)
router.post('/tratamiento/payment', verificarTokenJWT, pagarTratamiento)


export default router