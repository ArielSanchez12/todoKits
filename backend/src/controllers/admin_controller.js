import {sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import admin from "../models/admin.js"


const registro = async (req,res) => {
    const {email,password} = req.body
    if(Object.values(req.body).includes("")) return res.status(400).json({msg: "Todos los campos son obligatorios"})
    const adminEmailBDD = await admin.findOne({email})
    if (adminEmailBDD) return res.status(400).json({msg:"El email ya está registrado"})
    const nuevoAdmin = new admin(req.body)
    nuevoAdmin.password = await nuevoAdmin.encryptPassword(password)
    const token = nuevoAdmin.createToken()
    await sendMailToRegister(email,token)

    await nuevoAdmin.save()

    res.status(200).json({msg: "Revisa tu correo electrónico"})
}

const confirmarMail = async (req,res)=>{
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const adminEmailBDD = await admin.findOne({token:req.params.token})
    if(!adminEmailBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    adminEmailBDD.token = null
    adminEmailBDD.confirmEmail=true
    await adminEmailBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"});
}

//Etapa 1
const recuperarPassword = async (req,res) => { 

    const {email}= req.body//1. Obtener el email
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"}) //2. Validar que no se deje vacio el campo correo
    
    const adminEmailBDD = await admin.findOne({email})
    if(!adminEmailBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no existe"}) //3. Validar que el correo exista


    const token = adminEmailBDD.createToken()//4. Crear token para la verificacion de correo
    adminEmailBDD.token = token
    await sendMailToRecoveryPassword(email,token)
    await adminEmailBDD.save()

    //5. Confirmacion
    res.status(200).json({msg:"Revisa tu correo para restablecer tu contraseña"})
}

//Etapa 2
const comprobarTokenPassword = async (req,res) => {
    const {token} = req.params
    const adminEmailBDD = await admin.findOne({token})
    if(adminEmailBDD.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})

    await adminEmailBDD.save()

    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"})
}

//Etapa 3
const crearNuevoPassword = (req,res) => {
    res.send("Felicitaciones, ya puedes iniciar sesión con tu nuueva contraseña")
}



export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPassword
}