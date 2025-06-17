import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import useFetch from '../hooks/useFetch';
import { ToastContainer } from 'react-toastify';


const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    // Leer email recordado si existe
    const rememberedEmail = localStorage.getItem("rememberedEmail") || "";
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: rememberedEmail
        }
    });
    const { fetchDataBackend } = useFetch();
    // Estado para recordar la sesión
    const [rememberMe, setRememberMe] = useState(() => {
        return localStorage.getItem("rememberMe") === "true";
    });
    const handleCheckboxChange = () => {
        setRememberMe(prev => {
            localStorage.setItem("rememberMe", !prev);
            return !prev;
        });
    };
    const loginUser = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/login`;
        const response = await fetchDataBackend(url, data, 'POST');
        if (response) {
            // Si el usuario quiere recordar sesión, guarda el email
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", data.email);

            } else {
                localStorage.removeItem("rememberedEmail");
            }
            navigate('/dashboard');
        }
    };



    return (
        <div className="flex flex-col sm:flex-row h-screen">
            <ToastContainer />

            {/* Imagen de fondo */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/images/epnLogin.webp')] 
            bg-no-repeat bg-cover bg-center sm:block hidden">
            </div>

            {/* Contenedor del formulario */}
            <div className="w-full sm:w-1/2 flex flex-col justify-center px-8">
                {/* Logo encima del título */}
                <div className="flex justify-center mt-0 mb-9">
                    <img
                        src="/images/logo_esfot.png"
                        alt="Logo"
                        className="w-26 h-22 object-contain"
                    />
                </div>

                {/* Título de bienvenida */}
                <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-black">BIENVENIDOS</h1>

                {/* Botón de inicio de sesión con Google */}
                <button className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-base hover:scale-105 duration-300 hover:bg-black hover:text-white">
                    <img className="w-5 mr-2" src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google icon" />
                    Sign in with Google
                </button>

                {/* Línea divisoria */}
                <div className="flex items-center my-10">
                        <hr className="flex-grow border-gray-400" />
                            <span className="mx-2 text-gray-400 text-base whitespace-nowrap">OR LOGIN WITH EMAIL</span>
                        <hr className="flex-grow border-gray-400" />
                    </div>

                {/* FORMULARIO */}
                <form onSubmit={handleSubmit(loginUser)}>
                    {/* Correo electrónico */}
                    <div className="mb-3">
                        <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="Ingresa tu correo"
                            className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-2 text-gray-500"
                            {...register("email", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="mb-6 relative">
                        <label className="mb-2 block text-base font-semibold">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********************"
                                className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500 pr-10"
                                {...register("password", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.password && <p className="text-red-800">{errors.password.message}</p>}

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
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
                        </div>
                    </div>

                    {/* Recordarme y Olvidaste tu contraseña */}
                    <div className="mb-7 flex justify-between items-center">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                onChange={handleCheckboxChange}
                                checked={rememberMe} // Controla el estado del checkbox
                                className="mr-2"
                            />
                            <label htmlFor="rememberMe" className="text-base text-black">Recordarme</label>
                        </div>
                        <Link
                            to="/forgot/id"
                            className="underline text-base text-gray-500 hover:text-blue-600"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* Botón de iniciar sesión */}
                    <div className="my-4">
                        <button className="py-2 w-full block text-center bg-black text-white border rounded-xl 
                        hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white">Iniciar sesión</button>
                    </div>
                </form>

                {/* Registrarse */}
                <div className="mt-4 text-base py-4 text-center text-black">
                    ¿No tienes cuenta?{' '}
                    <Link
                        to="/register"
                        className="text-base text-gray-500 underline hover:text-blue-600 font-medium"
                    >
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
