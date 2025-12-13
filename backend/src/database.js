import mongoose from 'mongoose'

mongoose.set('strictQuery', true) //Esto quiere decir que si tenemos 3 campos, DEBEN PASARSE LOS 3 CAMPOS al insertar un registro, sino no se dejara insertar

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado"); //estos log si deben quedarse para saber que la conexion fue exitosa
  } catch (error) {
    console.log("Error de conexión a MongoDB:", error.message);
  }
};

export default connection;