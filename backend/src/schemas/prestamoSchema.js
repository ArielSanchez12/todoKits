import { z } from "zod";

// Schema para crear préstamo
export const createPrestamoSchema = z.object({
  recurso: z.string().min(1, "Recurso es requerido"),
  docente: z.string().min(1, "Docente es requerido"),
  motivo: z.object({
    tipo: z.enum(["Clase", "Conferencia", "Otro"], {
      errorMap: () => ({ message: "Tipo de motivo inválido" })
    }),
    descripcion: z.string().optional(),
  }).refine((data) => {
    // Si el tipo es "Otro", descripcion es obligatoria
    if (data.tipo === "Otro") {
      return data.descripcion && data.descripcion.trim().length > 0;
    }
    return true;
  }, {
    message: "La descripción es requerida cuando el motivo es 'Otro'",
    path: ["descripcion"],
  }),
  observaciones: z.string().optional(),
});

// Schema para confirmar préstamo (docente)
export const confirmarPrestamoSchema = z.object({
  confirmar: z.boolean(),
  motivoRechazo: z.string().optional(),
});

// Schema para finalizar préstamo (docente devuelve)
export const finalizarPrestamoSchema = z.object({
  observacionesDevolucion: z.string().optional(),
});