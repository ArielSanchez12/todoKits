import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from 'react-toastify';
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";
import { cardPasswordSchema } from "../../schemas/cardPasswordSchema";


const CardPassword = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(cardPasswordSchema)
    });
    const { user, updatePasswordProfile } = storeProfile()
    const { clearToken } = storeAuth()

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
                <div>
                    <label className="mb-2 block text-base font-semibold">Contraseña actual</label>
                    <input
                        type="password"
                        placeholder="Ingresa tu contraseña actual"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("passwordactual")}
                    />
                    {errors.passwordactual && <p className="text-red-800 text-base mb-4">{errors.passwordactual.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-base font-semibold">Nueva contraseña</label>
                    <input
                        type="password"
                        placeholder="Ingresa la nueva contraseña"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("passwordnuevo")}
                    />
                    {errors.passwordnuevo && <p className="text-red-800 text-base mb-4">{errors.passwordnuevo.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-base font-semibold">Confirmar contraseña</label>
                    <input
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-2"
                        {...register("confirmpassword")}
                    />
                    {errors.confirmpassword && <p className="text-red-800 text-base mb-4">{errors.confirmpassword.message}</p>}
                </div>

                <input
                    type="submit"
                    className="bg-black w-full p-2 mt-1 text-white uppercase font-bold rounded-lg hover:bg-blue-600 hover:scale-105 duration-300 cursor-pointer transition-all"
                    value="Cambiar"
                />
            </form>
        </>
    )
}

export default CardPassword
