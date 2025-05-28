import mongoose from 'mongoose'

mongoose.set('strictQuery', true) //Esto quiere decir que si tenemos 3 campos, DEBEN PASARSE LOS 3 CAMPOS al insertar un registro, sino no se dejara insertar

const connection = async () => { 
    try {
        await mongoose.connect(process.env.MONGODB_URI_LOCAL)
        console.log("Database is connected")
    } catch (error) {
        console.log(error)
    }
}

export default connection