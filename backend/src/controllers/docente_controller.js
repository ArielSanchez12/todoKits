import docente from "../models/docente.js"
import { sendMailToDocente } from "../config/nodemailer.js"
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs-extra"
import mongoose from "mongoose"
import Tratamiento from "../models/tratamiento.js"
import { crearTokenJWT } from "../middlewares/jwt.js"

const registrarDocente = async (req, res) => {
  //Obtener los datos
  const { emailDocente } = req.body


  if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
  const verificarEmailBDD = await docente.findOne({ emailDocente })
  if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" })

  const password = Math.random().toString(36).toUpperCase().slice(2, 5)

  const nuevoDocente = new docente({
    ...req.body,
    passwordDocente: await docente.prototype.encryptPassword("KITS" + password),
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
  res.status(201).json({ msg: "Registro exitoso del docente" })
}

const loginDocente = async (req, res) => {
  const { email: emailDocente, password: passwordDocente } = req.body
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" })
  const docenteBDD = await docente.findOne({ emailDocente })
  if (!docenteBDD) return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" })
  const verificarPassword = await docenteBDD.matchPassword(passwordDocente)
  if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" })
  const { _id, rolDocente } = docenteBDD
  const tokenJWT = crearTokenJWT(docenteBDD._id, docenteBDD.rolDocente)
  console.log(tokenJWT, rolDocente)
  res.status(200).json({
    token: tokenJWT,
    rol: rolDocente,
    _id
  })
}

const perfilDocente = (req, res) => {
  const camposAEliminar = [
    "statusDocente", "admin", "passwordDocente",
    "avatarDocente", "avatarDocenteIA", "avatarDocenteID",
    "createdAt", "updatedAt", "__v"
  ]

  camposAEliminar.forEach(campo => delete req.docenteBDD[campo])

  res.status(200).json(req.docenteBDD)
}


const listarDocentes = async (req, res) => {
  if (req.docenteBDD?.rolDocente === "Docente") {
    const docentes = await docente.find(req.docenteBDD._id).select("-salida -createdAt -updatedAt -__v").populate('admin', '_id nombre apellido')
    res.status(200).json(docentes)
  } else {
    const docentes = await docente.find({ statusDocente: true }).where('admin').equals(req.adminEmailBDD).select("-salida -createdAt -updatedAt -__v").populate('admin', '_id nombre apellido')
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


const eliminarDocente = async (req, res) => {
  const { id } = req.params
  if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` })
  const { salidaDocente } = req.body
  await docente.findByIdAndUpdate(req.params.id, { salidaDocente: Date.parse(salidaDocente), statusDocente: false })
  res.status(200).json({ msg: "Fecha de salida del docente registrada exitosamente" })
}

const actualizarDocente = async (req, res) => {
  const { id } = req.params
  if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe el docente ${id}` })
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
  res.status(200).json({ msg: "Actualización exitosa del docente" })
}

export {
  registrarDocente,
  loginDocente,
  perfilDocente,
  listarDocentes,
  detalleDocente,
  eliminarDocente,
  actualizarDocente
}