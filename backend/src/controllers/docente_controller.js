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

  if (req.files?.imagen) {
    await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'Docentes' },
        (error, result) => {
          if (error) return reject(error);
          nuevoDocente.avatarDocente = result.secure_url;
          nuevoDocente.avatarDocenteIA = result.public_id;
          resolve();
        }
      );
      uploadStream.end(req.files.imagen.data); // si aqui se llama imagen, en la consulta de postman tambien se debe llamar imagen (no avatarDocente, ni avatarDocenteIA)
    });
  }

  await nuevoDocente.save()
  await sendMailToDocente(emailDocente, "KITS" + password) 
  res.status(201).json({msg: "Registro exitoso del docente"})
}

const listarDocentes = async (req,res) => {
    const docentes = await admin.find({estatusDocente:true}).where('docente').equals(req.adminEmailBDD).select("-salida -createdAt -updatedAt -__v").populate('docente','_id nombre apellido')
    res.status(200).json(docentes)
}

export {
  registrarDocente,
  listarDocentes
}