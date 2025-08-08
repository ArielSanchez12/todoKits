import mongoose, { Schema, model } from 'mongoose'

const tratamientoSchema = new Schema({
    nombreMateria: {
        type: String,
        required: true,
        trim: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    tipoRecuperacion: {
        type: String,
        required: true,
        enum: ['Ninguna', 'Repetición regular', 'Examen supletorio', 'Curso de recuperación intensivo']
    },
    numeroCreditos: {
        type: Number,
        required: true,
        min: 1
    },
    precioPorCredito: {
        type: Number,
        required: true,
        min: 1
    },
    precioTotal: {
        type: Number,
        required: true,
        min: 0
    },
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'docente'
    },
    estadoPago: {
        type: String,
        enum: ['Pendiente', 'Pagado'],
        default: 'Pendiente'
    }
}, {
    timestamps: true
})

export default model('Tratamiento', tratamientoSchema)