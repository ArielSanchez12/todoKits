import { z } from "zod";

const emailGmail = /^[a-z0-9._%+-]+@gmail\.com$/;

export const formProfileDocenteSchema = z.object({
  emailDocente: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
    .refine((val) => val === val.toLowerCase(), "El correo debe estar en minúsculas")
    .transform(val => val.toLowerCase())
    .optional()
});