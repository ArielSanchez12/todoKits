import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';


export const Register = () => {

    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
    const { register, handleSubmit, formState: { errors } } = useForm(); // Hook para manejar el formulario

    // Función para manejar el envío del formulario al backend
    const registro = async (data) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/register` // URL del backend para el registro
            // Enviar los datos del formulario al backend
            const response = await axios.post(url, data)
            toast.success(response.data.msg) // Mostrar mensaje de éxito
        } catch (error) {
            toast.error(error.response.data.msg) // Mostrar mensaje de error
        }
    }


    return (
        <div className="flex flex-col sm:flex-row h-screen">

            <ToastContainer />

            {/* Sección de formulario de registro */}
            <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center">

                <div className="md:w-4/5 sm:w-full">
                    {/* Contenedor del formulario */}

                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-black">BIENVENIDOS</h1>
                    <small className="text-gray-400 block my-4 text-base">Por favor ingresa tus datos</small>

                    <form onSubmit={handleSubmit(registro)}>

                        {/* Campo para nombre */}
                        <div className="mb-3">
                            <label className="mb-2 block text-base font-semibold">Nombre</label>
                            <input type="text" placeholder="Ingresa tu nombre" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("nombre", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.nombre && <p className="text-red-800">{errors.nombre.message}</p>}
                        </div>

                        {/* Campo para apellido */}
                        <div className="mb-3">
                            <label className="mb-2 block text-base font-semibold">Apellido</label>
                            <input type="text" placeholder="Ingresa tu apellido" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("apellido", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.apellido && <p className="text-red-800">{errors.apellido.message}</p>}
                        </div>

                        {/* aqui deberia ir direccion */}
                        <div className="mb-3">
                            <label className="mb-2 block text-base font-semibold">Dirección</label>
                            <input type="text" placeholder="Ingresa tu dirección" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("direccion", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.direccion && <p className="text-red-800">{errors.direccion.message}</p>}
                        </div>

                        {/* Campo para celular */}
                        <div className="mb-3">
                            <label className="mb-2 block text-base font-semibold">Celular</label>
                            <input type="text" placeholder="Ingresa tu celular" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("celular", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.celular && <p className="text-red-800">{errors.celular.message}</p>}
                        </div>

                        {/* Campo para correo electrónico */}
                        <div className="mb-3">
                            <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa tu correo electrónico" className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                                {...register("email", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.email && <p className="text-red-800">{errors.email.message}</p>}
                        </div>

                        {/* Campo para contraseña */}
                        <div className="mb-3 relative">
                            <label className="mb-2 block text-base font-semibold">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} // Cambia el tipo del input entre 'text' y 'password' según el estado
                                    placeholder="********************"
                                    className="block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500 pr-10"
                                    {...register("password", { required: "Este campo es obligatorio!" })}
                                />
                                {errors.password && <p className="text-red-800">{errors.password.message}</p>}

                                {/* Botón para mostrar/ocultar la contraseña */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)} // Cambia el estado para mostrar/ocultar la contraseña
                                    className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
                                >
                                    {/* Icono que cambia según el estado de la contraseña */}
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

                        {/* Botón para enviar el formulario */}
                        <div className="mb-3">
                            <button className="bg-black text-white border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white">Registrarse</button>
                        </div>

                    </form>

                    {/* Enlace para iniciar sesión si ya tiene una cuenta */}
                    <div className="mt-5 text-base flex justify-between items-center">
                        <p>¿Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 bg-black text-white border rounded-xl hover:scale-110 duration-300 hover:bg-blue-600">Iniciar sesión</Link>
                    </div>

                </div>

            </div>

            {/* Sección con imagen de fondo, solo visible en pantallas grandes */}
            <div className="w-full sm:w-1/2 h-1/3 sm:h-screen bg-[url('/images/dragon_y_poli.webp')] bg-no-repeat bg-cover bg-center sm:block hidden"></div>
        </div>
    );
};