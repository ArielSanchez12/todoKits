import { useForm } from "react-hook-form"
import { ToastContainer, toast } from 'react-toastify';
import { useState } from "react";
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";


const CardPassword = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm()
    const { user, updatePasswordProfile } = storeProfile()
    const { clearToken } = storeAuth()

    // Estados para mostrar/ocultar contraseñas
    const [showPasswordActual, setShowPasswordActual] = useState(false);
    const [showPasswordNuevo, setShowPasswordNuevo] = useState(false);

    const updatePassword = (data) => {
        updatePasswordProfile(data, user._id)
            .then((response) => {
                if (response?.msg) {
                    toast.success(response.msg)
                    clearToken()
                } else if (response?.error) {
                    toast.error(response.error)
                }
                reset()
            })
            .catch((error) => {
                toast.error(error?.response?.data?.msg || "Ocurrió un error al actualizar la contraseña")
            });
    }

    return (
        <>
            <ToastContainer />
            <div className='mt-5'>
                <h1 className='font-black text-2xl text-gray-500 mt-16'>Actualizar contraseña</h1>
                <hr className='my-4 border-t-2 border-gray-300' />
            </div>

            <form onSubmit={handleSubmit(updatePassword)}>

                <div className="relative">
                    <label className="mb-2 block text-base font-semibold">Contraseña actual</label>
                    <input
                        type={showPasswordActual ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("passwordactual", { required: "Este campo es obligatorio!" })}
                    />
                    {/* Botón para mostrar/ocultar */}
                    <button
                        type="button"
                        onClick={() => setShowPasswordActual(!showPasswordActual)}
                        className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
                    >
                        {showPasswordActual ? (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                            </svg>
                        )}
                    </button>
                    {errors.passwordactual && <p className="text-red-800 text-base mb-4">{errors.passwordactual.message}</p>}
                </div>

                <div className="relative">
                    <label className="mb-2 block text-base font-semibold">Nueva contraseña</label>
                    <input
                        type={showPasswordNuevo ? "text" : "password"}
                        placeholder="Ingresa la nueva contraseña"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("passwordnuevo", { required: "Este campo es obligatorio!" })}
                    />
                    {/* Botón para mostrar/ocultar */}
                    <button
                        type="button"
                        onClick={() => setShowPasswordNuevo(!showPasswordNuevo)}
                        className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
                    >
                        {showPasswordNuevo ? (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                            </svg>
                        )}
                    </button>
                    {errors.passwordnuevo && <p className="text-red-800 text-base mb-4">{errors.passwordnuevo.message}</p>}
                </div>

                <input
                    type="submit"
                    className='bg-black w-full p-2 mt-1 text-white uppercase font-bold rounded-lg 
                        hover:bg-blue-600 hover:scale-105 duration-300 cursor-pointer transition-all'
                    value='Cambiar' />

            </form>
        </>
    )
}

export default CardPassword