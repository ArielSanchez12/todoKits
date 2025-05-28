import { Router } from "express";
import { confirmarMail, registro } from "../controllers/admin_controller.js";

const router = Router()

//Aqui ya se completa esta ruta http://localhost:3000/api/registro
router.post('/registro', registro)
       //Verbo  Ruta     Controlador

router.get('/confirmar/:token', confirmarMail)

export default router