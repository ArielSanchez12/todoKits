import logoEPN from '../assets/epn_dep.webp';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';




const Reset = () => {

    const { fetchDataBackend } = useFetch();
    const { token } = useParams();
    const navigate = useNavigate();
    const [tokenback, setTokenBack] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const changePassword = (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/newpassword/${token}`;
        fetchDataBackend(url, data, 'POST');
        setTimeout(() => {
            if (data.password == data.confirmpassword) { //Este if es para validar que coincidan las contraseñas y luego se haga la redireccion
                navigate('/login'); // No continúa si no coinciden
            }
        }, 3000);
    };

    useEffect(() => {

        const verifyToken = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/passwordrecovery/${token}`;
            fetchDataBackend(url, null, 'GET');
            setTokenBack(true);
        };
        verifyToken();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <ToastContainer />
            <h1 className="text-3xl font-semibold mb-3 text-center text-black">
                BIENVENIDOS NUEVAMENTE
            </h1>
            <small className="text-black block my-5 text-base">
                Por favor, actualiza tu contraseña
            </small>
            <img
                className="mb-10 object-cover h-90 w-90 rounded-full border-4 border-solid border-slate-600"
                src={logoEPN}
                alt="image description"
            />
            {tokenback && (
                <form className="w-90" onSubmit={handleSubmit(changePassword)}>
                    <div className="mb-1">

                        <label className="mb-1 block text-base font-semibold">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Ingresa tu nueva contraseña"
                            className="mb-2 block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("password", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.password && <p className="text-red-800 text-base mb-4">{errors.password.message}</p>}

                        <label className="mb-1 block text-base font-semibold">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            className="mb-2 block w-full rounded-md border border-gray-300 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 py-1 px-1.5 text-gray-500"
                            {...register("confirmpassword", { required: "Este campo es obligatorio!" })}
                        />
                        {errors.confirmpassword && <p className="text-red-800 text-base mt-1">{errors.confirmpassword.message}</p>}
                    </div>

                    <div className="mb-3">
                        <button className="mb-5 bg-black text-white border py-2 w-full rounded-xl mt-3 hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white">
                            Enviar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Reset;
