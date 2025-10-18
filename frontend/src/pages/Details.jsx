import { useEffect, useState } from "react"
import TableTreatments from "../components/treatments/Table"
import ModalTreatments from "../components/treatments/Modal"
import { useParams } from "react-router"
import useFetch from "../hooks/useFetch"
import storeAuth from "../context/storeAuth"
import storeTreatments from "../context/storeTreatments"
import { ToastContainer } from 'react-toastify'


const Details = () => {
    const { id } = useParams()
    const [docente, setDocente] = useState({})
    const [treatments, setTreatments] = useState([])
    const { fetchDataBackend } = useFetch()
    const { rol } = storeAuth()
    const { modal, toggleModal } = storeTreatments()

    const listDocente = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/detailsDocente/${id}`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`
        }
        const response = await fetchDataBackend(url, null, "GET", false, headers)
        
        console.log("Response completa:", response); // Para debug
        
        setDocente(response?.docentes || {})
        setTreatments(response?.tratamientos || [])
    }


    useEffect(() => {
        listDocente()
    }, [id])

    useEffect(() => {
        if (modal === false) {
            listDocente()
        }
    }, [modal])


    return (
        <>
            <ToastContainer />
            <div>
                <h1 className='font-black text-4xl text-black'>Visualizar</h1>
                <hr className='my-2 border-t-2 border-gray-300' />
                <p className='mb-8'>Este módulo te permite visualizar todos los datos de cada docente</p>
            </div>
            <div>

                <div className='m-5 flex justify-between'>
                    <div>
                        <ul className="list-disc pl-5">
                            {/* Datos del docente */}
                            <li className="text-md text-gray-00 mt-4 font-bold text-xl">Datos del docente</li>
                            <ul className="pl-5">
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Nombre: </span>
                                    {docente?.nombreDocente}
                                </li>
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Apellido: </span>
                                    {docente?.apellidoDocente}
                                </li>
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Celular: </span>
                                    {docente?.celularDocente}
                                </li>
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Correo electrónico: </span>
                                    {docente?.emailDocente}
                                </li>
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Estado: </span>
                                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${
                                        docente?.statusDocente === true 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {docente?.statusDocente === true ? "Activo" : "Inactivo"}
                                    </span>
                                </li>
                            </ul>
                        </ul>
                    </div>
                    <div>
                        <img
                            src={
                                docente?.avatarDocente ||
                                docente?.avatar ||
                                "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                            }
                            alt="avatar"
                            className='h-70 w-70 rounded-full object-cover'
                        />
                    </div>
                </div>

                <hr className='my-4 border-t-2 border-gray-300' />

                <div className='flex justify-between items-center'>

                    <p>Este módulo te permite gestionar prestamos de recursos</p>
                    {
                        rol === "Administrador" &&
                        (
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-black hover:scale-105 duration-300"
                                onClick={() => { toggleModal("treatments") }}
                            >
                                Prestar recurso(s)
                            </button>
                        )
                    }

                    {modal === "treatments" && (<ModalTreatments docenteID={docente._id} />)}

                </div>

                {
                    treatments.length === 0
                        ?
                        <div className="p-4 mb-4 text-base text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            <span className="font-medium">No existen registros</span>
                        </div>
                        :
                        <TableTreatments treatments={treatments} listDocente={listDocente} />
                }
            </div>
        </>

    )
}

export default Details