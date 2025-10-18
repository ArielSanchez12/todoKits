import { z } from "zod";

const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;

export const cardPasswordSchema = z.object({
  passwordactual: z
    .string()
    .min(1, "La contraseña actual es requerida"),

  passwordnuevo: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(12, "La contraseña debe tener máximo 12 caracteres")
    .regex(
      passwordFuerte,
      "La contraseña debe tener mayúscula, minúscula, número, símbolo y entre 8 y 12 caracteres"
    ),

  confirmpassword: z
    .string()
    .trim()
    .min(1, "La confirmación de contraseña es requerida")
    .max(12, "La confirmación de contraseña no puede exceder los 12 caracteres")
})
  .refine(
    data => data.passwordnuevo === data.confirmpassword,
    { message: "Las contraseñas no coinciden", path: ["confirmpassword"] }
  )
  .refine(
    data => data.passwordactual !== data.passwordnuevo,
    { message: "La nueva contraseña debe ser diferente a la actual", path: ["passwordnuevo"] }
  );