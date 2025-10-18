import { z } from "zod";

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const celularRegex = /^09\d{8}$/; // Ecuador: empieza con 09 y 10 dígitos
const emailGmail = /^[a-z0-9._%+-]+@gmail\.com$/;

// Helper para evitar caracteres repetidos - igual al backend
const noSoloRepetidos = (value) => {
  if (!value) return false;
  const t = value.replace(/\s+/g, "").toLowerCase();
  if (!t) return false;
  if (/^([a-z0-9ñáéíóú])\1*$/.test(t)) return false;
  const counts = {};
  for (const ch of t) counts[ch] = (counts[ch] || 0) + 1;
  const maxCount = Math.max(...Object.values(counts));
  if (maxCount / t.length > 0.6) return false;
  return true;
};

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const formProfileSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas ni caracteres repetidos")
    .transform(capitalizeFirstLetter),
  apellido: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .max(50, "El apellido es demasiado largo")
    .regex(soloLetras, "El apellido solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas ni caracteres repetidos")
    .transform(capitalizeFirstLetter),
  celular: z
    .string()
    .trim()
    .regex(celularRegex, "El celular debe ser un número válido de Ecuador que empiece con 09 y tenga 10 dígitos"),
  email: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
    .refine((val) => val === val.toLowerCase(), "El correo debe estar en minúsculas")
    .transform(val => val.toLowerCase())
})
  .refine(
    // Validación para que se envíe al menos un campo
    data => Object.values(data).some(val => val !== undefined && val !== ""),
    { message: "Debe actualizar al menos un campo" }
  );