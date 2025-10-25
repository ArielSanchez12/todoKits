import mongoose, { Schema, model } from 'mongoose';

const transferenciaSchema = new Schema(
  {
    prestamoOriginal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "prestamo",
      required: true,
    },
    docenteOrigen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "docente",
      required: true,
    },
    docenteDestino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "docente",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    recursos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recurso",
      },
    ],
    recursosAdicionales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recurso",
      },
    ],
    codigoQR: {
      type: String,
      required: true,
      unique: true,
    },
    estado: {
      type: String,
      enum: ["pendiente_origen", "confirmado_origen", "aceptado_destino", "rechazado", "finalizado"],
      default: "pendiente_origen",
    },
    observacionesOrigen: {
      type: String,
      default: "",
    },
    observacionesDestino: {
      type: String,
      default: "",
    },
    firmaOrigen: {
      type: String,
      default: "",
    },
    firmaDestino: {
      type: String,
      default: "",
    },
    fechaSolicitud: {
      type: Date,
      default: Date.now,
    },
    fechaConfirmacionOrigen: {
      type: Date,
    },
    fechaConfirmacionDestino: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model('Transferencia', transferenciaSchema);