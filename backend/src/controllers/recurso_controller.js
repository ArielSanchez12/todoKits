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

    // Construir objeto según tipo de recurso
    let datosParaGuardar = {
      tipo,
      nombre,
      admin: req.adminEmailBDD._id,
      estado: "pendiente",
    };

    // Agregar campos según tipo
    if (tipo === "kit") {
      datosParaGuardar.laboratorio = datosRecurso.laboratorio;
      datosParaGuardar.aula = datosRecurso.aula;
      datosParaGuardar.contenido = datosRecurso.contenido.filter(c => c.trim());
    } else if (tipo === "llave") {
      datosParaGuardar.laboratorio = datosRecurso.laboratorio;
      datosParaGuardar.aula = datosRecurso.aula;
      // Las llaves NO tienen contenido
    } else if (tipo === "proyector") {
      datosParaGuardar.contenido = datosRecurso.contenido.filter(c => c.trim());
      // Los proyectores NO tienen laboratorio ni aula
    }

    const nuevoRecurso = new recurso(datosParaGuardar);
    await nuevoRecurso.save();

    res.status(201).json({
      msg: "Recurso creado exitosamente",
      recurso: nuevoRecurso,
    });
  } catch (error) {
    console.error("Error al crear recurso:", error);
    
    // Manejar errores de validación del modelo
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    
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

    // Formatear respuesta según tipo de recurso
    const recursosFormateados = recursos.map(r => {
      const recursoObj = {
        _id: r._id,
        tipo: r.tipo,
        nombre: r.nombre,
        estado: r.estado,
        asignadoA: r.asignadoA,
        admin: r.admin,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };

      // Agregar campos específicos según tipo
      if (r.tipo === "kit") {
        recursoObj.laboratorio = r.laboratorio;
        recursoObj.aula = r.aula;
        recursoObj.contenido = r.contenido;
      } else if (r.tipo === "llave") {
        recursoObj.laboratorio = r.laboratorio;
        recursoObj.aula = r.aula;
      } else if (r.tipo === "proyector") {
        recursoObj.contenido = r.contenido;
      }

      return recursoObj;
    });

    res.status(200).json(recursosFormateados);
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

    // Formatear respuesta según tipo
    const recursosFormateados = recursos.map(r => {
      const recursoObj = {
        _id: r._id,
        tipo: r.tipo,
        nombre: r.nombre,
        estado: r.estado,
        asignadoA: r.asignadoA,
        admin: r.admin,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };

      if (tipo === "kit") {
        recursoObj.laboratorio = r.laboratorio;
        recursoObj.aula = r.aula;
        recursoObj.contenido = r.contenido;
      } else if (tipo === "llave") {
        recursoObj.laboratorio = r.laboratorio;
        recursoObj.aula = r.aula;
      } else if (tipo === "proyector") {
        recursoObj.contenido = r.contenido;
      }

      return recursoObj;
    });

    res.status(200).json(recursosFormateados);
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

    // Formatear respuesta según tipo
    const recursoObj = {
      _id: recursoEncontrado._id,
      tipo: recursoEncontrado.tipo,
      nombre: recursoEncontrado.nombre,
      estado: recursoEncontrado.estado,
      asignadoA: recursoEncontrado.asignadoA,
      admin: recursoEncontrado.admin,
      createdAt: recursoEncontrado.createdAt,
      updatedAt: recursoEncontrado.updatedAt,
    };

    if (recursoEncontrado.tipo === "kit") {
      recursoObj.laboratorio = recursoEncontrado.laboratorio;
      recursoObj.aula = recursoEncontrado.aula;
      recursoObj.contenido = recursoEncontrado.contenido;
    } else if (recursoEncontrado.tipo === "llave") {
      recursoObj.laboratorio = recursoEncontrado.laboratorio;
      recursoObj.aula = recursoEncontrado.aula;
    } else if (recursoEncontrado.tipo === "proyector") {
      recursoObj.contenido = recursoEncontrado.contenido;
    }

    res.status(200).json(recursoObj);
  } catch (error) {
    console.error("Error al obtener recurso:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Actualizar estado del recurso (cambio de estado cuando se asigna al docente)
const actualizarRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.validated || req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de recurso inválido" });
    }

    // Solo permitir actualizar estado y asignadoA
    const camposPermitidos = {};
    if (datosActualizacion.estado) camposPermitidos.estado = datosActualizacion.estado;
    if (datosActualizacion.asignadoA !== undefined) camposPermitidos.asignadoA = datosActualizacion.asignadoA;

    const recursoActualizado = await recurso.findByIdAndUpdate(
      id,
      camposPermitidos,
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

// Actualizar recurso completo (edición) - AGREGAR VALIDACIÓN
const actualizarRecursoCompleto = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizacion = req.validated || req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de recurso inválido" });
    }

    // Buscar el recurso existente
    const recursoExistente = await recurso.findById(id);
    if (!recursoExistente) {
      return res.status(404).json({ msg: "Recurso no encontrado" });
    }

    // VALIDAR QUE NO ESTÉ EN PRÉSTAMO ACTIVO
    if (recursoExistente.estado === "activo" || recursoExistente.estado === "prestado") {
      return res.status(400).json({ 
        msg: "No se puede editar un recurso que está en préstamo activo" 
      });
    }

    const tipo = recursoExistente.tipo;

    // Construir objeto de actualización según tipo
    let datosParaActualizar = {};

    if (tipo === "kit") {
      if (datosActualizacion.laboratorio) {
        const labEnUso = await recurso.findOne({
          tipo: "kit",
          laboratorio: datosActualizacion.laboratorio,
          _id: { $ne: id },
          admin: recursoExistente.admin,
        });

        if (labEnUso) {
          return res.status(400).json({
            msg: `El laboratorio ${datosActualizacion.laboratorio} ya está en uso por otro kit`,
          });
        }

        datosParaActualizar.laboratorio = datosActualizacion.laboratorio;
      }

      if (datosActualizacion.aula) {
        datosParaActualizar.aula = datosActualizacion.aula;
      }

      if (datosActualizacion.contenido && Array.isArray(datosActualizacion.contenido)) {
        datosParaActualizar.contenido = datosActualizacion.contenido.filter(c => c.trim());
      }
    } 
    else if (tipo === "llave") {
      if (datosActualizacion.laboratorio) {
        const labEnUso = await recurso.findOne({
          tipo: "llave",
          laboratorio: datosActualizacion.laboratorio,
          _id: { $ne: id },
          admin: recursoExistente.admin,
        });

        if (labEnUso) {
          return res.status(400).json({
            msg: `El laboratorio ${datosActualizacion.laboratorio} ya está en uso por otra llave`,
          });
        }

        datosParaActualizar.laboratorio = datosActualizacion.laboratorio;
      }

      if (datosActualizacion.aula) {
        datosParaActualizar.aula = datosActualizacion.aula;
      }
    } 
    else if (tipo === "proyector") {
      if (datosActualizacion.contenido && Array.isArray(datosActualizacion.contenido)) {
        datosParaActualizar.contenido = datosActualizacion.contenido.filter(c => c.trim());
      }
    }

    // Actualizar el recurso
    const recursoActualizado = await recurso.findByIdAndUpdate(
      id,
      datosParaActualizar,
      { new: true, runValidators: true }
    ).populate("asignadoA", "nombreDocente apellidoDocente emailDocente");

    res.status(200).json({
      msg: "Recurso actualizado exitosamente",
      recurso: recursoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar recurso:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Eliminar recurso - AGREGAR VALIDACIÓN
const eliminarRecurso = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "ID de recurso inválido" });
    }

    const recursoExistente = await recurso.findById(id);
    if (!recursoExistente) {
      return res.status(404).json({ msg: "Recurso no encontrado" });
    }

    // VALIDAR QUE NO ESTÉ EN PRÉSTAMO ACTIVO
    if (recursoExistente.estado === "activo" || recursoExistente.estado === "prestado") {
      return res.status(400).json({ 
        msg: "No se puede eliminar un recurso que está en préstamo activo" 
      });
    }

    await recurso.findByIdAndDelete(id);

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
  actualizarRecursoCompleto,
  eliminarRecurso,
};