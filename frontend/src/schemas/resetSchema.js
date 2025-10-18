import { z } from "zod";

const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;

export const resetSchema = z.object({
  password: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(12, "La contraseña debe tener máximo 12 caracteres")
    .regex(
      passwordFuerte,
      "La contraseña debe tener mayúscula, minúscula, número, símbolo y entre 8 y 12 caracteres"
    ),
  confirmPassword: z
    .string()
    .trim()
    .min(8, "La confirmación es requerida")
    .max(12, "La confirmación no puede exceder los 12 caracteres")
})
  .refine(
    data => data.password === data.confirmPassword,
    { message: "Las contraseñas no coinciden", path: ["confirmPassword"] }
  );