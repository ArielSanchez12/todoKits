import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from 'react-toastify';
import { useState } from "react";
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";
import { cardPasswordSchema } from "../../schemas/cardPasswordSchema";

const CardPassword = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(cardPasswordSchema)
    });
    const { user, updatePasswordProfile } = storeProfile()
    const { clearToken } = storeAuth()
    const [showPass1, setShowPass1] = useState(false)
    const [showPass2, setShowPass2] = useState(false)
    const [showPass3, setShowPass3] = useState(false)

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
        // ✅ CARD CON ALTURA COMPLETA y diseño mejorado
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-6 h-full flex flex-col">
            <ToastContainer />
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
                🔐 Cambiar Contraseña
            </h2>

            <form onSubmit={handleSubmit(updatePassword)} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                    <div className="relative">
                        <label className="mb-2 block text-base font-semibold text-gray-700">Contraseña actual</label>
                        <div className="relative">
                            <input
                                type={showPass1 ? "text" : "password"}
                                placeholder="Ingresa tu contraseña actual"
                                className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 pr-10 text-gray-700"
                                {...register("passwordactual")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass1(!showPass1)}
                                className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPass1 ? (
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
                        {errors.passwordactual && <p className="text-red-600 text-sm mt-1">{errors.passwordactual.message}</p>}
                    </div>

                    <div className="relative">
                        <label className="mb-2 block text-base font-semibold text-gray-700">Nueva contraseña</label>
                        <div className="relative">
                            <input
                                type={showPass2 ? "text" : "password"}
                                placeholder="Ingresa la nueva contraseña"
                                className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 pr-10 text-gray-700"
                                {...register("passwordnuevo")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass2(!showPass2)}
                                className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPass2 ? (
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
                        {errors.passwordnuevo && <p className="text-red-600 text-sm mt-1">{errors.passwordnuevo.message}</p>}
                    </div>

                    <div className="relative">
                        <label className="mb-2 block text-base font-semibold text-gray-700">Confirmar contraseña</label>
                        <div className="relative">
                            <input
                                type={showPass3 ? "text" : "password"}
                                placeholder="Confirma tu nueva contraseña"
                                className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 pr-10 text-gray-700"
                                {...register("confirmpassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass3(!showPass3)}
                                className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPass3 ? (
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
                        {errors.confirmpassword && <p className="text-red-600 text-sm mt-1">{errors.confirmpassword.message}</p>}
                    </div>
                </div>

                <input
                    type="submit"
                    className="bg-red-600 text-white border-0 py-3 w-full rounded-lg mt-6 hover:scale-105 duration-300 hover:bg-red-700 font-bold uppercase shadow-lg cursor-pointer"
                    value="Cambiar Contraseña"
                />
            </form>
        </div>
    )
}

export default CardPassword