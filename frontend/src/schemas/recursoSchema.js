import { z } from "zod";

export const recursoFormSchema = z.object({
  tipo: z.enum(["kit", "llave", "proyector"]),
  laboratorio: z.string().optional(),
  aula: z.string().optional(),
  contenido: z.array(z.string().min(1, "El contenido no puede estar vacío")).optional(),
}).refine(
  (data) => {
    if ((data.tipo === "kit" || data.tipo === "llave") && !data.laboratorio) {
      return false;
    }
    return true;
  },
  {
    message: "Laboratorio es requerido",
    path: ["laboratorio"],
  }
).refine(
  (data) => {
    if ((data.tipo === "kit" || data.tipo === "proyector")) {
      const contenidoFiltrado = data.contenido?.filter((c) => c.trim()) || [];
      if (contenidoFiltrado.length === 0) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Debe agregar al menos un elemento",
    path: ["contenido"],
  }
);