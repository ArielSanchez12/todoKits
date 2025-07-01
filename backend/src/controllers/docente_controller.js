import docente from "../models/docente.js"
import { sendMailToDocente } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"

const registrarDocente = async (req,res) => {
  //Obtener los datos
  const {emailDocente} = req.body


  if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
  const verificarEmailBDD = await docente.findOne({emailDocente})
  if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

  const password = Math.random().toString(36).toUpperCase().slice(2,5)

  const nuevoDocente = new docente({
    ...req.body,
    passwordDocente: await docente.prototype.encryptPassword(password),
    admin: req.adminEmailBDD._id  
  })

  if(req.files?.imagen){
    const {secure_url, public_id} = await cloudinary.uploader.upload(req.files.imagen.tempFilePath,{folder:'Docentes'})
    nuevoDocente.avatarDocente = secure_url
    nuevoDocente.avatarDocenteIA = public_id
    await fs.unlink(req.files.imagen.tempFilePath)
  }

  await nuevoDocente.save()
  await sendMailToDocente(emailDocente, "KITS" + password) 

  res.status(201).json({msg: "Registro exitoso del docente"})

}

export {
  registrarDocente
}