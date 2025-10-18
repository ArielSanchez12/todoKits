import { MdDeleteForever, MdInfo, MdPublishedWithChanges } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import storeAuth from "../../context/storeAuth";


const Table = () => {

    const navigate = useNavigate()
    const { fetchDataBackend } = useFetch()
    const [docentes, setDocentes] = useState([])
    const { rol } = storeAuth()

    const listPatients = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/listDocentes`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        }
        const response = await fetchDataBackend(url, null, "GET", headers)
        setDocentes(response) 
    }

    useEffect(() => {
        listPatients()
    }, [])

    if (docentes.length === 0) {
        return (
            <div className="p-4 mb-4 text-base text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium">No existen registros</span>
            </div>
        )
    }

    const deleteDocente = async (id) => {
        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este docente?");
        if (confirmDelete) {
            const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/deleteDocente/${id}`;
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
            };
            // No envíes undefined como body, solo headers
            const response = await fetchDataBackend(url, null, "DELETE", headers);
            if (response && response.msg === "Docente eliminado exitosamente") {
                setDocentes((prevDocentes) => prevDocentes.filter(docente => docente._id !== id));
            } else {
                toast.error(response?.msg || "Error al eliminar docente");
            }
        }
    }




    return (

        <table className="w-full mt-5 table-auto shadow-lg bg-white">
            <ToastContainer />
            <thead className="bg-black text-white">
                <tr>
                    {["N°", "Nombre", "Apellido", "Dirección", "Celular", "Email", "Estado", "Acciones"].map((header) => (
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
                            <td>{docente.celularDocente}</td>
                            <td>{docente.emailDocente}</td>
                            <td>
                                <span className="bg-blue-100 text-green-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{docente.statusDocente && "Activo"}</span>
                            </td>
                            <td className='py-2 text-center'>
                                <MdInfo
                                    title="Detalles"
                                    className="h-8 w-8 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-500"
                                    onClick={() => navigate(`/dashboard/visualizar/${docente._id}`)}
                                />

                                {
                                    rol === "Administrador" && // Esto si vale para admin 
                                    (
                                        <>
                                            <MdPublishedWithChanges
                                                title="Actualizar"
                                                className="h-8 w-8 text-slate-800 cursor-pointer inline-block mr-2 hover:text-blue-500"
                                                onClick={() => navigate(`/dashboard/actualizar/${docente._id}`)}
                                            />

                                            <MdDeleteForever
                                                title="Eliminar"
                                                className="h-8 w-8 text-red-800 cursor-pointer inline-block hover:text-red-500"
                                                onClick={() => { deleteDocente(docente._id) }}
                                            />
                                        </>
                                    )
                                }
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

export default Table
