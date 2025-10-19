import recurso from "../models/recurso.js";
import mongoose from "mongoose";

// Obtener siguiente número para nombre autogenerado
const obtenerSiguienteNumero = async (tipo, adminId) => {
  try {
    const ultimoRecurso = await recurso
      .findOne({
        tipo,
        admin: adminId,
      })
      .sort({ createdAt: -1 });

    if (!ultimoRecurso) return 1;

    // Extraer número del nombre (ej: "KIT #5" -> 5)
    const match = ultimoRecurso.nombre.match(/#(\d+)/);
    return match ? parseInt(match[1]) + 1 : 1;
  } catch (error) {
    console.error("Error obteniendo siguiente número:", error);
    return 1;
  }
};

// Crear recurso
const crearRecurso = async (req, res) => {
  try {
    const datosRecurso = req.validated || req.body;
    const { tipo } = datosRecurso;

    // Generar nombre autogenerado
    const proximoNumero = await obtenerSiguienteNumero(
      tipo,
      req.adminEmailBDD._id
    );
    const nombre = `${tipo.toUpperCase()} #${proximoNumero}`;

    // Validar que laboratorio sea único por tipo si no es proyector
    if (tipo !== "proyector") {
      const existeLab = await recurso.findOne({
        tipo,
        laboratorio: datosRecurso.laboratorio,
        admin: req.adminEmailBDD._id,
      });

      if (existeLab) {
        return res.status(400).json({
          msg: `El laboratorio ${datosRecurso.laboratorio} ya tiene un ${tipo} asignado`,
        });
      }
    }

    const nuevoRecurso = new recurso({
      ...datosRecurso,
      nombre,
      admin: req.adminEmailBDD._id,
      estado: "pendiente",
    });

    await nuevoRecurso.save();

    res.status(201).json({
      msg: "Recurso creado exitosamente",
      recurso: nuevoRecurso,
    });
  } catch (error) {
    console.error("Error al crear recurso:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Listar recursos del admin
const listarRecursos = async (req, res) => {
  try {
    const recursos = await recurso
      .find({ admin: req.adminEmailBDD._id })
      .populate("asignadoA", "nombreDocente apellidoDocente emailDocente")
      .sort({ createdAt: -1 });

    res.status(200).json(recursos);
  } catch (error) {
    console.error("Error al listar recursos:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Listar recursos por tipo
const listarRecursosPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    if (!["kit", "llave", "proyector"].includes(tipo)) {
      return res.status(400).json({ msg: "Tipo de recurso inválido" });
    }

    const recursos = await recurso
      .find({ admin: req.adminEmailBDD._id, tipo })
      .populate("asignadoA", "nombreDocente apellidoDocente emailDocente")
      .sort({ createdAt: -1 });

    res.status(200).json(recursos);
  } catch (error) {
    console.error("Error al listar recursos por tipo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Obtener recurso por ID
const obtenerRecurso = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de recurso inválido" });
    }

    const recursoEncontrado = await recurso
      .findById(id)
      .populate("asignadoA", "nombreDocente apellidoDocente emailDocente");

    if (!recursoEncontrado) {
      return res.status(404).json({ msg: "Recurso no encontrado" });
    }

    res.status(200).json(recursoEncontrado);
  } catch (error) {
    console.error("Error al obtener recurso:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Actualizar estado del recurso
const actualizarRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.validated || req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de recurso inválido" });
    }

    const recursoActualizado = await recurso.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true }
    ).populate("asignadoA", "nombreDocente apellidoDocente emailDocente");

    if (!recursoActualizado) {
      return res.status(404).json({ msg: "Recurso no encontrado" });
    }

    res.status(200).json({
      msg: "Recurso actualizado exitosamente",
      recurso: recursoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar recurso:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Eliminar recurso
const eliminarRecurso = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de recurso inválido" });
    }

    const recursoEliminado = await recurso.findByIdAndDelete(id);

    if (!recursoEliminado) {
      return res.status(404).json({ msg: "Recurso no encontrado" });
    }

    res.status(200).json({ msg: "Recurso eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar recurso:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

export {
  crearRecurso,
  listarRecursos,
  listarRecursosPorTipo,
  obtenerRecurso,
  actualizarRecurso,
  eliminarRecurso,
};