import { z } from "zod";

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const celularRegex = /^09\d{8}$/;
const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper para evitar letras repetidas
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

// esquema para actualizar perfil: campos opcionales pero validados si vienen
export const updateProfileSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre es obligatorio")
      .max(50, "El nombre es demasiado largo")
      .regex(soloLetras, "El nombre solo debe contener letras y espacios")
      .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas")
      .transform(capitalizeFirstLetter)
      .optional(),
    apellido: z
      .string()
      .trim()
      .min(2, "El apellido es obligatorio")
      .max(50, "El apellido es demasiado largo")
      .regex(soloLetras, "El apellido solo debe contener letras y espacios")
      .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas")
      .transform(capitalizeFirstLetter)
      .optional(),
    celular: z
      .string()
      .trim()
      .regex(celularRegex, "El celular debe ser un número válido de Ecuador que empiece con 09 y tenga 10 dígitos")
      .optional(),
    email: z
      .string()
      .trim()
      .email("El correo electrónico no es válido")
      .regex(/^[a-z0-9._%+-]+@gmail\.com$/, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
      .refine((val) => val === val.toLowerCase(), "El correo debe estar en minúsculas")
      .optional(),
    removeAvatar: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, { message: "Al menos un campo debe enviarse para actualizar" });

// esquema para cambiar contraseña
export const updatePasswordSchema = z
  .object({
    passwordactual: z.string().min(1, "La contraseña actual es requerida"),
    passwordnuevo: z
      .string()
      .trim()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(12, "La contraseña debe tener máximo 12 caracteres")
      .regex(
        passwordFuerte,
        "La contraseña debe tener mayúscula, minúscula, número, símbolo y entre 8 y 12 caracteres"
      ),
    confirmpassword: z.string().min(1, "La confirmación es requerida")
  })
  .refine((data) => data.passwordnuevo === data.confirmpassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmpassword"]
  })
  .refine((data) => data.passwordactual !== data.passwordnuevo, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["passwordnuevo"]
  });