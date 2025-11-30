import { MdDeleteForever, MdInfo, MdPublishedWithChanges, MdRefresh, MdExpandMore, MdExpandLess } from "react-icons/md";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import storeAuth from "../../context/storeAuth";
import storePrestamos from "../../context/storePrestamos";
import storeTransferencias from "../../context/storeTransferencias";

const Table = () => {
    const navigate = useNavigate();
    const { fetchDataBackend } = useFetch();
    const [docentes, setDocentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { rol } = storeAuth();
    const [docentesBloqueados, setDocentesBloqueados] = useState({}); // Nuevo estado para trackear docentes bloqueados
    const [prestamos, setPrestamos] = useState([]);
    const [transferencias, setTransferencias] = useState([]);

    // ESTADOS PARA PAGINACIÓN
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const REGISTROS_INICIALES = 5;

    // FUNCIÓN PARA VERIFICAR SI UN DOCENTE TIENE PRÉSTAMOS/TRANSFERENCIAS ACTIVAS
    const verificarDocenteBloqueado = (docenteId, prestamosData, transferenciasData) => {
        // Verificar préstamos activos o pendientes del docente
        const tienePrestamosActivos = prestamosData?.some(p =>
            p.docente?._id === docenteId && (p.estado === "pendiente" || p.estado === "activo")
        );

        if (tienePrestamosActivos) return true;

        // Verificar transferencias pendientes o confirmadas (como origen o destino)
        const tieneTransferenciasActivas = transferenciasData?.some(t =>
            (t.docenteOrigen?._id === docenteId || t.docenteDestino?._id === docenteId) &&
            (t.estado === "pendiente_origen" || t.estado === "confirmado_origen")
        );

        return tieneTransferenciasActivas;
    };

    const listPatients = async () => {
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
            };

            // Cargar docentes
            const urlDocentes = `${import.meta.env.VITE_BACKEND_URL}/administrador/listDocentes`;
            const responseDocentes = await fetchDataBackend(urlDocentes, null, "GET", headers);
            setDocentes(responseDocentes);

            // Cargar préstamos del admin
            const urlPrestamos = `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamos`;
            const responsePrestamos = await fetchDataBackend(urlPrestamos, null, "GET", headers);
            setPrestamos(responsePrestamos || []);

            // Cargar transferencias del admin
            const urlTransferencias = `${import.meta.env.VITE_BACKEND_URL}/administrador/transferencias`;
            const responseTransferencias = await fetchDataBackend(urlTransferencias, null, "GET", headers);
            setTransferencias(responseTransferencias || []);

            // Verificar bloqueos para cada docente
            const bloqueos = {};
            responseDocentes?.forEach(docente => {
                bloqueos[docente._id] = verificarDocenteBloqueado(
                    docente._id,
                    responsePrestamos || [],
                    responseTransferencias || []
                );
            });
            setDocentesBloqueados(bloqueos);

            toast.success("Lista actualizada correctamente");
        } catch (error) {
            console.error("Error al cargar docentes:", error);
            toast.error("Error al actualizar la lista");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        listPatients();
    }, []);

    const handleEdit = (docente) => {
        const estaBloqueado = docentesBloqueados[docente._id];

        if (estaBloqueado) {
            alert("No se puede editar un docente con préstamos o transferencias activas");
            return;
        }

        navigate(`/dashboard/actualizar/${docente._id}`);
    };

    const deleteDocente = async (id) => {
        const estaBloqueado = docentesBloqueados[id];

        if (estaBloqueado) {
            alert("No se puede eliminar un docente con préstamos o transferencias activas");
            return;
        }

        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este docente?");
        if (confirmDelete) {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/deleteDocente/${id}`;
                const storedUser = JSON.parse(localStorage.getItem("auth-token"));
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedUser.state.token}`,
                };
                const response = await fetchDataBackend(url, null, "DELETE", headers);

                if (response && response.msg === "Docente eliminado exitosamente") {
                    setDocentes((prevDocentes) => prevDocentes.filter(docente => docente._id !== id));
                    toast.success("Docente eliminado");
                } else {
                    toast.error(response?.msg || "Error al eliminar docente");
                }
            } catch (error) {
                console.error("Error al eliminar docente:", error);
                toast.error(error?.msg || "Error al eliminar docente");
            }
        }
    };

    // FUNCIÓN PARA OBTENER DOCENTES A MOSTRAR
    const docentesMostrados = mostrarTodos
        ? docentes
        : docentes.slice(0, REGISTROS_INICIALES);

    // VERIFICAR SI HAY MÁS REGISTROS
    const hayMasRegistros = docentes.length > REGISTROS_INICIALES;

    if (docentes.length === 0 && !loading) {
        return (
            <div className="p-4 mb-4 text-base text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium">No existen registros</span>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />

            {/* HEADER CON CONTADOR */}
            <div className="flex justify-between items-center bg-black text-white p-4 rounded-t-lg">
                <div>
                    <h2 className="text-xl font-bold">👥 Lista de Docentes</h2>
                    <p className="text-xs text-gray-300 mt-1">
                        Mostrando {docentesMostrados.length} de {docentes.length} registros
                    </p>
                </div>
                <button
                    onClick={listPatients}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <MdRefresh size={20} className={loading ? "animate-spin" : ""} />
                    {loading ? "Actualizando..." : "Actualizar"}
                </button>
            </div>

            {/* TABLA PEGADA CON shadow-lg */}
            {loading ? (
                <div className="flex justify-center items-center p-8 bg-white shadow-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto shadow-lg">
                        <table className="w-full table-auto bg-white">
                            <thead className="bg-black text-white">
                                <tr>
                                    {["N°", "Nombres", "Apellidos", "Celular", "Email", "Estado", "Acciones"].map((header) => (
                                        <th key={header} className="p-2">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {docentesMostrados.map((docente, index) => {
                                    const estaBloqueado = docentesBloqueados[docente._id];

                                    return (
                                        <tr
                                            className={`text-center ${estaBloqueado
                                                    ? "bg-gray-100"
                                                    : "hover:bg-gray-300"
                                                }`}
                                            key={docente._id}
                                        >
                                            <td className="p-2">{index + 1}</td>
                                            <td className="p-2">
                                                {docente.nombreDocente}
                                                {estaBloqueado && (
                                                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                                        CON PRÉSTAMOS ACTIVOS
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-2">{docente.apellidoDocente}</td>
                                            <td className="p-2">{docente.celularDocente}</td>
                                            <td className="p-2">{docente.emailDocente}</td>
                                            <td className="p-2">
                                                <span className="bg-blue-100 text-green-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                                    {docente.statusDocente && "Activo"}
                                                </span>
                                            </td>
                                            <td className='py-2 text-center'>
                                                <MdInfo
                                                    title="Detalles"
                                                    className="h-8 w-8 text-slate-800 cursor-pointer inline-block mr-2 hover:text-green-500"
                                                    onClick={() => navigate(`/dashboard/visualizar/${docente._id}`)}
                                                />

                                                {rol === "Administrador" && (
                                                    <>
                                                        <MdPublishedWithChanges
                                                            title={estaBloqueado ? "No se puede editar (tiene préstamos activos)" : "Actualizar"}
                                                            className={`h-8 w-8 ${estaBloqueado
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-slate-800 cursor-pointer hover:text-blue-500"
                                                                } inline-block mr-2`}
                                                            onClick={() => handleEdit(docente)}
                                                        />

                                                        <MdDeleteForever
                                                            title={estaBloqueado ? "No se puede eliminar (tiene préstamos activos)" : "Eliminar"}
                                                            className={`h-8 w-8 ${estaBloqueado
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-red-800 cursor-pointer hover:text-red-500"
                                                                } inline-block`}
                                                            onClick={() => deleteDocente(docente._id)}
                                                        />
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* BOTONES DE MOSTRAR MÁS / COLAPSAR */}
                    {hayMasRegistros && (
                        <div className="bg-white p-4 rounded-b-lg shadow-lg border-t border-gray-200 flex justify-center">
                            {!mostrarTodos ? (
                                <button
                                    onClick={() => setMostrarTodos(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    <MdExpandMore size={20} />
                                    Mostrar Todos ({docentes.length - REGISTROS_INICIALES} más)
                                </button>
                            ) : (
                                <button
                                    onClick={() => setMostrarTodos(false)}
                                    className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                >
                                    <MdExpandLess size={20} />
                                    Colapsar Todo
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Table;