import { useEffect, useState } from "react";
import storeProfile from "../../context/storeProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formProfileSchema } from "../../schemas/formProfileSchema";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormularioPerfil = () => {
    const { user, updateProfile } = storeProfile();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(formProfileSchema),
    });

    const updateUser = async (data) => {
        setLoading(true);
        try {
            // Detectar si hay cambio de email
            const isEmailChange = data.email && data.email !== user.email;

            const response = await updateProfile(data, user._id);

            if (response?.msg) {
                // Mostrar mensaje personalizado si es cambio de email
                if (isEmailChange) {
                    toast.success("Se envió un correo de confirmación al nuevo email", {
                        position: "top-right",
                        autoClose: 8000, // Mostrar más tiempo
                    });
                    toast.info("Para completar el cambio, revisa tu bandeja de entrada y confirma tu nuevo correo", {
                        position: "top-right",
                        autoClose: 10000, // Mostrar por más tiempo
                        delay: 500
                    });
                } else {
                    // Para otros campos
                    toast.success("Perfil actualizado correctamente");
                }
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.msg || "Error al actualizar perfil";
            toast.error(errorMsg);
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            reset({
                nombre: user?.nombre,
                apellido: user?.apellido,
                celular: user?.celular,
                email: user?.email,
            });
        }
    }, [user, reset]);

    return (
        <>
            <ToastContainer />
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
                    <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
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
                    disabled={loading}
                    className={`bg-black w-full p-2 mt-1 text-white uppercase font-bold rounded-lg 
                      hover:bg-blue-600 hover:scale-105 duration-300 transition-all 
                      ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    value={loading ? "Actualizando..." : "Actualizar"}
                />
            </form>
        </>
    );
};

export default FormularioPerfil;
