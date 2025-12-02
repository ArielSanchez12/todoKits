import mongoose, { Schema, model } from 'mongoose';

const prestamoSchema = new Schema(
  {
    // Fecha de creación del préstamo (auto)
    fechaPrestamo: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Recurso prestado
    recurso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "recurso",
      required: true,
    },

    // Docente responsable
    docente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "docente",
      required: true,
    },

    // Admin que realizó el préstamo
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },

    // Motivo del préstamo
    motivo: {
      tipo: {
        type: String,
        enum: ["Clase", "Conferencia", "Transferencia", "Otro"],
        required: true,
      },
      descripcion: {
        type: String,
        required: function () {
          return this.motivo.tipo === "Otro";
        },
      },
    },

    // Observaciones del admin
    observaciones: {
      type: String,
      default: "",
    },

    // Estado del préstamo
    estado: {
      type: String,
      enum: ["pendiente", "activo", "finalizado", "rechazado"],
      default: "pendiente",
    },

    // Hora de confirmación por el docente
    horaConfirmacion: {
      type: Date,
      default: null,
    },

    // Hora de devolución
    horaDevolucion: {
      type: Date,
      default: null,
    },

    // Firma del docente (su _id convertido a string pero no editable)
    firmaDocente: {
      type: String,
      default: null,
      immutable: function () {
        // Solo inmutable si la firma ya tiene un valor (es decir, no se puede cambiar una vez puesta)
        return this.firmaDocente !== null;
      }
    },

    // Recursos adicionales mencionados en observaciones (parseados automáticamente)
    recursosAdicionales: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "recurso",
    }],
  },
  {
    timestamps: true,
  }
);

// Middleware para detectar recursos adicionales en observaciones
prestamoSchema.pre('save', async function (next) {
  if (this.observaciones && this.isModified('observaciones')) {
    // Buscar patrones como "KIT #2", "LLAVE #1", "PROYECTOR #3"
    const patron = /(KIT|LLAVE|PROYECTOR)\s*#(\d+)/gi;
    const matches = [...this.observaciones.matchAll(patron)];

    if (matches.length > 0) {
      const Recurso = mongoose.model('recurso');
      const nombresRecursos = matches.map(m => `${m[1].toUpperCase()} #${m[2]}`);

      // Buscar recursos por nombre
      const recursos = await Recurso.find({
        nombre: { $in: nombresRecursos },
        _id: { $ne: this.recurso }, // Excluir el recurso principal
        admin: this.admin  // <-- FILTRAR POR ADMIN ACTUAL
      }).select('_id');

      this.recursosAdicionales = recursos.map(r => r._id);
    }
  }
  next();
});

export default model('prestamo', prestamoSchema);