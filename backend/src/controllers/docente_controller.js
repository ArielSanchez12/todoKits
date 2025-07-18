import docente from "../models/docente.js"
import { sendMailToDocente } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import mongoose from "mongoose"
import Tratamiento from "../models/tratamiento.js"

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
  if (req.adminEmailBDD?.rol ==="admin"){
    const docentes = await docente.find(req.adminEmailBDD._id).select("-salida -createdAt -updatedAt -__v").populate('admin','_id nombre apellido')
    res.status(200).json(docentes)
  }else{
    const docentes = await docente.find({statusDocente:true}).where('admin').equals(req.adminEmailBDD).select("-salida -createdAt -updatedAt -__v").populate('admin','_id nombre apellido')
    res.status(200).json(docentes)
  }
}

const detalleDocente = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` });
  }

  const docentes = await docente.findById(id)
    .select("-createdAt -updatedAt -__v")
    .populate('admin', '_id nombre apellido');

  const tratamientos = await Tratamiento.find().where('docente').equals(id);

  res.status(200).json({
    docentes,
    tratamientos
  });
}


const eliminarDocente = async (req,res)=>{
  const {id} = req.params
  if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
  if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el docente ${id}`})
  const {salidaDocente} = req.body
  await docente.findByIdAndUpdate(req.params.id,{salidaDocente:Date.parse(salidaDocente),statusDocente:false})
  res.status(200).json({msg:"Fecha de salida del docente registrada exitosamente"})
}

const actualizarDocente = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, no existe el docente ${id}`})
    if (req.files?.imagen) {
        const docentes = await docente.findById(id)
        if (docentes.avatarMascotaID) {
            await cloudinary.uploader.destroy(docentes.avatarMascotaID);
        }
        const cloudiResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, { folder: 'Docentes' });
        req.body.avatarDocente = cloudiResponse.secure_url;
        req.body.avatarDocenteID = cloudiResponse.public_id;
        await fs.unlink(req.files.imagen.tempFilePath);
    }
    await docente.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del docente"})
}

export {
  registrarDocente,
  listarDocentes,
  detalleDocente,
  eliminarDocente,
  actualizarDocente
}