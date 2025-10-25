// Requerir los módulos
import express from 'express' //Framework que vamos a usar
import dotenv from 'dotenv'   //Este framework es para trabajar con variables globales, se definen en el archivo .env y luego se las usa donde querramos
import cors from 'cors';      //Este funciona cuando trabajamos con distintos sitios de despliegue, por ejemplo el front lo subo a github y el server a otra pagina y con cors se pueden comunicar sin dar problemas
import routerAdmin from './routers/admin_routes.js'; //Renombrar cada router para cada modelo, luego copia y pega abajo en app.use para que se ponga en azul
import routerDocente from './routers/docente_routes.js';
import routerTratamiento from './routers/tratamiento_routes.js'; //Importar el router de tratamiento
import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload"
//IMPORTACIONES NUEVAS PARA GOOGLE LOGIN
import session from 'express-session'
import passport from 'passport'
import './config/google.js' // Importa configuración de Google OAuth
import routerAuth from './routers/auth_routes.js' // Nueva ruta para login con Google
import routerChat from './routers/mensaje_routes.js';
import routerRecurso from './routers/recurso_routes.js';
import routerPrestamo from './routers/prestamo_routes.js';
import routerTransferencia from "./routers/transferencia_routes.js";


// Inicializaciones
const app = express() //Crear instancia como en POO
dotenv.config()

//Para usar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use(fileUpload({ //Cuando se haga una carga de imagenes, se usara la carpeta Temp de nuestra computadora para que la imagen original
    useTempFiles: false, //se quede en nuestra compu antes de enviarla a Cloudinary
    //tempFileDir : './tmp' //Nuestra ruta se llamara temp(no uploads porque lo nuestro ya esta en la nube) y estara en la raiz del proyecto
}))

// Configuraciones - Esto es un set de POO, es decir le establecemos el valor
app.set('port', process.env.PORT || 3000) //Aqui lo que hacemos es traer la variable global desde .env O si falla, que sea 3000
app.use(cors()) //Para usar el framework cors, cada que veas 'estancia'.use('algo') es un MIDDLEWARE, es decir, un intermediario



// Middlewares
// Middleware para sesiones y passport
app.use(passport.initialize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Rutas 
app.get('/', (req, res) => {   //Raiz -> '/', luego una funcion callback, y si responde, se envia ese texto, ejemplo http:localhost:3000/ si ejecutamos esa raiz al final de 3000, nos trae Server on
    res.send("Server on")
})

// Rutas unificadas de autenticación (para ambos usuarios)
app.use('/api', routerAuth)
//Hasta aqui llega este paso http://localhost:3000/api
app.use('/api', routerAdmin)//Aca copia y pega
//Rutas docente
app.use('/api', routerDocente)
//Rutas tratamiento
app.use('/api', routerTratamiento)
// Ruta para gestionar los recursos
app.use('/api', routerRecurso)
//Ruta de chat
app.use('/api', routerChat);
//Rutas prestamos
app.use("/api", routerPrestamo);
//Rutas transferencias
app.use("/api", routerTransferencia);


//Manejo de rutas inexistentes
app.use((req, res) => { res.status(404).send("Endpoint no encontrado") })

// Exportar la instancia de express por medio de app
export default  app //Este metodo(default) es porque solo exportamos una cosa
