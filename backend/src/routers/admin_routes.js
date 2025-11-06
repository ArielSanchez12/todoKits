import { Router } from "express";
import { 
  confirmarMail, 
  registro, 
  perfil, 
  actualizarPerfil, 
  actualizarPassword, 
  confirmarNuevoEmail, 
  registrarDocente, 
  listarDocentes,
  eliminarDocente,
  actualizarDocente,
  detalleDocente
} from "../controllers/admin_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import { validate } from "../middlewares/zodValidations.js"
import { registerSchema } from "../schemas/registerSchema.js"
import { updateProfileSchema, updatePasswordSchema } from "../schemas/profileSchema.js";
import { registerDocenteSchema } from "../schemas/docenteSchema.js";
import { updateDocenteSchema } from "../schemas/docenteSchema.js";

const router = Router()

//Aqui ya se completa esta ruta http://localhost:3000/api/registro
router.post('/register', validate(registerSchema), registro)
//Verbo  Ruta     Controlador

router.get('/confirm/:token', confirmarMail)
router.get('/perfil', verificarTokenJWT, perfil) //verificarTokenJWT es un MIDDLEWARE que se ejecuta antes de llegar al controlador perfil (así protegemos la ruta de acceso al perfil del administrador)
router.put('/administrador/:id', verificarTokenJWT, validate(updateProfileSchema), actualizarPerfil)
router.put('/administrador/actualizarpassword/:id', verificarTokenJWT, validate(updatePasswordSchema), actualizarPassword)
router.get('/administrador/confirm-new-email/:token', confirmarNuevoEmail); // Ruta para confirmar email nuevo después de cambiarlo

// Rutas para gestionar docentes
// Nueva ruta para que los administradores creen docentes
router.post('/administrador/registerDocente', verificarTokenJWT, validate(registerDocenteSchema), registrarDocente)
// Ruta para listar docentes (protegida)
router.get("/administrador/listDocentes", verificarTokenJWT, listarDocentes)
// Ruta para eliminar un docente (protegida)
router.delete("/administrador/deleteDocente/:id", verificarTokenJWT, eliminarDocente)
// Ruta para actualizar un docente (protegida)
router.put("/administrador/updateDocente/:id", verificarTokenJWT, validate(updateDocenteSchema), actualizarDocente)
// Ruta para obtener detalles de un docente (protegida)
router.get("/administrador/detailsDocente/:id", verificarTokenJWT, detalleDocente)




export default router