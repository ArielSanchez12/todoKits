import logoEPN from '../assets/epn_dep.webp';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetSchema } from '../schemas/resetSchema';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reset = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(resetSchema)
    });
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const verificarToken = async () => {
            try {
                await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/passwordrecovery/${token}`
                );
                setTokenValid(true);
            } catch (error) {
                toast.error("Token inválido o expirado");
                setTimeout(() => navigate('/forgot'), 4000);
            }
        };
        verificarToken();
    }, [token, navigate]);

    const crearNuevaContraseña = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/newpassword/${token}`,
                {
                    password: data.password,
                    confirmpassword: data.confirmPassword
                }
            );
            toast.success(response.data.msg);
            reset();
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (error) {
            toast.error(error.response?.data?.msg || "Error al actualizar contraseña");
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-gray-600">Verificando token...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row h-screen overflow-hidden">
            <ToastContainer />

            {/* Imagen - Oculta en móvil */}
            <div className="hidden sm:flex sm:w-1/2 h-screen bg-cover bg-center relative overflow-hidden">
                <img
                    src={logoEPN}
                    alt="EPN Logo"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Formulario */}
            <div className="w-full sm:w-1/2 flex flex-col justify-center items-center px-8 py-12 sm:py-0 overflow-y-auto bg-white">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-center uppercase text-black">Nueva Contraseña</h1>
                    <p className="text-gray-500 text-sm sm:text-base mb-6">Crea una nueva contraseña para tu cuenta</p>

                    <form onSubmit={handleSubmit(crearNuevaContraseña)}>
                        {/* Campo Contraseña */}
                        <div className="mb-4 relative">
                            <label className="block text-gray-700 text-sm sm:text-base font-bold mb-2">
                                Contraseña
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Ingresa tu nueva contraseña"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-sm sm:text-base"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 translate-y-1/2 text-gray-500 hover:text-gray-700 mt-1"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                    </svg>
                                )}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Campo Confirmar Contraseña */}
                        <div className="mb-6 relative">
                            <label className="block text-gray-700 text-sm sm:text-base font-bold mb-2">
                                Confirmar Contraseña
                            </label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirma tu contraseña"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-sm sm:text-base"
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 translate-y-1/2 text-gray-500 hover:text-gray-700 mt-1"
                            >
                                {showConfirmPassword ? (
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                                    </svg>
                                )}
                            </button>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Botón Enviar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm sm:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Actualizando...' : 'Crear Nueva Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reset;
