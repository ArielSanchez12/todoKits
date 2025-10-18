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

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Esquema para registrar docente (admin crea al docente)
export const registerDocenteSchema = z.object({
  nombreDocente: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas")
    .transform(capitalizeFirstLetter),
  apellidoDocente: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .max(50, "El apellido es demasiado largo")
    .regex(soloLetras, "El apellido solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas")
    .transform(capitalizeFirstLetter),
  celularDocente: z
    .string()
    .trim()
    .regex(celularRegex, "El celular debe ser un número válido de Ecuador que empiece con 09 y tenga 10 dígitos"),
  emailDocente: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
    .transform(val => val.toLowerCase()),
  avatarDocente: z.string().optional()
});

// Esquema para actualizar docente
export const updateDocenteSchema = z.object({
  nombreDocente: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas")
    .transform(capitalizeFirstLetter),
  apellidoDocente: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .max(50, "El apellido es demasiado largo")
    .regex(soloLetras, "El apellido solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas")
    .transform(capitalizeFirstLetter),
  celularDocente: z
    .string()
    .trim()
    .regex(celularRegex, "El celular debe ser un número válido de Ecuador que empiece con 09 y tenga 10 dígitos"),
  emailDocente: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .regex(emailGmail, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
    .transform(val => val.toLowerCase()),
  avatarDocente: z.string().optional()
});

// Esquema para actualizar contraseña del docente
export const updateDocentePasswordSchema = z.object({
  currentPasswordDocente: z.string().trim().min(1, "La contraseña actual es requerida"),
  newPasswordDocente: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(12, "La contraseña debe tener máximo 12 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/,
      "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un símbolo"
    ),
  confirmPasswordDocente: z
    .string()
    .trim()
    .min(8, "La confirmación es requerida")
}).refine((data) => data.newPasswordDocente === data.confirmPasswordDocente, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPasswordDocente"],
});