import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router'

const Table = () => {

    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()
    const [docentes, setDocentes] = useState([])

    const listPatients = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/docente/list`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        const headers= {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }
        const response = await fetchDataBackend(url, null, "GET", headers)
        setDocentes(...docentes, response)
    }

    useEffect(() => {
        listPatients()
    }, [])


    if (docentes.length === 0) {
        return (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium">No existen registros</span>
            </div>
        )
    }

    return (

        <table className="w-full mt-5 table-auto shadow-lg bg-white">
            <thead className="bg-gray-800 text-slate-400">
                <tr>
                    {["N°", "Nombre Docente", "Apellido Docente", "Dirección Docente", "Celular Docente", "Email Docente", "Estado", "Acciones"].map((header) => (
                        <th key={header} className="p-2">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {
                    docentes.map((docente, index) => (
                        <tr className="hover:bg-gray-300 text-center"
                            key={docente._id}>
                            <td>{index + 1}</td>
                            <td>{docente.nombreDocente}</td>
                            <td>{docente.apellidoDocente}</td>
                            <td>{docente.direccionDocente}</td>
                            <td>{docente.celularDocente}</td>
                            <td>{docente.emailDocente}</td>
                            <td>
                                <span className="bg-blue-100 text-green-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{docente.statusDocente && "activo"}</span>
                            </td>
                            <td className='py-2 text-center'>
                                <MdPublishedWithChanges
                                    title="Actualizar"
                                    className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-blue-600"
                                />

                                <MdInfo
                                    title="Más información"
                                    className="h-7 w-7 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-600"
                                    onClick={() => navigate(`/dashboard/visualizar/${docente._id}`)}
                                />

                                <MdDeleteForever
                                    title="Eliminar"
                                    className="h-7 w-7 text-red-900 cursor-pointer inline-block hover:text-red-600"
                                />
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

export default Table
