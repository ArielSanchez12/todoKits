import { Router } from "express";
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, recuperarPassword, registro } from "../controllers/admin_controller.js";

const router = Router()

//Aqui ya se completa esta ruta http://localhost:3000/api/registro
router.post('/registro', registro)
       //Verbo  Ruta     Controlador

router.get('/confirmar/:token', confirmarMail)
router.post('/recuperarPassword', recuperarPassword)
router.get('/recuperarPassword/:token', comprobarTokenPassword)
router.post('/nuevopassword/:token', crearNuevoPassword)
router.post('/login', login)

export default router