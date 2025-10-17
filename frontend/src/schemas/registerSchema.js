import { z } from "zod";

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const direccionValida = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/;
const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;
const emailRealista = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const emailGmail = /^[a-zA-Z0-9._%+-]{3,}@gmail\.com$/;

// No solo repetidos ni repetidos+números, ni solo espacios
const noSoloRepetidos = (val) => {
  if (!val) return false;
  const sinEspacios = val.replace(/\s/g, "");
  if (sinEspacios.length === 0) return false; // solo espacios
  // Solo un carácter repetido (letra o número)
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ0-9])\1+$/.test(sinEspacios)) return false;
  // Un carácter repetido seguido de números (ej: aaaaaa123)
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ])\1+\d+$/.test(sinEspacios)) return false;
  return true;
};

export const registerSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio")
    .max(50, "El nombre es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas ni caracteres repetidos"),
  apellido: z
    .string()
    .trim()
    .min(2, "El apellido es obligatorio")
    .max(50, "El apellido es demasiado largo")
    .regex(soloLetras, "El apellido solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El apellido no puede ser solo letras repetidas ni caracteres repetidos"),
  // direccion eliminado intencionalmente
  celular: z
    .string()
    .trim()
    .regex(celularRegex, "El celular debe ser un número válido de Ecuador que empiece con 09 y tenga 10 dígitos"),
  email: z
    .string()
    .trim()
    .email("El correo electrónico no es válido")
    .regex(/^[a-z0-9._%+-]+@gmail\.com$/, "El correo debe ser de Gmail y en minúsculas (ej: usuario@gmail.com)")
    .refine((val) => val === val.toLowerCase(), "El correo debe estar en minúsculas"),
  password: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(12, "La contraseña debe tener máximo 12 caracteres")
    .regex(
      passwordFuerte,
      "La contraseña debe tener mayúscula, minúscula, número, símbolo y entre 8 y 12 caracteres"
    )
});