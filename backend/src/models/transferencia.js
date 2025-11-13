import mongoose, { Schema, model } from 'mongoose';

const transferenciaSchema = new Schema(
  {
    prestamoOriginal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "prestamo",
      required: true,
      immutable: true,
    },
    docenteOrigen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "docente",
      required: true,
      immutable: true,
    },
    docenteDestino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "docente",
      required: true,
      immutable: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
      immutable: true,
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
      immutable: true,
    },
    estado: {
      type: String,
      enum: ["pendiente_origen", "confirmado_origen", "aceptado_destino", "cancelado", "rechazado", "finalizado"],
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
      immutable: true,
    },
    firmaDestino: {
      type: String,
      default: "",
      immutable: true,
    },
    fechaSolicitud: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    fechaConfirmacionOrigen: {
      type: Date,
    },
    fechaConfirmacionDestino: {
      type: Date,
    },
    fechaCancelacion: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model('Transferencia', transferenciaSchema);