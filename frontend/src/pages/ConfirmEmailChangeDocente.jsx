import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logoEPN from '../assets/epn_dep.webp';

const ConfirmEmailChangeDocente = () => {
    const { token } = useParams();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const confirmarCambioEmail = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/docente/confirm-new-email/${token}`;
                const { data } = await axios.get(url);
                toast.success(data.msg);
                setIsConfirmed(true);
            } catch (error) {
                toast.error(error.response?.data?.msg || "Error al confirmar cambio de email");
            } finally {
                setLoading(false);
            }
        };

        confirmarCambioEmail();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
                <p className="ml-2">Confirmando cambio de email...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <ToastContainer />
            
            <img
                src={logoEPN}
                alt="Logo EPN"
                className="w-80 h-80 object-cover rounded-full border-4 border-white shadow-lg mb-8"
            />
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    {isConfirmed ? '¡Email Actualizado!' : 'Error de Confirmación'}
                </h1>
                
                <p className="text-gray-600 mb-6">
                    {isConfirmed 
                        ? 'Tu correo electrónico ha sido actualizado correctamente.' 
                        : 'Hubo un problema al confirmar el cambio de email. El enlace podría haber expirado o ser inválido.'}
                </p>
                
                <Link
                    to="/login"
                    className="inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );
};

export default ConfirmEmailChangeDocente;