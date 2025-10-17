import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/jwt.js"
import admin from "../models/admin.js"
import mongoose from "mongoose"
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

    const { email } = req.body//1. Obtener el email
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" }) //2. Validar que no se deje vacio el campo correo

    const adminEmailBDD = await admin.findOne({ email })
    if (!adminEmailBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no existe" }) //3. Validar que el correo exista


    const token = adminEmailBDD.createToken()//4. Crear token para la verificacion de correo
    adminEmailBDD.token = token
    await adminEmailBDD.save() //Cambie en el mismo orden del registro porque aca tampoco se cambia a null el token
    // Enviar el correo con el token
    await sendMailToRecoveryPassword(email, token)

    //5. Confirmacion
    res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" })
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
    const { password, confirmpassword } = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    if (password !== confirmpassword) return res.status(404).json({ msg: "Lo sentimos, los passwords no coinciden" })
    const adminEmailBDD = await admin.findOne({ token: req.params.token })
    if (adminEmailBDD.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" })
    adminEmailBDD.token = null
    adminEmailBDD.password = await adminEmailBDD.encryptPassword(password)
    await adminEmailBDD.save()

    res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" })
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


const actualizarPerfil = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, celular, email } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes("") && !req.files?.avatar) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    const adminEmailBDD = await admin.findById(id);
    if (!adminEmailBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el usuario ${id}` });
    if (adminEmailBDD.email != email) {
        const adminEmailBDD2 = await admin.findOne({ email });
        if (adminEmailBDD2) {
            return res.status(404).json({ msg: `Lo sentimos, el email existe ya se encuentra registrado` });
        }
    }
    adminEmailBDD.nombre = nombre ?? adminEmailBDD.nombre;
    adminEmailBDD.apellido = apellido ?? adminEmailBDD.apellido;
    adminEmailBDD.celular = celular ?? adminEmailBDD.celular;
    adminEmailBDD.email = email ?? adminEmailBDD.email;

    // Manejo de imagen/avatar
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
    res.status(200).json(adminEmailBDD);
}


const actualizarPassword = async (req, res) => {
    const adminEmailBDD = await admin.findById(req.adminEmailBDD._id)
    if (!adminEmailBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el administrador ${id}` })
    const verificarPassword = await adminEmailBDD.matchPassword(req.body.passwordactual)
    if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password actual no es el correcto" })
    adminEmailBDD.password = await adminEmailBDD.encryptPassword(req.body.passwordnuevo)
    await adminEmailBDD.save()
    res.status(200).json({ msg: "Password actualizado correctamente" })
}

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword,
    crearNuevoPassword,
    login,
    perfil,
    actualizarPerfil,
    actualizarPassword
}