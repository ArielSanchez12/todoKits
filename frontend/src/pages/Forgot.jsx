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
        <div className="flex flex-col sm:flex-row h-screen">

            <ToastContainer />

            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">

                <div className="md:w-4/5 sm:w-full">

                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-black">!Olvidaste tu contraseña¡</h1>
                    <small className="text-gray-400 block my-4 text-base">No te preocupes, te ayudaremos a recuperarla.</small>

                    <form onSubmit={handleSubmit(sendMail)}>

                        <div className="mb-1">
                            <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa un correo electrónico válido" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("email", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                        </div>

                        <div className="mb-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                            </button>
                        </div>

                    </form>

                    <div className="mt-5 text-xs border-b-2 py-4 ">
                    </div>

                    <div className="mt-5 text-base flex justify-between items-center">
                        <p>¿Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-black text-white border rounded-xl hover:scale-110 duration-300 hover:bg-blue-600 hover:text-white">Iniciar sesión</Link>

                    </div>

                </div>

            </div>

            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/images/arbolEPN2.webp')] 
            bg-no-repeat bg-cover bg-center sm:block hidden
            ">
            </div>
        </div>
    )
}