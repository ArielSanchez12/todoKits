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
        <div className="flex flex-col items-center justify-center h-screen">
            <ToastContainer />
            <h1 className="text-3xl font-semibold mb-3 text-center text-black">
                BIENVENIDOS NUEVAMENTE
            </h1>
            <small className="text-black block my-5 text-base">
                Por favor, actualiza tu contraseña
            </small>
            <img
                className="mb-10 object-cover h-90 w-90 rounded-full border-4 border-solid border-slate-600"
                src={logoEPN}
                alt="image description"
            />
            {tokenValid && (
                <form className="w-90" onSubmit={handleSubmit(crearNuevaContraseña)}>
                    <div className="mb-1">
                        <label className="mb-1 block text-base font-semibold">
                            Nueva contraseña
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu nueva contraseña"
                            className="mb-2 block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 hover:text-gray-700 text-sm mb-2"
                        >
                            {showPassword ? "Ocultar" : "Mostrar"}
                        </button>
                        {errors.password && <p className="text-red-800 text-base mb-4">{errors.password.message}</p>}

                        <label className="mb-1 block text-base font-semibold">
                            Confirmar contraseña
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repite tu contraseña"
                            className="mb-2 block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-500 hover:text-gray-700 text-sm mb-2"
                        >
                            {showConfirmPassword ? "Ocultar" : "Mostrar"}
                        </button>
                        {errors.confirmPassword && <p className="text-red-800 text-base mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="mb-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`mb-5 bg-black text-white border py-2 w-full rounded-xl mt-3 hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Actualizando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Reset;
