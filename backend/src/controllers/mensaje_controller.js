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