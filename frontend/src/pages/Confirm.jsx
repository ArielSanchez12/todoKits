import logobuhoPuente from '../assets/buhoPuente.jpg'
import { Link, useParams } from 'react-router'
import { useEffect } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

export const Confirm = () => {

    const { token } = useParams();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const verifyToken = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/confirmar/${token}`;
            const response = await axios.get(url);
            console.log(response.data.msg);
            toast.success(response?.data?.msg);
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.msg);
        }
    }

    useEffect(() => {
        verifyToken();
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <ToastContainer />

            {/* Imagen en la mitad superior */}
            <div className="h-3/5 w-full">
                <img 
                    src={logobuhoPuente} 
                    alt="image description" 
                    className="w-full h-full object-cover" 
                />
            </div>

            {/* Contenido en la mitad inferior */}
            <div className="h-1/3 flex flex-col items-center justify-center bg-white px-4">
                <p className="text-3xl md:text-4xl lg:text-5xl text-black mt-4">Muchas Gracias</p>
                <p className="md:text-lg lg:text-xl text-black mt-4">Ya puedes iniciar sesión</p>
                <Link 
                    to="/login" 
                    className="p-3 mt-7 w-50 text-center bg-black text-white border rounded-xl hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white"
                >
                    Login
                </Link>
            </div>
        </div>
    )
}
