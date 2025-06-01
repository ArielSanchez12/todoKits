import connection from './database.js'
import app from './server.js'

connection()

// Elimina o comenta la línea de app.listen para producción en Vercel
// app.listen(app.get('port'), () => { 
//     console.log("Server ok")
// })

export default app // Esto es lo que Vercel necesita