import sendMailToRegister from "../config/nodemailer.js"
import admin from "../models/admin.js"


const registro = async (req, res) => {

    const {email,password} = req.body

    if(Object.values(req.body).includes("")) return res.status(400).json
    ({msg: "Todos los campos son obligatorios"})

    const adminEmailBDD = await admin.findOne({email})

    if (adminEmailBDD) return res.status(400).json({msg:"El email ya está registrado"})
    
    const nuevoAdmin = new admin(req.body)
    nuevoAdmin.password = await nuevoAdmin.encryptPassword(password)

    const token = nuevoAdmin.createToken()
    await sendMailToRegister(email,token)


    await nuevoAdmin.save()

    res.status(200).json({msg: "Revisa tu correo electrónico"})
}

const confirmarMail = async (req, res) => {
    if(!(req.params.token)) return res.status(400).json({msg: "Lo sentimos, no se puede validar la cuenta"})
    
    const adminEmailBDD = await admin.findOne({token:req.params.token})

    if(!adminEmailBDD?.token) return res.status(404).json("La cuenta ya ha sido confirmada")
    adminEmailBDD.token = null
    adminEmailBDD.confirmEmail = true
    await adminEmailBDD.save()

    res.status(200).json({msg: "Token confirmado, ya puedes iniciar sesión"})
}

export{
    registro,
    confirmarMail
}