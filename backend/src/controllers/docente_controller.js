import docente from "../models/docente.js"
import { sendMailToChangeEmailDocente, sendMailToRecoveryPasswordDocente, sendMailToDocente } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import mongoose from "mongoose"
import Tratamiento from "../models/tratamiento.js"
import { crearTokenJWT } from "../middlewares/jwt.js"


const loginDocente = async (req, res) => {
  try {
    const { email: emailDocente, password: passwordDocente } = req.body;
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    const docenteBDD = await docente.findOne({ emailDocente });
    if (!docenteBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });

    const verificarPassword = await docenteBDD.matchPassword(passwordDocente);
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });

    const tokenJWT = crearTokenJWT(docenteBDD._id, docenteBDD.rolDocente);

    res.status(200).json({
      token: tokenJWT,
      rol: docenteBDD.rolDocente,
      usuario: {
        _id: docenteBDD._id,
        nombreDocente: docenteBDD.nombreDocente,
        apellidoDocente: docenteBDD.apellidoDocente,
        celularDocente: docenteBDD.celularDocente,
        emailDocente: docenteBDD.emailDocente,
        avatarDocente: docenteBDD.avatarDocente,
        rolDocente: docenteBDD.rolDocente,
        admin: docenteBDD.admin
      }
    });
  } catch (error) {
    console.error("Error en login docente:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

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

const listarDocentes = async (req, res) => {
  try {
    if (req.docenteBDD?.rolDocente === "Docente") {
      const docentes = await docente.find(req.docenteBDD._id).select("-passwordDocente -createdAt -updatedAt -__v").populate('admin', '_id nombre apellido');
      res.status(200).json(docentes);
    } else {
      const docentes = await docente.find({ statusDocente: true }).where('admin').equals(req.adminEmailBDD).select("-passwordDocente -createdAt -updatedAt -__v").populate('admin', '_id nombre apellido');
      res.status(200).json(docentes);
    }
  } catch (error) {
    console.error("Error al listar docentes:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const detalleDocente = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
    }

    const docentes = await docente.findById(id)
      .select("-passwordDocente -createdAt -updatedAt -__v")
      .populate('admin', '_id nombre apellido');

    if (!docentes) {
      return res.status(404).json({ msg: "Docente no encontrado" });
    }

    const tratamientos = await Tratamiento.find().where('docente').equals(id);

    res.status(200).json({
      docentes,
      tratamientos
    });
  } catch (error) {
    console.error("Error al obtener detalle de docente:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const eliminarDocente = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
    }

    const docenteEliminado = await docente.findByIdAndDelete(id);
    if (!docenteEliminado) {
      return res.status(404).json({ msg: "Docente no encontrado" });
    }

    res.status(200).json({ msg: "Docente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar docente:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const actualizarDocente = async (req, res) => {
  try {
    const { id } = req.params;
    // Datos ya validados por Zod
    const datosDocente = req.validated || req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
    }

    // Busca el docente actual
    const docenteActual = await docente.findById(id);
    if (!docenteActual) {
      return res.status(404).json({ msg: "Docente no encontrado" });
    }

    // Detecta si el correo fue cambiado
    const nuevoCorreo = datosDocente.emailDocente;
    const correoAnterior = docenteActual.emailDocente;

    // Si el correo fue cambiado
    if (nuevoCorreo && nuevoCorreo !== correoAnterior) {
      // Verificar si el nuevo correo ya está en uso
      const existeCorreo = await docente.findOne({ emailDocente: nuevoCorreo });
      if (existeCorreo) {
        return res.status(400).json({ msg: "El correo ya está en uso por otro docente" });
      }

      // Generar token para confirmar cambio de email
      const token = docenteActual.createToken();

      // Guardar el email pendiente de confirmación
      docenteActual.pendingEmailDocente = nuevoCorreo;
      await docenteActual.save();

      // Enviar email de confirmación
      await sendMailToChangeEmailDocente(nuevoCorreo, token);

      // Quitar el email de los datos a actualizar para evitar que se cambie directamente
      delete datosDocente.emailDocente;
    }

    // Procesa imagen si es necesario
    if (req.files?.imagen) {
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'Docentes' },
          (error, result) => {
            if (error) return reject(error);
            datosDocente.avatarDocente = result.secure_url;
            resolve();
          }
        );
        uploadStream.end(req.files.imagen.data);
      });
    }

    // Actualiza el docente
    const docenteActualizado = await docente.findByIdAndUpdate(id, datosDocente, { new: true });

    res.status(200).json({
      msg: nuevoCorreo && nuevoCorreo !== correoAnterior ?
        "Se ha enviado un correo de confirmación para actualizar tu email" :
        "Actualización exitosa del docente"
    });
  } catch (error) {
    console.error("Error al actualizar docente:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const actualizarPasswordDocente = async (req, res) => {
  try {
    const { id } = req.params;
    // Datos validados por Zod
    const { currentPasswordDocente, newPasswordDocente } = req.validated || req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "Docente no encontrado" });
    }

    const docenteActual = await docente.findById(id);
    if (!docenteActual) {
      return res.status(404).json({ msg: "Docente no encontrado" });
    }

    // Verificar que la contraseña actual sea correcta
    const passwordCorrecto = await docenteActual.matchPassword(currentPasswordDocente);
    if (!passwordCorrecto) {
      return res.status(400).json({ msg: "La contraseña actual es incorrecta" });
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const esIgual = await docenteActual.matchPassword(newPasswordDocente);
    if (esIgual) {
      return res.status(400).json({ msg: "La nueva contraseña debe ser diferente a la actual" });
    }

    // Actualizar contraseña
    docenteActual.passwordDocente = await docenteActual.encryptPassword(newPasswordDocente);
    await docenteActual.save();

    res.status(200).json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const confirmarNuevoEmailDocente = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar docente por token
    const docenteBDD = await docente.findOne({ tokenDocente: token });
    if (!docenteBDD) {
      return res.status(404).json({ msg: "Token inválido o expirado" });
    }

    // Verificar que hay un email pendiente
    if (!docenteBDD.pendingEmailDocente) {
      return res.status(400).json({ msg: "No hay cambio de email pendiente" });
    }

    // Actualizar email y limpiar campos
    docenteBDD.emailDocente = docenteBDD.pendingEmailDocente;
    docenteBDD.pendingEmailDocente = null;
    docenteBDD.tokenDocente = null;

    await docenteBDD.save();

    res.status(200).json({ msg: "Email actualizado correctamente" });
  } catch (error) {
    console.error("Error al confirmar email:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const recuperarPasswordDocente = async (req, res) => {
  try {
    // Datos ya validados por Zod
    const { email: emailDocente } = req.validated || req.body;

    const docenteBDD = await docente.findOne({ emailDocente });
    if (!docenteBDD) {
      return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });
    }

    // Generar token
    const token = docenteBDD.createToken();
    await docenteBDD.save();

    // Enviar email con el token
    await sendMailToRecoveryPasswordDocente(emailDocente, token);

    res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
  } catch (error) {
    console.error("Error recuperar contraseña:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const comprobarTokenPasswordDocente = async (req, res) => {
  try {
    const { token } = req.params;

    // Verificar que el token exista y sea válido
    const docenteBDD = await docente.findOne({ tokenDocente: token });
    if (!docenteBDD) {
      return res.status(404).json({ msg: "Token inválido o expirado" });
    }

    res.status(200).json({ msg: "Token válido" });
  } catch (error) {
    console.error("Error al comprobar token:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const crearNuevoPasswordDocente = async (req, res) => {
  try {
    // Datos validados por Zod (incluye validación de coincidencia)
    const { password } = req.validated || req.body;
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Token inválido" });
    }

    const docenteBDD = await docente.findOne({ tokenDocente: token });
    if (!docenteBDD) {
      return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    }

    // Verificar que la nueva contraseña sea diferente a la anterior
    const esIgualALaAnterior = await docenteBDD.matchPassword(password);
    if (esIgualALaAnterior) {
      return res.status(400).json({ msg: "La nueva contraseña debe ser diferente a la anterior" });
    }

    // Actualizar contraseña y limpiar token
    docenteBDD.tokenDocente = null;
    docenteBDD.passwordDocente = await docenteBDD.encryptPassword(password);
    await docenteBDD.save();

    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nueva contraseña" });
  } catch (error) {
    console.error("Error al crear nueva contraseña:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const confirmarMailDocente = async (req, res) => {
    try {
        const { token } = req.params;
        
        const docenteBDD = await docente.findOne({ tokenDocente: token });
        if (!docenteBDD) {
            return res.status(404).json({ msg: "Token no válido" });
        }
        
        docenteBDD.confirmEmailDocente = true;
        docenteBDD.tokenDocente = null;
        await docenteBDD.save();
        
        res.status(200).json({ msg: "Email confirmado correctamente, ya puedes iniciar sesión" });
    } catch (error) {
        console.error("confirmarMailDocente error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export {
  loginDocente,
  perfilDocente,
  listarDocentes,
  detalleDocente,
  eliminarDocente,
  actualizarDocente,
  actualizarPasswordDocente,
  confirmarNuevoEmailDocente,
  recuperarPasswordDocente,
  comprobarTokenPasswordDocente,
  crearNuevoPasswordDocente,
  confirmarMailDocente
}