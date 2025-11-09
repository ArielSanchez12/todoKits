import { Link, useNavigate } from 'react-router'
import axios from "axios";
import useFetch from '../hooks/useFetch'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from 'react-toastify'
import { forgotSchema } from '../schemas/forgotSchema';
import "react-toastify/dist/ReactToastify.css";
import { useState } from 'react';


export const Forgot = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(forgotSchema)
    });
    const { fetchDataBackend } = useFetch()
    const [loading, setLoading] = useState(false);

    const sendMail = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/passwordrecovery`,
                { email: data.email }
            );
            toast.success(response.data.msg);
            reset();
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.msg || "Error al recuperar contraseña");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col sm:flex-row h-screen overflow-hidden">

            <ToastContainer />

            <div className="w-full sm:w-1/2 flex flex-col justify-center items-center px-8 py-12 sm:py-0 overflow-y-auto bg-white">

                <div className="w-full max-w-md">

                    <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-center uppercase text-black">¡Olvidaste tu contraseña!</h1>
                    

                    <form onSubmit={handleSubmit(sendMail)}>

                        <div className="mb-1">
                            <small className="text-gray-400 block my-4 text-sm sm:text-base">¡No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta!</small>
                            <label className="mb-2 block text-sm sm:text-base font-semibold">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa un correo electrónico válido" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-2 px-2 text-gray-500 text-sm sm:text-base"
                                {...register("email", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.email && <p className="text-red-800 text-xs sm:text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="mb-3 mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                            </button>
                        </div>

                    </form>

                    <div className="mt-5 border-b-2 py-4"></div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center text-sm sm:text-base">
                        <p className="text-center sm:text-left">¿Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-black text-white border rounded-xl hover:scale-110 duration-300 hover:bg-blue-600 hover:text-white font-semibold text-sm sm:text-base text-center">Iniciar sesión</Link>
                    </div>

                </div>

            </div>

            <div className="hidden sm:block sm:w-1/2 h-screen bg-[url('/images/arbolEPN2.webp')] bg-no-repeat bg-cover bg-center">
            </div>
        </div>
    )
}