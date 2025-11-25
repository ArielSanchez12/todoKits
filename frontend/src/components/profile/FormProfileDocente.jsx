import { useEffect, useState } from "react"
import storeProfile from "../../context/storeProfile"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { formProfileDocenteSchema } from "../../schemas/formProfileDocenteSchema";

const FormProfileDocente = () => {
    const { user, updateProfile } = storeProfile()
    const [showEmailWarning, setShowEmailWarning] = useState(false);
    const [showAdminWarning, setShowAdminWarning] = useState(false); // NUEVO

    const userData = user?._doc || user || {};

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(formProfileDocenteSchema)
    });

    const updateUser = async (data) => {
        // Solo enviar si hay email para actualizar
        if (data.emailDocente && data.emailDocente.trim() !== '') {
            updateProfile(data, userData._id)
        }
    }

    useEffect(() => {
        if (userData) {
            reset({
                emailDocente: userData.emailDocente || "",
            })
        }
    }, [userData, reset])

    return (
        <form onSubmit={handleSubmit(updateUser)}>
            <div className='mt-5'>
                {/* Título con tooltip de advertencia */}
                <div className="flex items-center gap-2 mt-16">
                    <h1 className='font-black text-2xl text-gray-500'>Actualizar perfil</h1>
                    <div className="relative">
                        <button
                            type="button"
                            onMouseEnter={() => setShowAdminWarning(true)}
                            onMouseLeave={() => setShowAdminWarning(false)}
                            onClick={() => setShowAdminWarning(!showAdminWarning)}
                            className="text-yellow-500 hover:text-yellow-700 focus:outline-none"
                            title="Información importante"
                        >
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                            </svg>
                        </button>
                        {showAdminWarning && (
                            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-yellow-100 border border-yellow-400 rounded-md text-xs sm:text-sm text-yellow-800 whitespace-normal sm:whitespace-nowrap z-20 max-w-xs sm:max-w-none">
                                Contacta a tu administrador mediante el chat si necesitas modificar los datos de los campos bloqueados
                            </div>
                        )}
                    </div>
                </div>
                <hr className='my-4 border-t-2 border-gray-300' />
            </div>
            
            {/* � Campos bloqueados (solo lectura) */}
            <div>
                <label className="mb-2 block text-base font-semibold text-gray-400">Nombres</label>
                <input
                    type="text"
                    value={userData.nombreDocente || ''}
                    disabled
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-400 mb-4 bg-gray-100 cursor-not-allowed"
                />
            </div>
            
            <div>
                <label className="mb-2 block text-base font-semibold text-gray-400">Apellidos</label>
                <input
                    type="text"
                    value={userData.apellidoDocente || ''}
                    disabled
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-400 mb-4 bg-gray-100 cursor-not-allowed"
                />
            </div>
            
            <div>
                <label className="mb-2 block text-base font-semibold text-gray-400">Celular</label>
                <input
                    type="text"
                    value={userData.celularDocente || ''}
                    disabled
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-400 mb-4 bg-gray-100 cursor-not-allowed"
                />
            </div>

            {/* Campo editable: Email */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-base font-semibold">Correo electrónico</label>
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
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-yellow-100 border border-yellow-400 rounded-md text-xs sm:text-sm text-yellow-800 whitespace-normal sm:whitespace-nowrap z-20 max-w-xs sm:max-w-none">
                                Deberás confirmar el nuevo email para completar el cambio
                            </div>
                        )}
                    </div>
                </div>
                <input
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                    {...register("emailDocente")}
                />
                {errors.emailDocente && <p className="text-red-800 text-base mb-4">{errors.emailDocente.message}</p>}
            </div>

            <input
                type="submit"
                className="bg-black w-full p-2 mt-1 text-white font-bold rounded-lg hover:bg-blue-600 hover:scale-105 duration-300 cursor-pointer transition-all"
                value="ACTUALIZAR CORREO"
            />
        </form>
    );
};

export default FormProfileDocente;