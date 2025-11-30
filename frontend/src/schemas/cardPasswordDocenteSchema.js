import { z } from "zod";

const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;

export const cardPasswordDocenteSchema = z.object({
  passwordActualDocente: z
    .string()
    .min(1, "La contraseña actual es requerida"),

  passwordNuevoDocente: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(12, "La contraseña debe tener máximo 12 caracteres")
    .regex(
      passwordFuerte,
      "La contraseña debe tener mayúscula, minúscula, número, símbolo y entre 8 y 12 caracteres"
    ),
  confirmPasswordDocente: z
    .string()
    .trim()
    .min(1, "La confirmación de contraseña es requerida")
    .max(12, "La confirmación de contraseña no puede exceder los 12 caracteres")
})
  .refine(
    data => data.passwordNuevoDocente === data.confirmPasswordDocente,
    { message: "Las contraseñas no coinciden", path: ["confirmPasswordDocente"] }
  )
  .refine(
    data => data.passwordActualDocente !== data.passwordNuevoDocente,
    { message: "La nueva contraseña debe ser diferente a la actual", path: ["passwordNuevoDocente"] }
  );