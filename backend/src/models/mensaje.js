import { Schema, model } from "mongoose";
import { encrypt, decrypt, encryptArray, decryptArray } from "../helpers/encryption.js";

const mensajeSchema = new Schema(
  {
    texto: { type: String, required: true }, // Encriptado
    de: { type: Schema.Types.ObjectId, required: true },
    deTipo: { type: String, enum: ["docente", "admin"], required: true },
    para: { type: Schema.Types.ObjectId, required: true },
    paraTipo: { type: String, enum: ["docente", "admin"], required: true },
    tipo: {
      type: String,
      enum: ["normal", "transferencia"],
      default: "normal",
    },
    transferencia: {
      codigo: { type: String },        // Encriptado
      qrImageUrl: { type: String },    // Encriptado
      recursos: [{ type: String }],    // Cada elemento encriptado
      docenteOrigen: { type: String }, // Encriptado
    },
    // clientId para reconciliar mensajes optimistas
    clientId: {
      type: String,
      index: true,
      sparse: true
    },
    // estado persistente (delivered, read)
    estado: {
      type: String,
      enum: ["delivered", "read"],
      default: "delivered"
    },
    editedAt: { type: Date, default: null },
    softDeleted: { type: Boolean, default: false },
    createdAtTTL: {
      type: Date,
      default: Date.now,
      expires: 36000 // 10 horas
    },
    replyToId: { type: Schema.Types.ObjectId, ref: "Mensaje", default: null },
    replyToTexto: { type: String, default: null }, // Encriptado
    hiddenFor: [{ type: Schema.Types.ObjectId }], // usuarios para quienes está oculto (cuando se hace el eliminar para mi)
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índice TTL para expiración automática (para que los mensajes se eliminen de la bdd después de 10 horas automáticamente)
mensajeSchema.index({ createdAtTTL: 1 }, { expireAfterSeconds: 36000 });

// Pre-hook: encriptar datos antes de guardar
mensajeSchema.pre("save", function (next) {
  if (this.isModified("texto")) {
    this.texto = encrypt(this.texto);
  }

  if (this.isModified("replyToTexto") && this.replyToTexto) {
    this.replyToTexto = encrypt(this.replyToTexto);
  }

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

// Método: desencriptar mensaje para responder al cliente
mensajeSchema.methods.desencriptar = function () {
  const mensajeDesencriptado = {
    _id: this._id,
    texto: this.softDeleted ? "Mensaje eliminado" : decrypt(this.texto),
    de: this.de,
    deTipo: this.deTipo,
    para: this.para,
    paraTipo: this.paraTipo,
    tipo: this.tipo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    clientId: this.clientId,
    estado: this.estado,
    editedAt: this.editedAt,
    softDeleted: this.softDeleted,
    replyTo: this.replyToId 
      ? { _id: this.replyToId, texto: decrypt(this.replyToTexto) } 
      : null
  };

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

export default model("Mensaje", mensajeSchema);