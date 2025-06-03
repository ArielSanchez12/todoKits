import { Router } from "express";
import { comprobarTokenPassword, confirmarMail, recuperarPassword, registro } from "../controllers/admin_controller.js";

const router = Router()

//Aqui ya se completa esta ruta http://localhost:3000/api/registro
router.post('/registro', registro)
       //Verbo  Ruta     Controlador

router.get('/confirmar/:token', confirmarMail)
router.post('/recuperarPassword', recuperarPassword)
router.get('/recuperarPassword/:token', comprobarTokenPassword)

export default router