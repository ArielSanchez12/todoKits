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
      unique: true,
    },
    // Solo para KIT y LLAVE
    laboratorio: {
      type: String,
      required: function () {
        return this.tipo === "kit" || this.tipo === "llave";
      },
      validate: {
        validator: function(v) {
          // Si es proyector, no debe tener laboratorio
          if (this.tipo === "proyector" && v) {
            return false;
          }
          return true;
        },
        message: "Los proyectores no deben tener laboratorio"
      }
    },
    // Solo para KIT y LLAVE
    aula: {
      type: String,
      required: function () {
        return this.tipo === "kit" || this.tipo === "llave";
      },
      validate: {
        validator: function(v) {
          // Si es proyector, no debe tener aula
          if (this.tipo === "proyector" && v) {
            return false;
          }
          return true;
        },
        message: "Los proyectores no deben tener aula"
      }
    },
    // Solo para KIT y PROYECTOR
    contenido: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          // Si es llave, no debe tener contenido
          if (this.tipo === "llave" && v && v.length > 0) {
            return false;
          }
          // Si es kit o proyector, debe tener al menos 1 elemento
          if ((this.tipo === "kit" || this.tipo === "proyector") && (!v || v.length === 0)) {
            return false;
          }
          return true;
        },
        message: function(props) {
          if (props.instance.tipo === "llave") {
            return "Las llaves no deben tener contenido";
          }
          return "Kits y proyectores deben tener al menos un elemento";
        }
      }
    },
    estado: {
      type: String,
      enum: ["pendiente", "activo", "prestado"],
      default: "pendiente",
    },
    asignadoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Docente",
      default: null,
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


// Middleware para limpiar campos no permitidos ANTES de validar
recursoSchema.pre('validate', function(next) {
  // Si es proyector, eliminar laboratorio y aula
  if (this.tipo === 'proyector') {
    this.laboratorio = undefined;
    this.aula = undefined;
  }
  
  // Si es llave, eliminar contenido
  if (this.tipo === 'llave') {
    this.contenido = undefined;
  }
  
  next();
});

// Middleware para limpiar campos no permitidos antes de guardar
recursoSchema.pre('save', function(next) {
  // Si es proyector, eliminar laboratorio y aula
  if (this.tipo === 'proyector') {
    this.laboratorio = undefined;
    this.aula = undefined;
  }
  
  // Si es llave, eliminar contenido
  if (this.tipo === 'llave') {
    this.contenido = undefined;
  }
  
  next();
});

export default mongoose.model("Recurso", recursoSchema);