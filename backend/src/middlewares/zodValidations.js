export const validate = (schema) => {
  if (!schema || typeof schema.safeParse !== "function") {
    throw new Error("validate middleware: se debe pasar un esquema Zod válido");
  }

  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Zod usa 'issues' para describir los errores; soportamos también 'errors' por compatibilidad
        const issues = result.error?.issues || result.error?.errors || [];
        const messages = issues.map((i) => i?.message || String(i));
        return res.status(400).json({ msg: messages.join(", ") });
      }

      req.validated = result.data;
      next();
    } catch (err) {
      // En caso de un fallo inesperado, devolver 500 pero sin romper todo
      console.error("zodValidations middleware error:", err);
      return res.status(500).json({ msg: "Error en validación de datos" });
    }
  };
};