import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFetch } from "../hooks/useFetch"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const ConfirmEmailChange = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const { fetchData } = useFetch()

    useEffect(() => {
        const confirmarCambioEmail = async () => {
            try {
                const response = await fetchData({
                    url: `${import.meta.env.VITE_BACKEND_URL}/administrador/confirm-new-email/${token}`,
                    options: {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                })

                if (response?.msg) {
                    toast.success("¡Email confirmado correctamente!", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                    
                    setTimeout(() => {
                        navigate('/login')
                    }, 3000)
                } else {
                    setError(true)
                    toast.error("Error al confirmar el email", {
                        position: "top-center",
                        autoClose: 3000,
                    })
                }
            } catch (err) {
                setError(true)
                console.error("Error al confirmar cambio de email:", err)
                toast.error("Error al confirmar el email. Intenta nuevamente.", {
                    position: "top-center",
                    autoClose: 3000,
                })
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            confirmarCambioEmail()
        }
    }, [token, fetchData, navigate])

    return (
        <div className="h-screen md:flex">
            <ToastContainer />
            <div className="relative overflow-hidden md:flex w-1/2 bg-gradient-to-tr from-blue-800 to-purple-700 i justify-around items-center hidden">
                <div>
                    <h1 className="text-white font-bold text-4xl font-sans">KITS</h1>
                    <p className="text-white mt-1">Laboratorio de Investigación</p>
                </div>
                <div className="absolute -bottom-32 -left-40 w-80 h-80 border-4 border-opacity-5 border-white rounded-full"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 border-4 border-opacity-5 border-white rounded-full"></div>
            </div>
            <div className="flex w-full md:w-1/2 justify-center items-center bg-white">
                <div className="w-full max-w-md">
                    {loading ? (
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                            <p className="mt-4 text-gray-600">Confirmando tu nuevo correo...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 className="my-4 text-gray-800 font-bold text-2xl">Token inválido o expirado</h1>
                            <p className="text-gray-600 mb-4">No pudimos confirmar tu nuevo correo. El enlace puede haber expirado.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                            >
                                Volver al Login
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h1 className="my-4 text-gray-800 font-bold text-2xl">¡Email confirmado!</h1>
                            <p className="text-gray-600 mb-4">Tu correo electrónico ha sido actualizado correctamente. Ya puedes iniciar sesión con tu nuevo correo.</p>
                            <p className="text-sm text-gray-500 mb-6">Redirigiendo al login en unos segundos...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ConfirmEmailChange