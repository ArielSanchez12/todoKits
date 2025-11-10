import Mensaje from "../models/mensaje.js";
import Transferencia from "../models/transferencia.js";
import Docente from "../models/docente.js";
import Admin from "../models/admin.js";
import pusher from "../config/pusher.js";

// Obtener admin del docente autenticado
const obtenerAdmin = async (req, res) => {
  try {
    if (!req.docenteBDD) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const admin = await Admin.findById(req.docenteBDD.admin).select(
      "_id nombre apellido direccion celular email rol avatar avatarOriginal"
    );

    if (!admin) {
      return res.status(404).json({ msg: "Admin no encontrado" });
    }

    res.json({
      _id: admin._id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      avatar: admin.avatar,
      avatarOriginal: admin.avatarOriginal,
      email: admin.email,
      rol: admin.rol
    });
  } catch (error) {
    console.error("Error al obtener admin:", error);
    res.status(500).json({ msg: "Error al obtener admin", error: error.message });
  }
};

// Obtener docentes del admin autenticado
const obtenerDocentes = async (req, res) => {
  try {
    if (!req.adminEmailBDD) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const docentes = await Docente.find({ admin: req.adminEmailBDD._id }).select(
      "_id nombreDocente apellidoDocente avatarDocente avatarDocenteOriginal avatar emailDocente"
    );

    res.json(docentes);
  } catch (error) {
    console.error("Error al obtener docentes:", error);
    res.status(500).json({ msg: "Error al obtener docentes", error: error.message });
  }
};

// Enviar mensaje con encriptación automática
const enviarMensaje = async (req, res) => {
  try {
    const { texto, de, deNombre, para, paraNombre, deTipo, paraTipo, clientId, replyToId, replyToTexto } = req.body;
    const finalClientId = clientId || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const mensaje = await Mensaje.create({
      texto,
      de,
      deNombre,
      para,
      paraNombre,
      deTipo,
      paraTipo,
      clientId: finalClientId,
      estado: "delivered",
      replyToId: replyToId || null,
      replyToTexto: replyToTexto || null
    });

    const mensajeDesencriptado = mensaje.desencriptar();
    pusher.trigger("chat", "nuevo-mensaje", mensajeDesencriptado);

    res.json(mensajeDesencriptado);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ msg: "Error al enviar mensaje", error: error.message });
  }
};

// Obtener historial de chat
const obtenerHistorial = async (req, res) => {
  try {
    const miId = req.docenteBDD?._id || req.adminEmailBDD?._id;
    const contactId = req.params.contactId;

    const mensajesEncriptados = await Mensaje.find({
      $and: [
        {
          $or: [
            { de: miId, para: contactId },
            { de: contactId, para: miId }
          ]
        },
        { hiddenFor: { $ne: miId } }
      ]
    }).sort({ createdAt: 1 });

    const mensajesDesencriptados = mensajesEncriptados.map(msg => msg.desencriptar());
    res.json(mensajesDesencriptados);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ msg: "Error al obtener historial", error: error.message });
  }
};

// Ocultar mensaje para mí (eliminar para mí)
const ocultarMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const miId = (req.docenteBDD?._id || req.adminEmailBDD?._id)?.toString();
    const msg = await Mensaje.findById(id);

    if (!msg) {
      return res.status(404).json({ msg: "Mensaje no encontrado" });
    }

    if (!msg.hiddenFor.map(x => x.toString()).includes(miId)) {
      msg.hiddenFor.push(miId);
      await msg.save();
    }

    pusher.trigger("chat", "mensaje-oculto", { _id: msg._id, userId: miId });
    res.json({ msg: "Ocultado", _id: msg._id });
  } catch (error) {
    console.error("Error al ocultar mensaje:", error);
    res.status(500).json({ msg: "Error al ocultar mensaje" });
  }
};

export {
  obtenerAdmin,
  obtenerDocentes,
  enviarMensaje,
  obtenerHistorial,
  ocultarMensaje
};