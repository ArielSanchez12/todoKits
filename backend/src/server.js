// Requerir los módulos
import express from 'express' //Framework que vamos a usar
import dotenv from 'dotenv'   //Este framework es para trabajar con variables globales, se definen en el archivo .env y luego se las usa donde querramos
import cors from 'cors';      //Este funciona cuando trabajamos con distintos sitios de despliegue, por ejemplo el front lo subo a github y el server a otra pagina y con cors se pueden comunicar sin dar problemas
import routerAdmin from './routers/admin_routes.js'; //Renombrar cada router para cada modelo, luego copia y pega abajo en app.use para que se ponga en azul
import routerDocente from './routers/docente_routes.js';


// Inicializaciones
const app = express() //Crear instancia como en POO
dotenv.config() 

// Configuraciones - Esto es un set de POO, es decir le establecemos el valor
app.set('port',process.env.PORT || 3000) //Aqui lo que hacemos es traer la variable global desde .env O si falla, que sea 3000
app.use(cors()) //Para usar el framework cors, cada que veas 'estancia'.use('algo') es un MIDDLEWARE, es decir, un intermediario

// Middlewares 
app.use(express.json()) //Esto lo que hace es que todos los datos de los formularios de express, se compacten en json para que el backend los pueda procesar


// Rutas 
app.get('/',(req,res)=>{   //Raiz -> '/', luego una funcion callback, y si responde, se envia ese texto, ejemplo http:localhost:3000/ si ejecutamos esa raiz al final de 3000, nos trae Server on
    res.send("Server on")
})

//Rutas veterinario
//Hasta aqui llega este paso http://localhost:3000/api
app.use('/api', routerAdmin)//Aca copia y pega
//Rutas docente
app.use('/api', routerDocente)

//Manejo de rutas inexistentes
app.use((req,res)=>{res.status(404).send("Endpoint no encontrado")})

// Exportar la instancia de express por medio de app
export default  app //Este metodo(default) es porque solo exportamos una cosa