import { validate } from "./zodValidations.js";

/**
 * Middleware condicional: Solo valida con Zod si NO hay archivos adjuntos
 * Si hay archivos (FormData), omite la validación de Zod
 * @param {Object} schema - Schema de Zod para validar
 * @returns {Function} Middleware de Express
 */
export const conditionalValidate = (schema) => {
  return (req, res, next) => {
    // Si hay archivos (FormData con imagen), saltarse validación de Zod
    if (req.files && Object.keys(req.files).length > 0) {
      return next();
    }
    
    // Si no hay archivos, aplicar validación de Zod normalmente
    return validate(schema)(req, res, next);
  };
};