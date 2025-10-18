import { useEffect, useState } from "react"
import storeProfile from "../../context/storeProfile"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { formProfileSchema } from "../../schemas/formProfileSchema";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormularioPerfil = () => {
    const { user, updateProfile } = storeProfile()
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
        resolver: zodResolver(formProfileSchema)
    });

    const emailValue = watch("email");

    const updateUser = async (data) => {
        setLoading(true);
        try {
            // Detectar si hay cambio de email
            const isEmailChange = data.email && data.email !== user.email;

            const response = await updateProfile(data, user._id);

            if (response?.msg) {
                // Si es cambio de email, mostrar toast específico
                if (isEmailChange) {
                    toast.info("Se envió un correo de confirmación al nuevo email. Revisa tu bandeja de entrada para confirmar el cambio.", {
                        position: "top-center",
                        autoClose: 8000,
                    });
                } else {
                    // Para otros cambios
                    toast.success("Perfil actualizado correctamente", {
                        position: "top-center",
                        autoClose: 3000,
                    });
                }
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.msg || "Error al actualizar perfil";
            toast.error(errorMsg, {
                position: "top-center",
                autoClose: 3000,
            });
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            reset({
                nombre: user?.nombre,
                apellido: user?.apellido,
                celular: user?.celular,
                email: user?.email,
            })
        }
    }, [user, reset])


    return (
        <>
            <ToastContainer limit={1} />
            <form onSubmit={handleSubmit(updateUser)}>
                <div>
                    <label className="mb-2 block text-base font-semibold">Nombre</label>
                    <input
                        type="text"
                        placeholder="Ingresa tu nombre"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("nombre")}
                    />
                    {errors.nombre && <p className="text-red-800 text-base mb-4">{errors.nombre.message}</p>}
                </div>
                <div>
                    <label className="mb-2 block text-base font-semibold">Apellido</label>
                    <input
                        type="text"
                        placeholder="Ingresa tu apellido"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("apellido")}
                    />
                    {errors.apellido && <p className="text-red-800 text-base mb-4">{errors.apellido.message}</p>}

                </div>
                <div>
                    <label className="mb-2 block text-base font-semibold">Teléfono</label>
                    <input
                        type="text"
                        placeholder="Ingresa tu teléfono"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("celular")}
                    />
                    {errors.celular && <p className="text-red-800 text-base mb-4">{errors.celular.message}</p>}

                </div>
                <div>
                    <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa tu correo"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("email")}
                    />
                    {errors.email && <p className="text-red-800 text-base mb-4">{errors.email.message}</p>}

                </div>

                <input
                    type="submit"
                    disabled={loading}
                    className={`bg-black w-full p-2 mt-1 text-white uppercase font-bold rounded-lg hover:bg-blue-600 hover:scale-105 duration-300 cursor-pointer transition-all ${loading ? 'opacity-70' : ''}`}
                    value={loading ? "Actualizando..." : "Actualizar"}
                />
            </form>
        </>
    );
};

export default FormularioPerfil;
