import docente from "../models/docente.js"
import { sendMailToRecoveryPasswordDocente } from "../config/nodemailer.js"
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

    res.status(200).json({ msg: "Email confirmado y actualizado correctamente" });
  } catch (error) {
    console.error("confirmarNuevoEmailDocente error:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const recuperarPasswordDocente = async (req, res) => {
  try {
    // Datos ya validados por Zod
    const { emailDocente } = req.validated || req.body;

    const docenteBDD = await docente.findOne({ emailDocente });
    if (!docenteBDD) {
      return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });
    }

    // Generar token
    const token = docenteBDD.createToken();
    docenteBDD.token = token;
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
    const docenteBDD = await docente.findOne({ token });
    if (docenteBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })

    await docenteBDD.save();

    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
  } catch (error) {
    console.error("Error al comprobar token:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const crearNuevoPasswordDocente = async (req, res) => {
  try {
    // Datos ya validados por Zod (incluye validación de coincidencia)
    const { password, confirmpassword } = req.validated || req.body;
    const { token } = req.params;

    if (!token) return res.status(400).json({ msg: "Token inválido" });

    const docenteBDD = await docente.findOne({ token });
    if (!docenteBDD) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    if (docenteBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, token inválido o expirado" });

    docenteBDD.token = null;
    docenteBDD.password = await docenteBDD.encryptPassword(password);
    await docenteBDD.save();

    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
  } catch (error) {
    console.error("crearNuevoPassword error:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

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

    res.status(200).json({ msg: "Email confirmado correctamente, ya puedes iniciar sesión" });
  } catch (error) {
    console.error("confirmarMailDocente error:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

export {
  loginDocente,
  perfilDocente,
  actualizarPasswordDocente,
  confirmarNuevoEmailDocente,
  recuperarPasswordDocente,
  comprobarTokenPasswordDocente,
  crearNuevoPasswordDocente,
  confirmarMailDocente
}