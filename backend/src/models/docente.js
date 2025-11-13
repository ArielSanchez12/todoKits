import mongoose, { Schema, model } from 'mongoose'; //Librerias para generar el schema/modelo de nuestra BDD
import bcrypt  from 'bcryptjs'

//Y aqui es donde se definen las cosas que van en la tabla
const docenteSchema = new Schema({
    nombreDocente: {
        type: String,
        required: true,
        trim: true
    },
    apellidoDocente: {
        type: String,
        required: true,
        trim: true
    },
    celularDocente: {
        type: String,
        trim: true,
        default: null
    },
    avatarDocente: {
        type: String,
        default: null
    },
    avatarDocenteOriginal: { //Imagen original completa para el modal de ver imagen completa al hacer click
        type: String,
        default: null
    },
    emailDocente: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    passwordDocente: {
        type: String,
        required: true
    },
    statusDocente: {
        type: Boolean,
        default: true
    },
    tokenDocente: {
        type: String,
        default: null
    },
    confirmEmailDocente: {
        type: Boolean,
        default: false
    },
    rolDocente: {
        type: String,
        default: "Docente"
    },
    pendingEmailDocente: { // Nuevo campo para el cambio de email
        type: String,
        default: null
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    tratamientos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tratamiento'
    }]
}, {
    timestamps: true
})

//Metodo para cifrar contraseña
docenteSchema.methods.encryptPassword = async function (password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

//Metodo para verificar la contraseña
docenteSchema.methods.matchPassword = async function (password) {
    return bcrypt.compare(password, this.passwordDocente)
}

// Método para generar token (igual que en admin)
docenteSchema.methods.createToken = function () {
    const tokenGenerado = this.tokenDocente = Math.random().toString(32).slice(2)
    return tokenGenerado
}

// Método para actualizar información (similar a admin)
docenteSchema.methods.updateInfoFromProfile = function (data) {
    if (data.nombreDocente) this.nombreDocente = data.nombreDocente;
    if (data.apellidoDocente) this.apellidoDocente = data.apellidoDocente;
    if (data.celularDocente) this.celularDocente = data.celularDocente;
    if (data.emailDocente) this.emailDocente = data.emailDocente;
};

export default model('docente', docenteSchema)