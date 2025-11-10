import docente from "../models/docente.js"
import admin from "../models/admin.js"
import { v2 as cloudinary } from 'cloudinary'
import { sendMailToChangeEmail} from "../config/nodemailer.js"
import fs from "fs-extra"
import mongoose from "mongoose"
import { crearTokenJWT } from "../middlewares/jwt.js"


// const loginDocente = async (req, res) => {
//   try {
//     const { email: emailDocente, password: passwordDocente } = req.body;
//     if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });

//     const docenteBDD = await docente.findOne({ emailDocente });
//     if (!docenteBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });

//     const verificarPassword = await docenteBDD.matchPassword(passwordDocente);
//     if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });

//     const tokenJWT = crearTokenJWT(docenteBDD._id, docenteBDD.rolDocente);

//     res.status(200).json({
//       token: tokenJWT,
//       rol: docenteBDD.rolDocente,
//       usuario: {
//         _id: docenteBDD._id,
//         nombreDocente: docenteBDD.nombreDocente,
//         apellidoDocente: docenteBDD.apellidoDocente,
//         celularDocente: docenteBDD.celularDocente,
//         emailDocente: docenteBDD.emailDocente,
//         avatarDocente: docenteBDD.avatarDocente,
//         rolDocente: docenteBDD.rolDocente,
//         admin: docenteBDD.admin
//       }
//     });
//   } catch (error) {
//     console.error("Error en login docente:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };

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

// const actualizarPasswordDocente = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // Datos validados por Zod
//     const { currentPasswordDocente, newPasswordDocente } = req.validated || req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ msg: "Docente no encontrado" });
//     }

//     const docenteActual = await docente.findById(id);
//     if (!docenteActual) {
//       return res.status(404).json({ msg: "Docente no encontrado" });
//     }

//     // Verificar que la contraseña actual sea correcta
//     const passwordCorrecto = await docenteActual.matchPassword(currentPasswordDocente);
//     if (!passwordCorrecto) {
//       return res.status(400).json({ msg: "La contraseña actual es incorrecta" });
//     }

//     // Verificar que la nueva contraseña sea diferente a la actual
//     const esIgual = await docenteActual.matchPassword(newPasswordDocente);
//     if (esIgual) {
//       return res.status(400).json({ msg: "La nueva contraseña debe ser diferente a la actual" });
//     }

//     // Actualizar contraseña
//     docenteActual.passwordDocente = await docenteActual.encryptPassword(newPasswordDocente);
//     await docenteActual.save();

//     res.status(200).json({ msg: "Contraseña actualizada correctamente" });
//   } catch (error) {
//     console.error("Error al actualizar contraseña:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };

//Este es el que se abre al hacer clic en el enlace del correo para confirmar el nuevo email
const confirmarNuevoEmailDocente = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Token inválido" });
    }

    const docenteBDD = await docente.findOne({
      tokenDocente: token,
      pendingEmailDocente: { $exists: true, $ne: null }
    });

    if (!docenteBDD) {
      return res.status(404).json({ msg: "Token inválido o expirado" });
    }

    // Aplicar cambio de email
    docenteBDD.emailDocente = docenteBDD.pendingEmailDocente;
    docenteBDD.pendingEmailDocente = null;
    docenteBDD.tokenDocente = null;
    docenteBDD.confirmEmailDocente = true;

    await docenteBDD.save();

    res.status(200).json({ msg: "Correo confirmado y actualizado correctamente" });
  } catch (error) {
    console.error("confirmarNuevoEmailDocente error:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// const recuperarPasswordDocente = async (req, res) => {
//   try {
//     // Datos ya validados por Zod
//     const { emailDocente } = req.validated || req.body;

//     const docenteBDD = await docente.findOne({ emailDocente });
//     if (!docenteBDD) {
//       return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });
//     }

//     // Generar token
//     const token = docenteBDD.createToken();
//     docenteBDD.token = token;
//     await docenteBDD.save();

//     // Enviar email con el token
//     await sendMailToRecoveryPasswordDocente(emailDocente, token);

//     res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
//   } catch (error) {
//     console.error("Error recuperar contraseña:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };

// const comprobarTokenPasswordDocente = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const docenteBDD = await docente.findOne({ token });
//     if (docenteBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })

//     await docenteBDD.save();

//     res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
//   } catch (error) {
//     console.error("Error al comprobar token:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };

// const crearNuevoPasswordDocente = async (req, res) => {
//   try {
//     // Datos ya validados por Zod (incluye validación de coincidencia)
//     const { password, confirmpassword } = req.validated || req.body;
//     const { token } = req.params;

//     if (!token) return res.status(400).json({ msg: "Token inválido" });

//     const docenteBDD = await docente.findOne({ token });
//     if (!docenteBDD) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
//     if (docenteBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, token inválido o expirado" });

//     docenteBDD.token = null;
//     docenteBDD.passwordDocente = await docenteBDD.encryptPassword(password);
//     await docenteBDD.save();

//     res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
//   } catch (error) {
//     console.error("crearNuevoPassword error:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };

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

// Actualizar perfil del docente (solo foto y email)
// ✅ ACTUALIZAR: Actualizar perfil del docente (solo foto y email)
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

    // ✅ ELIMINAR AVATARES
    if (data.removeAvatar === true || data.removeAvatar === 'true') {
      console.log("🗑️ ELIMINANDO AVATARES DOCENTE - ENTRANDO AL IF");

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

      console.log("✅ Avatares docente eliminados");
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

    // ✅ SUBIR IMAGEN RECORTADA + ORIGINAL
    if (req.files?.avatarDocente || req.files?.avatarDocenteOriginal) {
      console.log("📤 SUBIENDO IMÁGENES DOCENTE - ENTRANDO AL IF");

      try {
        // ✅ Subir imagen RECORTADA (para el círculo)
        if (req.files?.avatarDocente) {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'Docentes' },
            async (error, result) => {
              if (error) {
                console.error("❌ Error al subir avatarDocente recortado:", error);
                return res.status(500).json({ msg: 'Error al subir imagen recortada', error });
              }
              docenteBDD.avatarDocente = result.secure_url;
              console.log("✅ AvatarDocente recortado subido:", result.secure_url);

              // ✅ Subir imagen ORIGINAL (para el modal)
              if (req.files?.avatarDocenteOriginal) {
                const uploadStreamOriginal = cloudinary.uploader.upload_stream(
                  { folder: 'Docentes/originals' },
                  async (errorOriginal, resultOriginal) => {
                    if (errorOriginal) {
                      console.error("❌ Error al subir avatarDocente original:", errorOriginal);
                      return res.status(500).json({ msg: 'Error al subir imagen original', errorOriginal });
                    }
                    docenteBDD.avatarDocenteOriginal = resultOriginal.secure_url;
                    console.log("✅ AvatarDocente original subido:", resultOriginal.secure_url);

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
      await sendMailToChangeEmailDocente(data.emailDocente, token);
      return res.status(200).json({
        msg: "Se envió un correo electrónico de confirmación al nuevo correo. El cambio se aplicará cuando lo confirmes."
      });
    }

    console.log("⚠️ No se realizó ningún cambio");
    return res.status(400).json({ msg: "No se proporcionaron datos para actualizar" });
  } catch (error) {
    console.error("actualizarPerfilDocente error:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Actualizar contraseña del docente
const actualizarPasswordDocente = async (req, res) => {
  try {
    // Datos validados por Zod (incluye confirmPasswordDocente y que newPasswordDocente sea diferente)
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
  //loginDocente,
  perfilDocente,
  // actualizarPasswordDocente,
  confirmarNuevoEmailDocente,
  // recuperarPasswordDocente,
  // comprobarTokenPasswordDocente,
  // crearNuevoPasswordDocente,
  confirmarMailDocente,
  actualizarPerfilDocente,
  actualizarPasswordDocente
}