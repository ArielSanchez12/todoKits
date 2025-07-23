import connection from './database.js'
import app from './server.js'
import http from 'http'
import { Server } from 'socket.io'

// Conectar a la base de datos
connection()

// Crear servidor HTTP a partir de la app de Express
const server = http.createServer(app)

// Configurar Socket.io con CORS para local y producción
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173", // frontend local
            "https://kitsfrontend-zeta.vercel.app/", // reemplaza por tu dominio real de producción
        ],
        methods: ["GET", "POST"]
    }
})

// Eventos de Socket.io
io.on('connection', (socket) => {
    console.log('Usuario conectado', socket.id)
    socket.on('enviar-mensaje-front-back', (payload) => {
        socket.broadcast.emit('enviar-mensaje-front-back', payload)
    })
})

// Escuchar en el puerto definido en la app
const PORT = app.get('port') || 3000
server.listen(PORT, () => {
    console.log(`Server ok on http://localhost:${PORT}`)
})