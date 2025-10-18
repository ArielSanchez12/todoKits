import { z } from "zod";

const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;

const emailGmail = /^[a-z0-9._%+-]+@gmail\.com$/;

// Schema para recuperar contraseña (solo email)
export const recuperarPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El email es requerido")
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas")
    .transform(val => val.toLowerCase())
});

// Schema para crear nueva contraseña (reset)
export const crearNuevoPasswordSchema = z.object({
  password: z
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
    .min(8, "La confirmación es requerida")
    .max(12, "La confirmación no puede exceder los 12 caracteres")
})
  .refine(
    data => data.password === data.confirmpassword,
    { message: "Las contraseñas no coinciden", path: ["confirmpassword"] }
  );