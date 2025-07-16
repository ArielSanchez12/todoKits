import { useEffect, useState } from "react"
import TableTreatments from "../components/treatments/Table"
import ModalTreatments from "../components/treatments/Modal"
import { useParams } from "react-router"
import useFetch from "../hooks/useFetch"
import storeAuth from "../context/storeAuth"
import storeTreatments from "../context/storeTreatments"
import { ToastContainer} from 'react-toastify'


const Details = () => {
    const { id } = useParams()
    const [docente, setDocente] = useState({})
    const [treatments, setTreatments] = useState([])
    const { fetchDataBackend } = useFetch()
    const { rol } = storeAuth()
    const { modal, toggleModal } = storeTreatments()

    const listDocente = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/docente/${id}`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        const headers= {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`
        }
        const response = await fetchDataBackend(url, null, "GET", headers)
        console.log(response)
        setDocente(response.docentes)
        setTreatments(response.tratamientos)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-EC', { dateStyle: 'long', timeZone: 'UTC' })
    }

    useEffect(() => {
        if(modal===false){
            listDocente()
        }
    },[modal])


    return (
        <>
            <ToastContainer />
            <div>
                <h1 className='font-black text-4xl text-gray-500'>Visualizar</h1>
                <hr className='my-4 border-t-2 border-gray-300' />
                <p className='mb-8'>Este módulo te permite visualizar todos los datos</p>
            </div>
            <div>

                <div className='m-5 flex justify-between'>

                    <div>
                        <ul className="list-disc pl-5">

                            {/* Datos del paciente */}
                            <li className="text-md text-gray-00 mt-4 font-bold text-xl">Datos del dueño</li>

                            <ul className="pl-5">
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Cédula: {docente?.cedulaPropietario} </span>
                                </li>

                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Nombre Docente: {docente?.nombreDocente}</span>
                                </li>

                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Correo electrónico: {docente?.emailDocente}</span>
                                </li>

                                <li className="text-md text-gray-00 mt-2">
                                <span className="text-gray-600 font-bold">Celular: {docente?.celularDocente}</span>
                                </li>
                            </ul>


                            {/* Datos del dueño */}
                            <li className="text-md text-gray-00 mt-4 font-bold text-xl">Datos del paciente</li>

                            <ul className="pl-5">
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Nombre: {docente?.nombreMascota}</span>
                                </li>

                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Tipo: {docente?.tipoMascota}</span>
                                </li>

                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Fecha de nacimiento: {formatDate(docente?.fechaNacimientoMascota)}</span>
                                </li>

                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Estado: </span>
                                    <span className="bg-blue-100 text-green-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                    {docente?.statusDocente && "activo"}
                                    </span>
                                </li>

                                <li className="text-md text-gray-00 mt-4">
                                    <span className="text-gray-600 font-bold">Síntomas: {docente?.sintomasMascota}</span>
                                </li>

                            </ul>
                        </ul>
                    </div>

                    <div>
                        <img src={docente?.avatarMascota || docente?.avatarMascotaIA} alt="dogandcat" className='h-80 w-80 rounded-full' />
                    </div>
                </div>

                <hr className='my-4 border-t-2 border-gray-300' />

                <div className='flex justify-between items-center'>

                    <p>Este módulo te permite gestionar los tratamientos</p>
                    {
                        rol==="Administrador" && // Aqui decia veterinario
                        (
                            <button className="px-5 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700"
                                    onClick={()=>{toggleModal("treatments")}}
                            >
                                Registrar
                            </button>
                        )
                    }

                    {modal === "treatments" && (<ModalTreatments docenteID={docente._id}/>)}

                </div>

                {
                    treatments.length == 0
                        ?
                        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            <span className="font-medium">No existen registros</span>
                        </div>
                        :
                        <TableTreatments treatments={treatments} listDocente={listDocente}/>
                }
            </div>
        </>

    )
}

export default Details