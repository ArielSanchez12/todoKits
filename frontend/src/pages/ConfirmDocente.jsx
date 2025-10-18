import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logoEPN from '../assets/epn_dep.webp';

const ConfirmDocente = () => {
    const { token } = useParams();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const confirmarCuenta = async () => {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/docente/confirm/${token}`;
                const { data } = await axios(url);
                toast.success(data.msg);
                setIsConfirmed(true);
            } catch (error) {
                toast.error(error.response?.data?.msg || "Error al confirmar cuenta");
            } finally {
                setLoading(false);
            }
        };

        confirmarCuenta();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
                <p className="ml-2">Confirmando cuenta...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <ToastContainer />
            
            <img
                src={logoEPN}
                alt="Logo EPN"
                className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg mb-8"
            />
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    {isConfirmed ? '¡Cuenta Confirmada!' : 'Error de Confirmación'}
                </h1>
                
                <p className="text-gray-600 mb-6">
                    {isConfirmed 
                        ? 'Tu cuenta ha sido confirmada correctamente. Ahora puedes iniciar sesión.' 
                        : 'Hubo un problema al confirmar tu cuenta. El enlace podría haber expirado o ser inválido.'}
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

export default ConfirmDocente;