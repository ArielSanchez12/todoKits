import mongoose from "mongoose";
import { encrypt, decrypt, encryptArray, decryptArray } from "../helpers/encryption.js";

const mensajeSchema = new mongoose.Schema(
  {
    texto: { type: String, required: true }, // Encriptado
    de: { type: mongoose.Schema.Types.ObjectId, required: true },
    deTipo: { type: String, enum: ["docente", "admin"], required: true },
    para: { type: mongoose.Schema.Types.ObjectId, required: true },
    paraTipo: { type: String, enum: ["docente", "admin"], required: true },
    tipo: {
      type: String,
      enum: ["normal", "transferencia"],
      default: "normal",
    },
    transferencia: {
      codigo: { type: String }, // Encriptado
      qrImageUrl: { type: String }, // Encriptado
      recursos: [{ type: String }], // Cada elemento encriptado
      docenteOrigen: { type: String }, // Encriptado
    },
    // ✅ NUEVO: Campo para TTL (expira a los 24 horas)
    createdAtTTL: {
      type: Date,
      default: Date.now,
      expires: 36000 // 36000 segundos = 10 horas
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Crear índice TTL (10 horas)
mensajeSchema.index({ createdAtTTL: 1 }, { expireAfterSeconds: 36000 });

// ✅ HOOK: Encriptar antes de guardar
mensajeSchema.pre("save", function (next) {
  // Encriptar texto del mensaje
  if (this.isModified("texto")) {
    this.texto = encrypt(this.texto);
  }

  // Encriptar datos de transferencia si existen
  if (this.tipo === "transferencia" && this.transferencia) {
    if (this.isModified("transferencia.codigo")) {
      this.transferencia.codigo = encrypt(this.transferencia.codigo);
    }
    if (this.isModified("transferencia.qrImageUrl")) {
      this.transferencia.qrImageUrl = encrypt(this.transferencia.qrImageUrl);
    }
    if (this.isModified("transferencia.recursos")) {
      this.transferencia.recursos = encryptArray(this.transferencia.recursos);
    }
    if (this.isModified("transferencia.docenteOrigen")) {
      this.transferencia.docenteOrigen = encrypt(this.transferencia.docenteOrigen);
    }
  }

  next();
});

// ✅ MÉTODO: Obtener mensaje desencriptado
mensajeSchema.methods.desencriptar = function () {
  const mensajeDesencriptado = {
    _id: this._id,
    texto: decrypt(this.texto),
    de: this.de,
    deTipo: this.deTipo,
    para: this.para,
    paraTipo: this.paraTipo,
    tipo: this.tipo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };

  // Desencriptar transferencia si existe
  if (this.tipo === "transferencia" && this.transferencia) {
    mensajeDesencriptado.transferencia = {
      codigo: decrypt(this.transferencia.codigo),
      qrImageUrl: decrypt(this.transferencia.qrImageUrl),
      recursos: decryptArray(this.transferencia.recursos),
      docenteOrigen: decrypt(this.transferencia.docenteOrigen)
    };
  }

  return mensajeDesencriptado;
};

export default mongoose.model("Mensaje", mensajeSchema);