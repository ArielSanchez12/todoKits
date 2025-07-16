import mongoose from "mongoose";
import Tratamiento from "../models/tratamiento.js";

const registrarTratamiento = async (req, res) => {
  const {docente} = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(docente)){
    return res.status(400).json({msg: "ID de docente inválido"})
  }
  
  await Tratamiento.create(req.body)
  res.status(201).json({msg: "Tratamiento registrado exitosamente"})

}

const listarTratamiento = async (req, res) => {
  const tratamientos = await Tratamiento.find()
  res.status(200).json(tratamientos)
}

const eliminarTratamiento = async (req, res) => {
  const {id} = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({msg: `ID de tratamiento no existe`});
  }

  await Tratamiento.findByIdAndDelete(id)
  res.status(200).json({msg: "Tratamiento eliminado exitosamente"})
}

export {
  registrarTratamiento,
  listarTratamiento,
  eliminarTratamiento
}