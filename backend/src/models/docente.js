import mongoose, {Schema, model} from 'mongoose'; //Librerias para generar el schema/modelo de nuestra BDD
import bcrypt from 'bcryptjs'

//Y aqui es donde se definen las cosas que van en la tabla
const docenteSchema = new Schema({

    nombreDocente:{
        type:String,
        required:true,
        trim:true
    },

    apellidoDocente:{
        type:String,
        required:true,
        trim:true
    },

    direccionDocente:{
        type:String,
        trim:true,
        default:null
    },

    celularDocente:{
        type:String,
        trim:true,
        default:null
    },

    avatarDocente:{
        type:String
    },

    avatarDocenteIA:{ //Si el usuario no sube una imagen, se le asigna una con inteligencia artificial
        type:String
    },

    emailDocente:{
        type:String,
        require:true,
        trim:true,
		unique:true
    },

    passwordDocente:{
        type:String,
        require:true
    },

    statusDocente:{
        type:Boolean,
        default:true
    },

    tokenDocente:{
        type:String,
        default:null
    },

    confirmEmailDocente:{
        type:Boolean,
        default:false
    }, 

    rolDocente:{
        type:String,
        default:"Docente"
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin' //Hacemos referencia a nuestro otro modelo(el nombre debe respetar mayusculas y minusculas)
    }

}, {
    timestamps:true 
}) 


export default model('docente', docenteSchema) 