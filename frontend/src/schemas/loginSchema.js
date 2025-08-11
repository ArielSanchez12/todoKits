import { z } from "zod";

const emailGmail = /^[a-zA-Z0-9._%+-]{3,}@gmail\.com$/;
const passwordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,12}$/;
const passwordAdmin = /^[A-Z]{7}$/;

const noSoloRepetidos = (val) => {
  if (!val) return false;
  const sinEspacios = val.replace(/\s/g, "");
  if (sinEspacios.length === 0) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ0-9])\1+$/.test(sinEspacios)) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ])\1+\d+$/.test(sinEspacios)) return false;
  return true;
};

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .regex(emailGmail, "El correo debe ser un gmail válido y en minúsculas, por ejemplo: usuario@gmail.com"),
  password: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!noSoloRepetidos(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La contraseña no puede ser solo caracteres repetidos ni solo espacios"
        });
        return;
      }
      if (passwordFuerte.test(val)) {
        // Contraseña fuerte válida
        return;
      }
      if (passwordAdmin.test(val)) {
        // Contraseña admin válida
        return;
      }
      // Si no es ninguna válida, mostrar mensajes diferenciados
      if (val.length === 7 && /^[A-Z]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La contraseña temporal debe ser exactamente 7 letras mayúsculas (ejemplo: KITSBPE)"
        });
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Contraseña segura (8-12 caracteres) o temporal de 7 mayúsculas"
        });
      }
    }),
});