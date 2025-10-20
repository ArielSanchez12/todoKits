import { Router } from "express";
import {
  crearRecurso,
  listarRecursos,
  listarRecursosPorTipo,
  obtenerRecurso,
  actualizarRecurso,
  actualizarRecursoCompleto,
  eliminarRecurso,
} from "../controllers/recurso_controller.js";
import { verificarTokenJWT } from "../middlewares/jwt.js";
import { validate } from "../middlewares/zodValidations.js";
import { createRecursoSchema, updateRecursoSchema, updateRecursoCompletoSchema } from "../schemas/recursoSchema.js";

const router = Router();

// Crear recurso (protegido)
router.post("/administrador/recurso/crear", verificarTokenJWT, validate(createRecursoSchema), crearRecurso);

// Listar todos los recursos del admin (protegido)
router.get("/administrador/recursos", verificarTokenJWT, listarRecursos);

// Listar recursos por tipo (protegido)
router.get("/administrador/recursos/:tipo", verificarTokenJWT, listarRecursosPorTipo);

// Obtener recurso por ID (protegido)
router.get("/administrador/recurso/:id", verificarTokenJWT, obtenerRecurso);

//Actualizar recurso completo (edición de campos)
router.patch("/administrador/recurso/editar/:id", verificarTokenJWT, validate(updateRecursoCompletoSchema), actualizarRecursoCompleto);


// Actualizar recurso (protegido)
router.put("/administrador/recurso/:id", verificarTokenJWT, validate(updateRecursoSchema), actualizarRecurso);

// Eliminar recurso (protegido)
router.delete("/administrador/recurso/:id", verificarTokenJWT, eliminarRecurso);

export default router;