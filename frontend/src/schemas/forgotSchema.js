import { z } from "zod";

//Este esquema es para validar el email al momento de solicitar el reseteo de contraseña
const emailGmail = /^[a-z0-9._%+-]+@gmail\.com$/;

export const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El email es requerido")
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
    .transform(val => val.toLowerCase())
});