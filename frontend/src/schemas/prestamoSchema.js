import { z } from "zod";

export const prestamoSchema = z.object({
  recurso: z.string().min(1, "Debe seleccionar un recurso"),
  docente: z.string().min(1, "Debe seleccionar un docente"),
  motivo: z.object({
    tipo: z.enum(["Clase", "Conferencia", "Otro"], {
      errorMap: () => ({ message: "Debe seleccionar un motivo" }),
    }),
    descripcion: z.string().optional(),
  }).refine((data) => {
    if (data.tipo === "Otro") {
      return data.descripcion && data.descripcion.trim().length > 0;
    }
    return true;
  }, {
    message: "Debe especificar el motivo cuando selecciona 'Otro'",
    path: ["descripcion"],
  }),
  observaciones: z.string().optional(),
});

export const confirmarPrestamoSchema = z.object({
  confirmar: z.boolean(),
  motivoRechazo: z.string().optional(),
});

export const finalizarPrestamoSchema = z.object({
  observacionesDevolucion: z.string().optional(),
});