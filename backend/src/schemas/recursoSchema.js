import { z } from "zod";

export const createRecursoSchema = z.object({
  tipo: z.enum(["kit", "llave", "proyector"], {
    errorMap: () => ({ message: "Tipo de recurso inválido" }),
  }),
  laboratorio: z.string().optional(),
  aula: z.string().optional(),
  contenido: z.array(z.string().min(1)).optional(),
}).refine(
  (data) => {
    // Si es kit o llave, laboratorio y aula son requeridos
    if ((data.tipo === "kit" || data.tipo === "llave") && !data.laboratorio) {
      return false;
    }
    return true;
  },
  {
    message: "Laboratorio es requerido para kits y llaves",
    path: ["laboratorio"],
  }
).refine(
  (data) => {
    // Si es proyector, contenido puede ser vacío, pero si es kit o llave lo validamos
    if ((data.tipo === "kit" || data.tipo === "proyector")) {
      const contenidoFiltrado = data.contenido?.filter((c) => c.trim()) || [];
      if (contenidoFiltrado.length === 0) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Debe agregar al menos un elemento al contenido",
    path: ["contenido"],
  }
);

export const updateRecursoSchema = z.object({
  estado: z.enum(["pendiente", "activo", "prestado"]).optional(),
  asignadoA: z.string().optional(),
});