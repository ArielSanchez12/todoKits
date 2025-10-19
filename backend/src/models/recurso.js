import mongoose from "mongoose";

const recursoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["kit", "llave", "proyector"],
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      unique: true, // Asegurar que KIT #1 no se repita
    },
    laboratorio: {
      type: String,
      required: function () {
        return this.tipo !== "proyector"; // No requerido para proyectores
      },
    },
    aula: {
      type: String,
      required: function () {
        return this.tipo !== "proyector"; // No requerido para proyectores
      },
    },
    contenido: {
      type: [String],
      default: [],
      required: function () {
        return this.tipo !== "llave"; // No requerido para llaves
      },
    },
    estado: {
      type: String,
      enum: ["pendiente", "activo", "prestado"],
      default: "pendiente",
    },
    asignadoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Docente",
      default: null, // Null si no está asignado
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Recurso", recursoSchema);