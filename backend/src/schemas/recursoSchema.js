import { z } from "zod";

// Schema para crear KIT
const kitSchema = z.object({
  tipo: z.literal("kit"),
  laboratorio: z.string().min(1, "Laboratorio es requerido"),
  aula: z.string().min(1, "Aula es requerida"),
  contenido: z.array(z.string().min(1)).min(1, "Debe agregar al menos un elemento al contenido"),
});

// Schema para crear LLAVE
const llaveSchema = z.object({
  tipo: z.literal("llave"),
  laboratorio: z.string().min(1, "Laboratorio es requerido"),
  aula: z.string().min(1, "Aula es requerida"),
});

// Schema para crear PROYECTOR
const proyectorSchema = z.object({
  tipo: z.literal("proyector"),
  contenido: z.array(z.string().min(1)).min(1, "Debe agregar al menos un elemento al contenido"),
});

// Schema unificado que discrimina por tipo
export const createRecursoSchema = z.discriminatedUnion("tipo", [
  kitSchema,
  llaveSchema,
  proyectorSchema,
]);

export const updateRecursoSchema = z.object({
  estado: z.enum(["pendiente", "activo", "prestado"]).optional(),
  asignadoA: z.string().optional(),
});

// Schema para actualización completa (edición)
export const updateRecursoCompletoSchema = z.object({
  // Para KIT
  laboratorio: z.string().optional(),
  aula: z.string().optional(),
  contenido: z.array(z.string().min(1)).optional(),
}).refine((data) => {
  // Al menos un campo debe estar presente
  return data.laboratorio || data.aula || data.contenido;
}, {
  message: "Debe proporcionar al menos un campo para actualizar"
});