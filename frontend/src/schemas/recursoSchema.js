import { z } from "zod";

// Schema para cada tipo de recurso
export const recursoFormSchema = z.discriminatedUnion("tipo", [
  // Schema para KIT
  z.object({
    tipo: z.literal("kit"),
    laboratorio: z.string().min(1, "Laboratorio es requerido"),
    aula: z.string().min(1, "Aula es requerida"),
    contenido: z.array(z.string().min(1)).min(1, "Debe agregar al menos un elemento"),
  }),
  
  // Schema para LLAVE
  z.object({
    tipo: z.literal("llave"),
    laboratorio: z.string().min(1, "Laboratorio es requerido"),
    aula: z.string().min(1, "Aula es requerida"),
    contenido: z.array(z.string()).optional(),
  }),
  
  // Schema para PROYECTOR
  z.object({
    tipo: z.literal("proyector"),
    laboratorio: z.string().optional(),
    aula: z.string().optional(),
    contenido: z.array(z.string().min(1)).min(1, "Debe agregar al menos un elemento"),
  }),
]);