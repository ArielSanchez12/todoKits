import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import { crearTokenJWT } from "../middlewares/jwt.js"
import admin from "../models/admin.js"
import mongoose from "mongoose"


const registro = async (req, res) => {
    const { email, password } = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Todos los campos son obligatorios" })
    const adminEmailBDD = await admin.findOne({ email })
    if (adminEmailBDD) return res.status(400).json({ msg: "El email ya está registrado" })
    const nuevoAdmin = new admin(req.body)
    nuevoAdmin.password = await nuevoAdmin.encryptPassword(password)
    const token = nuevoAdmin.createToken()
    // PRIMERO guarda el usuario
    await nuevoAdmin.save()
    // LUEGO envía el correo
    await sendMailToRegister(email, token)
    res.status(200).json({ msg: "Revisa tu correo electrónico" })
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

    //Desestructurar para mostrarle solo lo que queremos al usuario
    const { nombre, apellido, direccion, celular, _id, rol, emailAd } = adminEmailBDD;
    const tokenJWT = crearTokenJWT(adminEmailBDD._id, adminEmailBDD.rol)

    //Aca mandamos el objeto que desestructuramos arriba
    res.status(200).json({
        token: tokenJWT,
        rol,
        usuario: {
            _id,
            nombre,
            apellido,
            direccion,
            celular,
            emailAd,
            rol,
            avatar: null // Si algún día agregas avatar, cámbialo aquí
        }
    });
}

const perfil = (req, res) => {
    const { token, confirmEmail, createdAt, updatedAt, __v, ...datosPerfil } = req.adminEmailBDD //Quita todo lo que esta antes de ... y lo demas lo guarda en datosPerfil para almacenarlos en la respuesta req.admin
    res.status(200).json(datosPerfil)
}

const actualizarPerfil = async (req, res) => {
    const { id } = req.params
    const { nombre, apellido, direccion, celular, email } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, debe ser un id válido` });
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    const adminEmailBDD = await admin.findById(id)
    if (!adminEmailBDD) return res.status(404).json({ msg: `Lo sentimos, no existe el usuario ${id}` })
    if (adminEmailBDD.email != email) {
        const adminEmailBDD = await admin.findOne({ email })
        if (adminEmailBDD) {
            return res.status(404).json({ msg: `Lo sentimos, el email existe ya se encuentra registrado` })
        }
    }
    adminEmailBDD.nombre = nombre ?? adminEmailBDD.nombre
    adminEmailBDD.apellido = apellido ?? adminEmailBDD.apellido
    adminEmailBDD.direccion = direccion ?? adminEmailBDD.direccion
    adminEmailBDD.celular = celular ?? adminEmailBDD.celular
    adminEmailBDD.email = email ?? adminEmailBDD.email
    await adminEmailBDD.save()
    console.log(adminEmailBDD)
    res.status(200).json(adminEmailBDD)
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