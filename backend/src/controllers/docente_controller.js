import docente from "../models/docente.js"
import admin from "../models/admin.js"
import { v2 as cloudinary } from 'cloudinary'
import { sendMailToChangeEmail} from "../services/emailService.js"
import mongoose from "mongoose"

// Obtener perfil del docente
const perfilDocente = (req, res) => {
  try {
    const camposAEliminar = [
      "statusDocente", "admin", "passwordDocente",
      "tokenDocente", "createdAt", "updatedAt", "__v"
    ];

    const docentePerfil = { ...req.docenteBDD._doc };
    camposAEliminar.forEach(campo => delete docentePerfil[campo]);

    res.status(200).json(docentePerfil);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Confirmar mail del docente
const confirmarMailDocente = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Token inválido" });
    }

    const docenteBDD = await docente.findOne({ tokenDocente: token });

    if (!docenteBDD) {
      return res.status(404).json({ msg: "Token inválido o expirado" });
    }

    docenteBDD.confirmEmailDocente = true;
    docenteBDD.tokenDocente = null;
    await docenteBDD.save();

    res.status(200).json({ msg: "Correo confirmado correctamente, ya puedes iniciar sesión" });
  } catch (error) {
    console.error("confirmarMailDocente error:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Actualizar perfil del docente (solo foto y correo, lo demás no se puede)
const actualizarPerfilDocente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.files ? {} : (req.validated || req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    }

    const docenteBDD = await docente.findById(id);
    if (!docenteBDD) {
      return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
    }

    // Eliminar las imagenes de Cloudinary si la actualizacion es de foto
    if (data.removeAvatar === true || data.removeAvatar === 'true') {

      // Eliminar de Cloudinary si existen
      if (docenteBDD.avatarDocente) {
        try {
          const publicId = docenteBDD.avatarDocente.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Docentes/${publicId}`);
        } catch (err) {
          console.warn("No se pudo eliminar avatarDocente de Cloudinary:", err);
        }
      }
      if (docenteBDD.avatarDocenteOriginal) {
        try {
          const publicId = docenteBDD.avatarDocenteOriginal.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Docentes/originals/${publicId}`);
        } catch (err) {
          console.warn("No se pudo eliminar avatarDocenteOriginal de Cloudinary:", err);
        }
      }

      docenteBDD.avatarDocente = null;
      docenteBDD.avatarDocenteOriginal = null;
      await docenteBDD.save();

      return res.status(200).json({
        msg: "Foto de perfil eliminada correctamente",
        docente: {
          _id: docenteBDD._id,
          nombreDocente: docenteBDD.nombreDocente,
          apellidoDocente: docenteBDD.apellidoDocente,
          emailDocente: docenteBDD.emailDocente,
          celularDocente: docenteBDD.celularDocente,
          avatarDocente: null,
          avatarDocenteOriginal: null
        }
      });
    }

    // SUBIR IMAGEN RECORTADA + ORIGINAL (para el círculo y el modal)
    if (req.files?.avatarDocente || req.files?.avatarDocenteOriginal) {

      try {
        // Subir imagen RECORTADA (para el círculo)
        if (req.files?.avatarDocente) {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'Docentes' },
            async (error, result) => {
              if (error) {
                console.error("❌ Error al subir avatarDocente recortado:", error);
                return res.status(500).json({ msg: 'Error al subir imagen recortada', error });
              }
              docenteBDD.avatarDocente = result.secure_url;

              // Subir imagen ORIGINAL (para el modal que muestra la foto completa al hacerc click)
              if (req.files?.avatarDocenteOriginal) {
                const uploadStreamOriginal = cloudinary.uploader.upload_stream(
                  { folder: 'Docentes/originals' },
                  async (errorOriginal, resultOriginal) => {
                    if (errorOriginal) {
                      console.error("Error al subir avatarDocente original:", errorOriginal);
                      return res.status(500).json({ msg: 'Error al subir imagen original', errorOriginal });
                    }
                    docenteBDD.avatarDocenteOriginal = resultOriginal.secure_url;
                    await docenteBDD.save();
                    return res.status(200).json({
                      msg: "Fotos de perfil actualizadas correctamente",
                      docente: {
                        _id: docenteBDD._id,
                        nombreDocente: docenteBDD.nombreDocente,
                        apellidoDocente: docenteBDD.apellidoDocente,
                        emailDocente: docenteBDD.emailDocente,
                        celularDocente: docenteBDD.celularDocente,
                        avatarDocente: docenteBDD.avatarDocente,
                        avatarDocenteOriginal: docenteBDD.avatarDocenteOriginal
                      }
                    });
                  }
                );
                uploadStreamOriginal.end(req.files.avatarDocenteOriginal.data);
              } else {
                await docenteBDD.save();
                return res.status(200).json({
                  msg: "Foto de perfil actualizada correctamente",
                  docente: {
                    _id: docenteBDD._id,
                    nombreDocente: docenteBDD.nombreDocente,
                    apellidoDocente: docenteBDD.apellidoDocente,
                    emailDocente: docenteBDD.emailDocente,
                    celularDocente: docenteBDD.celularDocente,
                    avatarDocente: docenteBDD.avatarDocente,
                    avatarDocenteOriginal: docenteBDD.avatarDocenteOriginal
                  }
                });
              }
            }
          );
          uploadStream.end(req.files.avatarDocente.data);
          return;
        }
      } catch (err) {
        console.error("❌ Error al procesar imágenes:", err);
        return res.status(500).json({ msg: 'Error al procesar imágenes', err });
      }
    }

    // Si cambian email, iniciar flujo de verificación
    if (data.emailDocente && data.emailDocente !== docenteBDD.emailDocente) {
      const docenteExistente = await docente.findOne({ emailDocente: data.emailDocente });
      const adminExistente = await admin.findOne({ email: data.emailDocente });

      if (docenteExistente || adminExistente) {
        return res.status(400).json({ msg: "El correo ya está registrado en el sistema" });
      }

      const token = docenteBDD.createToken();
      docenteBDD.pendingEmailDocente = data.emailDocente;
      docenteBDD.tokenDocente = token;

      await docenteBDD.save();
      await sendMailToChangeEmail(data.emailDocente, token);
      return res.status(200).json({
        msg: "Se envió un correo electrónico de confirmación al nuevo correo. El cambio se aplicará cuando lo confirmes."
      });
    }

    return res.status(400).json({ msg: "No se proporcionaron datos para actualizar" });
  } catch (error) {
    console.error("actualizarPerfilDocente error:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Actualizar contraseña del docente
const actualizarPasswordDocente = async (req, res) => {
  try {
    // Datos validados por Zod (incluye confirmPasswordDocente(opcional) y que newPasswordDocente sea diferente)
    const { currentPasswordDocente, newPasswordDocente, confirmPasswordDocente } = req.validated || {};

    // Verificar token JWT y obtener docente
    const docenteBDD = await docente.findById(req.docenteBDD._id);
    if (!docenteBDD) return res.status(404).json({ msg: "Docente no encontrado" });

    // Verificar contraseña actual
    const verificarPassword = await docenteBDD.matchPassword(currentPasswordDocente);
    if (!verificarPassword) return res.status(400).json({ msg: "La contraseña actual es incorrecta" });

    // Aquí Zod ya verificó que newPasswordDocente !== currentPasswordDocente
    docenteBDD.passwordDocente = await docenteBDD.encryptPassword(newPasswordDocente);
    await docenteBDD.save();
    return res.status(200).json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("actualizarPasswordDocente error:", error);
    return res.status(500).json({ msg: "Error del servidor" });
  }
};

export {
  perfilDocente,
  confirmarMailDocente,
  actualizarPerfilDocente,
  actualizarPasswordDocente
}