import { useEffect } from "react"
import storeProfile from "../../context/storeProfile"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { formProfileSchema } from "../../schemas/formProfileSchema";

const FormularioPerfil = () => {
    const { user, updateProfile } = storeProfile()
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(formProfileSchema)
    });

    const updateUser = async (data) => {
        updateProfile(data, user._id)
    }

    useEffect(() => {
        if (user) {
            reset({
                nombre: user?.nombre,
                apellido: user?.apellido,
                // direccion eliminada
                celular: user?.celular,
                email: user?.email,
            })
        }
    }, [user])


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
            {/* Bloque de dirección eliminado */}
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
                className="bg-black w-full p-2 mt-1 text-white uppercase font-bold rounded-lg hover:bg-blue-600 hover:scale-105 duration-300 cursor-pointer transition-all"
                value="Actualizar"
            />
        </form>
    );
};

export default FormularioPerfil;
