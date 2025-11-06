import { useEffect, useState } from "react"
import storeProfile from "../../context/storeProfile"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { formProfileSchema } from "../../schemas/formProfileSchema";

const FormularioPerfil = () => {
    const { user, updateProfile } = storeProfile()
    const [showEmailWarning, setShowEmailWarning] = useState(false);

    const userData = user?._doc || user || {};

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(formProfileSchema)
    });

    const updateUser = async (data) => {
        updateProfile(data, userData._id)
    }

    useEffect(() => {
        if (userData) {
            reset({
                nombre: userData.nombre || "",
                apellido: userData.apellido || "",
                celular: userData.celular || "",
                email: userData.email || "",
            })
        }
    }, [userData, reset])

    return (
        // ✅ CARD CON ALTURA COMPLETA y borde mejorado
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
                ✏️ Editar Información
            </h2>
            
            <form onSubmit={handleSubmit(updateUser)} className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="mb-2 block text-base font-semibold text-gray-700">Nombre</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu nombre"
                            className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 text-gray-700"
                            {...register("nombre", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-base font-semibold text-gray-700">Apellido</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu apellido"
                            className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 text-gray-700"
                            {...register("apellido", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.apellido && <p className="text-red-600 text-sm mt-1">{errors.apellido.message}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-base font-semibold text-gray-700">Teléfono</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu teléfono"
                            className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 text-gray-700"
                            {...register("celular", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.celular && <p className="text-red-600 text-sm mt-1">{errors.celular.message}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-base font-semibold text-gray-700">Correo electrónico</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onMouseEnter={() => setShowEmailWarning(true)}
                                    onMouseLeave={() => setShowEmailWarning(false)}
                                    onClick={() => setShowEmailWarning(!showEmailWarning)}
                                    className="text-yellow-500 hover:text-yellow-700 focus:outline-none ml-2"
                                    title="Información importante"
                                >
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                    </svg>
                                </button>
                                {showEmailWarning && (
                                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-yellow-100 border border-yellow-400 rounded-md text-xs sm:text-sm text-yellow-800 whitespace-normal sm:whitespace-nowrap z-20 max-w-xs sm:max-w-none shadow-lg">
                                        Deberás confirmar el nuevo email para completar el cambio
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            type="email"
                            placeholder="Ingresa tu correo"
                            className="block w-full rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 px-3 text-gray-700"
                            {...register("email", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                </div>

                <input
                    type="submit"
                    className="bg-blue-600 w-full p-3 mt-6 text-white uppercase font-bold rounded-lg hover:bg-blue-700 hover:scale-105 duration-300 cursor-pointer transition-all shadow-lg"
                    value="Actualizar Información"
                />
            </form>
        </div>
    );
};

export default FormularioPerfil;