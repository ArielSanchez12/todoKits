/*import connection from './database.js'
import app from './server.js'


connection()

app.listen(app.get('port'), () => { //Esta escuchando a nuestra variable global 'port'
    console.log("Server ok")
})

*/

// npm install socket.io


import connection from './database.js'
import app from './server.js'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

connection()

const server = http.createServer(app)
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Cambia esto por la URL de tu frontend en producción
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id)
    socket.on("enviar-mensaje-front-back", (data) => {
        io.emit("enviar-mensaje-front-back", data)
    })
    socket.on("usuario-escribiendo", (user) => {
        socket.broadcast.emit("usuario-escribiendo", user)
    })
    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id)
    })
})

server.listen(app.get('port'), () => {
    console.log("Server ok")
})