import {Schema, model} from 'mongoose'; //Librerias para generar el schema/modelo de nuestra BDD
import bcrypt from 'bcryptjs'

//Y aqui es donde se definen las cosas que van en la tabla
const adminSchema = new Schema({

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

    password:{ //Este es el this.password
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
        default:"Administrador"
    }

}, {
    timestamps:true //Para guardar en automatico las fechas de cuando se creo y actualizo el registro
}) 

// Método para cifrar el password del veterinario
adminSchema.methods.encryptPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncrypt = await bcrypt.hash(password,salt)
    return passwordEncrypt
}

adminSchema.methods.matchPassword = async function(password){//Esta es la contraseña que le pasamos cuando llenamos los campos
    const response = await bcrypt.compare(password,this.password) //Este this.password es el de arriba del modelo, ya que estamos usando el 'adminSchema'
    return response
}

adminSchema.methods.createToken = function(){
    const tokenGenerado = this.token = Math.random().toString(32).slice(2) //Igual como arriba, este this.token sale del modelo
    return tokenGenerado
}

//Aqui model es como nuestra tabla vacia y le pasamos el nombre del archivo (sin extension .js) y luego el schema
export default model('Admin', adminSchema) 