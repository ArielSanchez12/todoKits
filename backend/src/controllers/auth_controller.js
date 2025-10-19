import admin from "../models/admin.js";
import docente from "../models/docente.js";
import { sendMailToRecoveryPassword } from "../config/nodemailer.js";

// Recuperación universal (busca en ambas colecciones)
const recuperarPasswordUniversal = async (req, res) => {
    try {
        const { email } = req.validated || req.body;

        // Buscar primero en administradores
        let usuario = await admin.findOne({ email });
        let tipoUsuario = "admin";

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ emailDocente: email });
            tipoUsuario = "docente";
        }

        // Si no existe en ninguna colección
        if (!usuario) {
            return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });
        }

        // Crear token
        const token = usuario.createToken();
        
        // Guardar token según el tipo de usuario
        if (tipoUsuario === "admin") {
            usuario.token = token;
        } else {
            usuario.tokenDocente = token;
        }
        
        await usuario.save();

        // Enviar correo (usa el email correcto según el tipo)
        const emailDestino = tipoUsuario === "admin" ? email : usuario.emailDocente;
        await sendMailToRecoveryPassword(emailDestino, token);

        res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
    } catch (error) {
        console.error("recuperarPasswordUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Comprobar token universal
const comprobarTokenPasswordUniversal = async (req, res) => {
    try {
        const { token } = req.params;

        // Buscar en administradores
        let usuario = await admin.findOne({ token });
        let tipoUsuario = "admin";

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ tokenDocente: token });
            tipoUsuario = "docente";
        }

        if (!usuario) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
    } catch (error) {
        console.error("comprobarTokenPasswordUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

// Crear nueva contraseña universal
const crearNuevoPasswordUniversal = async (req, res) => {
    try {
        const { password } = req.validated || req.body;
        const { token } = req.params;

        if (!token) return res.status(400).json({ msg: "Token inválido" });

        // Buscar en administradores
        let usuario = await admin.findOne({ token });
        let tipoUsuario = "admin";

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ tokenDocente: token });
            tipoUsuario = "docente";
        }

        if (!usuario) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        // Actualizar contraseña según el tipo de usuario
        if (tipoUsuario === "admin") {
            usuario.token = null;
            usuario.password = await usuario.encryptPassword(password);
        } else {
            usuario.tokenDocente = null;
            usuario.passwordDocente = await usuario.encryptPassword(password);
        }

        await usuario.save();

        res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
    } catch (error) {
        console.error("crearNuevoPasswordUniversal error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export {
    recuperarPasswordUniversal,
    comprobarTokenPasswordUniversal,
    crearNuevoPasswordUniversal
};