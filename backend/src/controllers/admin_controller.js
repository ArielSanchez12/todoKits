import { sendMailToRegister, sendMailToRecoveryPassword, sendMailToChangeEmail, sendMailToDocente } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/jwt.js"
import admin from "../models/admin.js"
import mongoose from "mongoose"
import docente from "../models/docente.js"
import { v2 as cloudinary } from 'cloudinary'


const registro = async (req, res) => {
    try {
        // ahora usamos req.validated (viene del middleware)
        const { nombre, apellido, celular, email, password } = req.validated || req.body;

        // comprobacion de email existente
        const adminEmailBDD = await admin.findOne({ email });
        if (adminEmailBDD) return res.status(400).json({ msg: "El email ya está registrado" });

        const nuevoAdmin = new admin({ nombre, apellido, celular, email });
        nuevoAdmin.password = await nuevoAdmin.encryptPassword(password);
        const token = nuevoAdmin.createToken();

        await nuevoAdmin.save();
        await sendMailToRegister(email, token);
        res.status(200).json({ msg: "Revisa tu correo electrónico" });
    } catch (error) {
        console.error("registro error:", error);
        if (error?.name === "ValidationError") return res.status(400).json({ msg: error.message });
        res.status(500).json({ msg: "Error en el servidor" });
    }
}

const confirmarMail = async (req, res) => {
    if (!(req.params.token)) return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    const adminEmailBDD = await admin.findOne({ token: req.params.token })
    if (!adminEmailBDD?.token) return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" })
    adminEmailBDD.token = null
    adminEmailBDD.confirmEmail = true
    await adminEmailBDD.save()
    res.status(200).json({ msg: "Token confirmado, ya puedes iniciar sesión" });
}

//Etapa 1
const recuperarPassword = async (req, res) => {
    try {
        // Datos ya validados por Zod (req.validated)
        const { email } = req.validated || req.body;

        const adminEmailBDD = await admin.findOne({ email });
        if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" });

        const token = adminEmailBDD.createToken();
        adminEmailBDD.token = token;
        await adminEmailBDD.save();

        // Enviar el correo con el token
        await sendMailToRecoveryPassword(email, token);

        res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
    } catch (error) {
        console.error("recuperarPassword error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
}

//Etapa 2
const comprobarTokenPassword = async (req, res) => {
    const { token } = req.params
    const adminEmailBDD = await admin.findOne({ token })
    if (adminEmailBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })

    await adminEmailBDD.save()

    res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" })
}

//Etapa 3
const crearNuevoPassword = async (req, res) => {
    try {
        // Datos ya validados por Zod (incluye validación de coincidencia)
        const { password, confirmpassword } = req.validated || req.body;
        const { token } = req.params;

        if (!token) return res.status(400).json({ msg: "Token inválido" });

        const adminEmailBDD = await admin.findOne({ token });
        if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
        if (adminEmailBDD.token !== token) return res.status(404).json({ msg: "Lo sentimos, token inválido o expirado" });

        adminEmailBDD.token = null;
        adminEmailBDD.password = await adminEmailBDD.encryptPassword(password);
        await adminEmailBDD.save();

        res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
    } catch (error) {
        console.error("crearNuevoPassword error:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
}

const login = async (req, res) => {
    //Obtencion de datos
    const { email, password } = req.body

    //Validacion de datos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Todos los campos son obligatorios" })

    //Comprobacion de email/password
    const adminEmailBDD = await admin.findOne({ email }).select("-status -__v -token -createdAt -updatedAt")
    if (adminEmailBDD?.confirmEmail === false) return res.status(401).json({ msg: "Lo sentimos, debes verificar tu cuenta antes de iniciar sesión" })
    if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" })

    const verificarPassword = await adminEmailBDD.matchPassword(password)
    if (!verificarPassword) return res.status(401).json({ msg: "Lo sentimos, el password es incorrecto" })

    //Desestructurar solo los campos permitidos (sin 'direccion')
    const { nombre, apellido, celular, _id, rol, email: emailAd } = adminEmailBDD;
    const tokenJWT = crearTokenJWT(adminEmailBDD._id, adminEmailBDD.rol)

    //Aca mandamos el objeto que desestructuramos arriba
    res.status(200).json({
        token: tokenJWT,
        rol,
        usuario: {
            _id,
            nombre,
            apellido,
            celular,
            emailAd,
            rol,
            avatar: adminEmailBDD.avatar || null
        }
    });
}

const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.adminEmailBDD //Quita todo lo que esta antes de ... y lo demas lo guarda en datosPerfil para almacenarlos en la respuesta req.admin
    res.status(200).json(datosPerfil)
}

// Confirmación de nuevo email (token enviado al nuevo correo)
const confirmarNuevoEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ msg: "Token inválido" });

        const adminEmailBDD = await admin.findOne({ token, pendingEmail: { $exists: true } });
        if (!adminEmailBDD) return res.status(404).json({ msg: "Token inválido o expirado" });

        // aplicar cambio de email
        adminEmailBDD.email = adminEmailBDD.pendingEmail;
        adminEmailBDD.pendingEmail = null;
        adminEmailBDD.token = null;
        // opcional: marcar confirmEmail true si deseas
        adminEmailBDD.confirmEmail = true;
        await adminEmailBDD.save();

        return res.status(200).json({ msg: "Email confirmado y actualizado correctamente" });
    } catch (error) {
        console.error("confirmarNuevoEmail error:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.validated || req.body; // datos validados por Zod
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });

        const adminEmailBDD = await admin.findById(id);
        if (!adminEmailBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el usuario ${id}` });

        // Si cambian email, iniciar flujo de verificación (No hace falta verificar si los correos son iguales ya que el flujo solo se inicia si son diferentes, caso contrario se actualizan los otros campos)
        if (data.email && data.email !== adminEmailBDD.email) {
            // comprobar que no exista ese email ya en uso
            const existe = await admin.findOne({ email: data.email });
            if (existe) return res.status(400).json({ msg: "El email ya se encuentra registrado" });

            // Crear token y guardar email pendiente
            const token = adminEmailBDD.createToken();
            adminEmailBDD.pendingEmail = data.email;
            adminEmailBDD.token = token;

            // Actualizar otros campos
            if (data.nombre) adminEmailBDD.nombre = data.nombre;
            if (data.apellido) adminEmailBDD.apellido = data.apellido;
            if (data.celular) adminEmailBDD.celular = data.celular;

            await adminEmailBDD.save();
            // enviar correo de verificación al nuevo email
            await sendMailToChangeEmail(data.email, token);
            return res.status(200).json({ msg: "Se envió un correo de confirmación al nuevo email. El cambio se aplicará cuando lo confirmes." });
        }

        // Si no hay cambio de email, actualiza directamente
        if (data.nombre) adminEmailBDD.nombre = data.nombre;
        if (data.apellido) adminEmailBDD.apellido = data.apellido;
        if (data.celular) adminEmailBDD.celular = data.celular;

        // Manejo de avatar (si llega file)
        if (req.files?.avatar) {
            try {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'Admins' },
                    async (error, result) => {
                        if (error) return res.status(500).json({ msg: 'Error al subir imagen', error });
                        adminEmailBDD.avatar = result.secure_url;
                        await adminEmailBDD.save();
                        return res.status(200).json(adminEmailBDD);
                    }
                );
                uploadStream.end(req.files.avatar.data);
                return;
            } catch (err) {
                return res.status(500).json({ msg: 'Error al procesar imagen', err });
            }
        }

        await adminEmailBDD.save();
        return res.status(200).json({
            msg: "Perfil actualizado correctamente",
            admin: {
                nombre: adminEmailBDD.nombre,
                apellido: adminEmailBDD.apellido,
                email: adminEmailBDD.email,
                celular: adminEmailBDD.celular
            }
        });
    } catch (error) {
        console.error("actualizarPerfil error:", error);
        return res.status(500).json({ msg: "Error en el servidor" });
    }
};

const actualizarPassword = async (req, res) => {
    try {
        // Datos validados por Zod (incluye confirmpassword y que password sea diferente)
        const { passwordactual, passwordnuevo, confirmpassword } = req.validated || {};

        // Verificar token JWT y obtener admin
        const adminEmailBDD = await admin.findById(req.adminEmailBDD._id);
        if (!adminEmailBDD) return res.status(404).json({ msg: "Administrador no encontrado" });

        // Verificar contraseña actual
        const verificarPassword = await adminEmailBDD.matchPassword(passwordactual);
        if (!verificarPassword) return res.status(400).json({ msg: "La contraseña actual es incorrecta" });

        // Aquí Zod ya verificó que passwordnuevo !== passwordactual
        adminEmailBDD.password = await adminEmailBDD.encryptPassword(passwordnuevo);
        await adminEmailBDD.save();
        return res.status(200).json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("actualizarPassword error:", error);
        return res.status(500).json({ msg: "Error del servidor" });
    }
};

const registrarDocente = async (req, res) => {
    try {
        // Datos ya validados por Zod
        const datos  = req.validated || req.body;
        const { emailDocente } = datos;

        const verificarEmailBDD = await docente.findOne({ emailDocente });
        if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });

        const password = Math.random().toString(36).toUpperCase().slice(2, 5);

        const nuevoDocente = new docente({
            ...datos, // Usar los datos validados con las transformaciones
            passwordDocente: await docente.prototype.encryptPassword("KITS" + password),
            admin: req.adminEmailBDD._id
        });

        // Procesamiento de imagen si existe
        if (req.files?.imagen) {
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'Docentes' },
                    (error, result) => {
                        if (error) return reject(error);
                        nuevoDocente.avatarDocente = result.secure_url;
                        resolve();
                    }
                );
                uploadStream.end(req.files.imagen.data);
            });
        }

        await nuevoDocente.save();
        await sendMailToDocente(emailDocente, "KITS" + password);
        res.status(201).json({ msg: "Registro exitoso del docente" });
    } catch (error) {
        console.error("Error al registrar docente:", error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword,
    confirmarNuevoEmail,
    registrarDocente
}