import {Schema, model} from 'mongoose'; //Librerias para generar el schema/modelo de nuestra BDD
import bcrypt from 'bcryptjs'

//Y aqui es donde se definen las cosas que van en la tabla
const docenteSchema = new Schema({

    nombre:{
        type:String,
        required:true,
        trim:true
    },

    apellido:{
        type:String,
        required:true,
        trim:true
    },

    direccion:{
        type:String,
        trim:true,
        default:null
    },

    celular:{
        type:String,
        trim:true,
        default:null
    },

    email:{
        type:String,
        require:true,
        trim:true,
		unique:true
    },

    password:{
        type:String,
        require:true
    },

    status:{
        type:Boolean,
        default:true
    },

    token:{
        type:String,
        default:null
    },

    confirmEmail:{
        type:Boolean,
        default:false
    }, 

    rol:{
        type:String,
        default:"Docente"
    }

}, {
    timestamps:true 
}) 

//Falta confirmar si va aqui o no
export default model('docente', docenteSchema) 