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
            emailDestino = usuario?.emailDocente;

            console.log("Docente encontrado:", !!usuario);
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
        console.log(`Enviando email a ${emailDestino} (${tipoUsuario})`);

        // Enviar correo (usa el email correcto según el tipo)
        // Enviar correo con la función adecuada según el tipo
        if (tipoUsuario === "admin") {
            await sendMailToRecoveryPassword(emailDestino, token);
        } else {
            await sendMailToRecoveryPasswordDocente(emailDestino, token);
        }

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

        console.log("Verificando token:", token);

        // Buscar en administradores
        let usuario = await admin.findOne({ token });

        console.log("Admin con token encontrado:", !!usuario);

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ tokenDocente: token });
            console.log("Docente con token encontrado:", !!usuario);
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

        console.log("Creando nueva contraseña con token:", token);

        if (!token) return res.status(400).json({ msg: "Token inválido" });

        // Buscar en administradores
        let usuario = await admin.findOne({ token });
        let tipoUsuario = "admin";

        console.log("Admin encontrado:", !!usuario);

        // Si no existe en admin, buscar en docentes
        if (!usuario) {
            usuario = await docente.findOne({ tokenDocente: token });
            tipoUsuario = "docente";
            console.log("Docente encontrado:", !!usuario);
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

        console.log(`Contraseña actualizada para ${tipoUsuario}`);

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