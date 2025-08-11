import { z } from "zod";

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const direccionValida = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/;
const emailGmail = /^[a-zA-Z0-9._%+-]{3,}@gmail\.com$/;

const noSoloRepetidos = (val) => {
  if (!val) return false;
  const sinEspacios = val.replace(/\s/g, "");
  if (sinEspacios.length === 0) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ0-9])\1+$/.test(sinEspacios)) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ])\1+\d+$/.test(sinEspacios)) return false;
  return true;
};

export const formProfileSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas, letras repetidas con números, ni solo espacios"),
  apellido: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .max(50, "El apellido es demasiado largo")
    .regex(soloLetras, "El apellido solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas, letras repetidas con números, ni solo espacios"),
  direccion: z
    .string()
    .trim()
    .min(5, "La dirección es obligatoria")
    .max(100, "La dirección es demasiado larga")
    .regex(direccionValida, "La dirección solo debe contener letras, números y espacios")
    .refine(noSoloRepetidos, "La dirección no puede ser solo caracteres repetidos, repetidos con números, ni solo espacios"),
  celular: z
    .string()
    .trim()
    .length(10, "El celular debe tener exactamente 10 dígitos")
    .regex(/^\d+$/, "El celular solo debe contener números")
    .refine(noSoloRepetidos, "El celular no puede ser solo números repetidos, repetidos con letras, ni solo espacios"),
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .regex(emailGmail, "El correo debe ser un gmail válido y en minúsculas, por ejemplo: usuario@gmail.com")
    .refine(noSoloRepetidos, "El correo no puede ser solo caracteres repetidos ni solo espacios"),
});