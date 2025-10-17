import { Router } from "express";
import { comprobarTokenPassword, confirmarMail, crearNuevoPassword, login, recuperarPassword, registro, perfil, actualizarPerfil, actualizarPassword, confirmarNuevoEmail } from "../controllers/admin_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import { validate } from "../middlewares/zodValidations.js"
import { registerSchema } from "../schemas/registerSchema.js"
import { updateProfileSchema, updatePasswordSchema } from "../schemas/profileSchema.js";

const router = Router()

//Aqui ya se completa esta ruta http://localhost:3000/api/registro
router.post('/register', validate(registerSchema), registro)
//Verbo  Ruta     Controlador

router.get('/confirm/:token', confirmarMail)
router.post('/passwordrecovery', recuperarPassword)
router.get('/passwordrecovery/:token', comprobarTokenPassword)
router.post('/newpassword/:token', crearNuevoPassword)
router.post('/login', login)
router.get('/perfil', verificarTokenJWT, perfil) //verificarTokenJWT es un MIDDLEWARE que se ejecuta antes de llegar al controlador perfil (así protegemos la ruta de acceso al perfil del administrador)
router.put('/administrador/:id', verificarTokenJWT, validate(updateProfileSchema), actualizarPerfil)
router.put('/administrador/actualizarpassword/:id', verificarTokenJWT, validate(updatePasswordSchema), actualizarPassword)
router.get('/administrador/confirm-new-email/:token', confirmarNuevoEmail); // Ruta para confirmar email nuevo después de cambiarlo

export default router