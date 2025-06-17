import logobuhoPuente from '../assets/buho_mitad.webp'
import { Link, useParams } from 'react-router'
import { useEffect } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

export const Confirm = () => {

    const { token } = useParams()
    const verifyToken = async()=>{
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/confirm/${token}`
            const response = await axios.get(url)
            toast.success(response?.data?.msg)
        } catch (error) {
            toast.error(error?.response?.data?.msg)
        }
    }
    useEffect(() => {
        verifyToken()
    },[])

    
    return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
        <ToastContainer />

        {/* Imagen circular centrada */}
        <img
            className="object-cover w-115 h-115 rounded-full border-4 border-solid border-slate-600 shadow-md"
            src={logobuhoPuente}
            alt="Descripción de la imagen"
        />

        {/* Mensajes y botón */}
        <div className="mt-8 text-center px-4">
            <p className="text-3xl md:text-4xl lg:text-5xl text-black">Muchas Gracias</p>
            <p className="md:text-lg lg:text-xl text-black mt-4">Ya puedes iniciar sesión</p>
            <Link
                to="/login"
                className="p-3 mt-7 inline-block w-48 text-center bg-black text-white border rounded-xl hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white"
            >
                Iniciar Sesión
            </Link>
        </div>
    </div>
);

}
