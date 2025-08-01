import connection from './database.js'
import app from './server.js'


connection()

app.listen(app.get('port'), () => { //Esta escuchando a nuestra variable global 'port'
    console.log("Server ok")
})