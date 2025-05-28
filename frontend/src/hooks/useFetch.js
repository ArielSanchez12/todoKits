import axios from 'axios' // Axios es una librería para hacer peticiones HTTP
import { toast } from 'react-toastify' // Librería para mostrar notificaciones


// Base de mi custom hook
function useFetch() {

    // Para hacer peticiones a la backend y este debe darme una respuesta
    const fetchDataBackend = async (url, form = null, method = 'POST') => {

        try { // Intento hacer la petición
            let respuesta // Variable para guardar la respuesta
            if (method === 'POST') { // Si el método es POST, hago una petición POST
                respuesta = await axios.post(url, form) // Enviando el form
            } else if (method === 'GET') { // Si el método es GET, hago una petición GET
                respuesta = await axios.get(url) // Enviando el form
            }
            toast.success(respuesta?.data?.msg) // Si la respuesta es correcta, muestro una notificación de éxito
            return respuesta?.data // Devuelvo la respuesta
            
        } catch (error) { // Si hay un error, lo manejo aquí
            toast.error(error.response?.data?.msg) // Si hay un error, lo muestro en la notificación
            const errorMsg = error.response?.data?.msg || 'An error occurred'; // Mensaje de error por defecto
            throw new Error(errorMsg); // Lanza un error para que el componente que llama a este hook lo maneje
        }
    }

    return { fetchDataBackend } // Devuelvo la función fetchDataBackend para que la pueda usar en otros componentes
}

// Exporto el custom hook
export default useFetch