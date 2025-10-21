import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import storeAuth from "../context/storeAuth";
import storePrestamos from "../context/storePrestamos"; // Cambiar import
import storeRecursos from "../context/storeRecursos"; // Agregar
import { ToastContainer, toast } from "react-toastify";
import { MdDeleteForever, MdNoteAdd, MdAssignment } from "react-icons/md";
import ModalPrestarRecurso from "../components/prestamos/ModalPrestarRecurso"; // Nuevo modal
import TablaPrestamosAdmin from "../components/prestamos/TablaPrestamosAdmin"; // Nueva tabla

const Details = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [docente, setDocente] = useState({});
    const [prestamos, setPrestamos] = useState([]); // Cambiar de treatments a prestamos
    const { fetchDataBackend } = useFetch();
    const { rol } = storeAuth();
    const [showModalPrestamo, setShowModalPrestamo] = useState(false); // ✅ Estado para modal
    const { fetchRecursos } = storeRecursos(); // Para recargar recursos

    const listDocente = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/detailsDocente/${id}`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        };
        const response = await fetchDataBackend(url, null, "GET", headers);
        setDocente(response.docentes);

        // Cargar préstamos del docente
        await loadPrestamosDocente();
    };

    // Nueva función para cargar préstamos del docente
    const loadPrestamosDocente = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const headers = {
                Authorization: `Bearer ${storedUser.state.token}`,
            };

            // Obtener todos los préstamos y filtrar los de este docente
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamos`,
                { headers }
            );

            const data = await response.json();
            const prestamosDocente = data.filter(p => p.docente?._id === id);
            setPrestamos(prestamosDocente);
        } catch (error) {
            console.error("Error al cargar préstamos:", error);
            setPrestamos([]);
        }
    };

    // Función para eliminar docente
    const handleDelete = async () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este docente?")) {
            try {
                const storedUser = JSON.parse(localStorage.getItem("auth-token"));
                const headers = {
                    Authorization: `Bearer ${storedUser.state.token}`,
                };

                await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/administrador/docente/${id}`,
                    {
                        method: "DELETE",
                        headers,
                    }
                );

                toast.success("Docente eliminado exitosamente");
                setTimeout(() => navigate("/dashboard/listar"), 1500);
            } catch (error) {
                console.error("Error al eliminar docente:", error);
                toast.error("Error al eliminar docente");
            }
        }
    };

    useEffect(() => {
        listDocente();
    }, []);

    return (
        <>
            <ToastContainer />
            <div>
                <h1 className="font-black text-4xl text-black">Visualizar Docente</h1>
                <hr className="my-2 border-t-2 border-gray-300" />
                <p className="mb-8">
                    Este módulo te permite visualizar todos los datos de cada docente
                </p>
            </div>

            <div>
                <div className="m-5 flex justify-between">
                    <div>
                        <ul className="list-disc pl-5">
                            {/* Datos del docente */}
                            <li className="text-md text-gray-00 mt-4 font-bold text-xl">
                                Datos del docente
                            </li>
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
                                    <span className="text-gray-600 font-bold">
                                        Correo electrónico:{" "}
                                    </span>
                                    {docente?.emailDocente}
                                </li>
                                <li className="text-md text-gray-00 mt-2">
                                    <span className="text-gray-600 font-bold">Estado: </span>
                                    <span className="bg-blue-100 text-green-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                        {docente?.statusDocente ? "Activo" : "Inactivo"}
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
                            className="h-70 w-70 rounded-full object-cover"
                        />
                    </div>
                </div>

                <hr className="my-4 border-t-2 border-gray-300" />

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={() => navigate(`/dashboard/actualizar/${id}`)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <MdNoteAdd size={20} />
                        Editar Docente
                    </button>

                    {rol === "Administrador" && (
                        <button
                            onClick={() => setShowModalPrestamo(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                        >
                            <MdAssignment size={20} />
                            Prestar Recurso(s)
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                    >
                        <MdDeleteForever size={20} />
                        Eliminar Docente
                    </button>
                </div>

                <hr className="my-4 border-t-2 border-gray-300" />

                {/* Sección de préstamos */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Préstamos del Docente ({prestamos.length})
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Historial de recursos prestados a este docente
                    </p>
                </div>

                {prestamos.length === 0 ? (
                    <div
                        className="p-4 mb-4 text-base text-blue-800 rounded-lg bg-blue-50"
                        role="alert"
                    >
                        <span className="font-medium">
                            Este docente no tiene préstamos registrados
                        </span>
                    </div>
                ) : (
                    <TablaPrestamosAdmin
                        prestamos={prestamos}
                        onRefresh={loadPrestamosDocente}
                    />
                )}
            </div>

            {/* Modal de préstamo */}
            {showModalPrestamo && docente && (
                <ModalPrestarRecurso
                    docente={docente}
                    onClose={() => setShowModalPrestamo(false)}
                    onSuccess={async () => {
                        setShowModalPrestamo(false);
                        await loadPrestamosDocente();
                        await fetchRecursos();
                    }}
                />
            )}
        </>
    );
};

export default Details;