import { z } from "zod";

// Solo acepta emails que terminen en @gmail.com (minúsculas)
const emailGmail = /^[a-zA-Z0-9._%+-]{3,}@gmail\.com$/;

// No solo repetidos ni solo espacios
const noSoloRepetidos = (val) => {
  if (!val) return false;
  const sinEspacios = val.replace(/\s/g, "");
  if (sinEspacios.length === 0) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ0-9])\1+$/.test(sinEspacios)) return false;
  return true;
};

export const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .regex(emailGmail, "El correo debe ser un gmail válido y en minúsculas, por ejemplo: usuario@gmail.com")
    .refine(noSoloRepetidos, "El correo no puede ser solo caracteres repetidos ni solo espacios"),
});