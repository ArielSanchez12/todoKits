import { Router } from "express";
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, recuperarPassword, registro } from "../controllers/admin_controller.js";

const router = Router()

//Aqui ya se completa esta ruta http://localhost:3000/api/registro
router.post('/register', registro)
       //Verbo  Ruta     Controlador

router.get('/confirm/:token', confirmarMail)
router.post('/passwordrecovery', recuperarPassword)
router.get('/passwordrecovery/:token', comprobarTokenPassword)
router.post('/newpassword/:token', crearNuevoPassword)
router.post('/login', login)
router.get('/perfil', perfil)


export default router