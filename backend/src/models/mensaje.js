import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema(
  {
    texto: { type: String, required: true },
    de: { type: mongoose.Schema.Types.ObjectId, required: true },
    deTipo: { type: String, enum: ["docente", "admin"], required: true },
    para: { type: mongoose.Schema.Types.ObjectId, required: true },
    paraTipo: { type: String, enum: ["docente", "admin"], required: true },
    // ✅ NUEVO: Para mensajes especiales de transferencia
    tipo: {
      type: String,
      enum: ["normal", "transferencia"],
      default: "normal",
    },
    // ✅ NUEVO: Datos de la transferencia
    transferencia: {
      codigo: { type: String },
      qrImageUrl: { type: String }, // URL de la imagen del QR
      recursos: [{ type: String }], // Nombres de los recursos
      docenteOrigen: { type: String }, // Nombre del docente que transfiere
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mensaje", mensajeSchema);