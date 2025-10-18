import { z } from "zod";

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const celularRegex = /^09\d{8}$/;
const emailGmail = /^[a-z0-9._%+-]+@gmail\.com$/;

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

export const formSchema = z.object({
  nombreDocente: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas"),
  
  apellidoDocente: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .max(50, "El apellido es demasiado largo")
    .regex(soloLetras, "El apellido solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas"),
  
  celularDocente: z
    .string()
    .trim()
    .regex(celularRegex, "El celular debe ser un número válido de Ecuador que empiece con 09 y tenga 10 dígitos"),
  
  emailDocente: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)"),
  
  imagen: z
    .any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true; // La imagen es opcional
        return files[0]?.type?.startsWith('image/');
      },
      "Solo se aceptan archivos de imagen"
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true; // La imagen es opcional
        return files[0]?.size <= 5 * 1024 * 1024; // Máximo 5MB
      },
      "La imagen no debe superar 5MB"
    ),
});