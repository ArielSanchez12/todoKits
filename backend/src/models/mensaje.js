import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  de: { type: mongoose.Schema.Types.ObjectId, required: true },
  deTipo: { type: String, enum: ["docente", "admin"], required: true },
  para: { type: mongoose.Schema.Types.ObjectId, required: true },
  paraTipo: { type: String, enum: ["docente", "admin"], required: true },
}, { timestamps: true });

export default mongoose.model("Mensaje", mensajeSchema);