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
                setTimeout(() => navigate('/forgot'), 2000);
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
            }, 2000);
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
        <div className="h-screen md:flex">
            <ToastContainer />
            <div className="relative overflow-hidden md:flex w-1/2 bg-gradient-to-tr from-blue-800 to-purple-700 justify-around items-center hidden">
                <div>
                    <h1 className="text-white font-bold text-4xl font-sans">KITS</h1>
                    <p className="text-white mt-1">Laboratorio de Investigación</p>
                </div>
                <div className="absolute -bottom-32 -left-40 w-80 h-80 border-4 border-opacity-5 border-white rounded-full"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 border-4 border-opacity-5 border-white rounded-full"></div>
            </div>
            <div className="flex w-full md:w-1/2 justify-center items-center bg-white">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-gray-700 mb-4">Nueva Contraseña</h1>
                    <form onSubmit={handleSubmit(crearNuevaContraseña)}>
                        <div className="mb-4 relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Contraseña
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Ingresa tu nueva contraseña"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
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
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="mb-6 relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Confirmar Contraseña
                            </label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirma tu contraseña"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
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
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''
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
