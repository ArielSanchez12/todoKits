import { z } from "zod";

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const motivoValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:¡!¿?\-()]+$/;

const noSoloRepetidos = (val) => {
  if (!val) return false;
  const sinEspacios = val.replace(/\s/g, "");
  if (sinEspacios.length === 0) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ0-9])\1+$/.test(sinEspacios)) return false;
  if (/^([a-zA-ZñÑáéíóúÁÉÍÓÚ])\1+\d+$/.test(sinEspacios)) return false;
  return true;
};

// Motivo debe tener al menos una minúscula y no ser todo mayúsculas
const motivoNoSoloMayusculas = (val) => {
  if (!val) return false;
  // Debe tener al menos una minúscula
  if (!/[a-záéíóúñ]/.test(val)) return false;
  // No debe ser todo mayúsculas (ignorando signos y números)
  const soloLetras = val.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, "");
  if (soloLetras && soloLetras === soloLetras.toUpperCase()) return false;
  return true;
};

// Números válidos: no repetidos, no excesivos, no letras
const numeroValido = (val, max) => {
  if (!/^\d+$/.test(val)) return false; // Solo números
  if (/^(\d)\1+$/.test(val)) return false; // No solo números repetidos
  const num = parseInt(val, 10);
  if (num < 1 || num > max) return false;
  return true;
};

const precioValido = (val, max) => {
  if (!/^\d+(\.\d{1,2})?$/.test(val)) return false; // Solo números válidos
  if (/^(\d)\1+$/.test(val.replace(/\./g, ""))) return false; // No solo números repetidos
  const num = parseFloat(val);
  if (num <= 0 || num > max) return false;
  return true;
};

export const modalTreatmentsSchema = z.object({
  nombreMateria: z
    .string()
    .trim()
    .min(2, "El nombre de la materia es obligatorio")
    .max(50, "El nombre de la materia es demasiado largo")
    .regex(soloLetras, "El nombre solo debe contener letras y espacios")
    .refine(noSoloRepetidos, "El nombre no puede ser solo letras repetidas, letras repetidas con números, ni solo espacios"),
  motivo: z
    .string()
    .trim()
    .min(5, "El motivo es obligatorio")
    .max(200, "El motivo es demasiado largo")
    .regex(motivoValido, "El motivo solo debe contener letras, números, espacios y signos básicos")
    .refine(noSoloRepetidos, "El motivo no puede ser solo caracteres repetidos ni solo espacios")
    .refine(motivoNoSoloMayusculas, "El motivo debe tener minúsculas y no puede ser todo mayúsculas"),
  tipoRecuperacion: z
    .string()
    .min(1, "Debe seleccionar un tipo de recuperación")
    .refine(val => ["Ninguna", "Repetición regular", "Examen supletorio", "Curso de recuperación intensivo"].includes(val), {
      message: "Seleccione una opción válida",
    }),
  numeroCreditos: z
    .string()
    .trim()
    .refine(val => numeroValido(val, 50), "Debe ser un número válido, no repetido ni excesivo (máx 50)"),
  precioPorCredito: z
    .string()
    .trim()
    .refine(val => precioValido(val, 1000), "Debe ser un precio válido, no repetido ni excesivo (máx 1000)"),
  precioTotal: z
    .union([z.string(), z.number()])
    .transform(val => String(val).trim())
    .refine(val => precioValido(val, 10000), "Debe ser un precio válido, no repetido ni excesivo (máx 10000)"),
});
