import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logobuhoPuente from '../assets/buho_mitad.webp';

const ConfirmEmailChange = () => {
    const { token } = useParams();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // ✅ Usar la ruta universal de auth_routes
                const url = `${import.meta.env.VITE_BACKEND_URL}/confirm-email-change/${token}`;
                const response = await axios.get(url);
                toast.success(response?.data?.msg);
                setIsConfirmed(true);
            } catch (error) {
                console.error("Error al confirmar cambio de email:", error);
                toast.error(error?.response?.data?.msg || "Token inválido o expirado");
                setIsConfirmed(false);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Verificando cambio de email...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <ToastContainer />

            {/* Imagen circular centrada */}
            <img
                className="object-cover w-115 h-115 rounded-full border-4 border-solid border-slate-600 shadow-md"
                src={logobuhoPuente}
                alt={isConfirmed ? "Cambio de email exitoso" : "Error en cambio de email"}
            />

            {/* Mensajes y botón */}
            <div className="mt-8 text-center px-4">
                {isConfirmed ? (
                    <>
                        <p className="text-3xl md:text-4xl lg:text-5xl text-black font-bold mb-4">
                            Cambio de Email Exitoso
                        </p>
                        <p className="md:text-lg lg:text-xl text-gray-700 mt-4 mb-6">
                            Tu correo electrónico ha sido actualizado correctamente.<br />
                            Ya puedes iniciar sesión con tu nuevo correo.
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-3xl md:text-4xl lg:text-5xl text-red-600 font-bold mb-4">
                            Error en la Confirmación
                        </p>
                        <p className="md:text-lg lg:text-xl text-gray-700 mt-4 mb-6">
                            El enlace de confirmación es inválido o ha expirado.<br />
                            Por favor, solicita un nuevo cambio de email.
                        </p>
                    </>
                )}
                
                <Link
                    to="/login"
                    className="p-3 mt-7 inline-block w-48 text-center bg-black text-white border rounded-xl hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );
};

export default ConfirmEmailChange;