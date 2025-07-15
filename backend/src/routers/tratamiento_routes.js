import { Router } from "express";
import { listarTratamiento, registrarTratamiento, eliminarTratamiento } from "../controllers/tratamiento_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";


const router = Router()

router.post('/tratamiento/register', verificarTokenJWT, registrarTratamiento)
router.get('/tratamiento/list', verificarTokenJWT, listarTratamiento)
router.delete('/tratamiento/:id',verificarTokenJWT, eliminarTratamiento)


export default router