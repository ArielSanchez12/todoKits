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
        <form onSubmit={handleSubmit(updateUser)}>
            <div>
                <label className="mb-2 block text-base font-semibold">Nombre</label>
                <input
                    type="text"
                    placeholder="Ingresa tu nombre"
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                    {...register("nombre", { required: "Este campo es obligatorio!" })}
                />
                {errors.nombre && <p className="text-red-800 text-base mb-4">{errors.nombre.message}</p>}
            </div>
            <div>
                <label className="mb-2 block text-base font-semibold">Apellido</label>
                <input
                    type="text"
                    placeholder="Ingresa tu apellido"
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                    {...register("apellido", { required: "Este campo es obligatorio!" })}
                />
                {errors.apellido && <p className="text-red-800 text-base mb-4">{errors.apellido.message}</p>}

            </div>
            <div>
                <label className="mb-2 block text-base font-semibold">Teléfono</label>
                <input
                    type="text"
                    placeholder="Ingresa tu teléfono"
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                    {...register("celular", { required: "Este campo es obligatorio!" })}
                />
                {errors.celular && <p className="text-red-800 text-base mb-4">{errors.celular.message}</p>}

            </div>
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
                    placeholder="Ingresa tu correo"
                    className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                    {...register("email", { required: "Este campo es obligatorio!" })}
                />
                {errors.email && <p className="text-red-800 text-base mb-4">{errors.email.message}</p>}

            </div>

            <input
                type="submit"
                className="bg-black w-full p-2 mt-1 text-white uppercase font-bold rounded-lg hover:bg-blue-600 hover:scale-105 duration-300 cursor-pointer transition-all"
                value="Actualizar"
            />
        </form>
    );
};

export default FormularioPerfil;