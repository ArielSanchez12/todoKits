import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import storeAuth from "../context/storeAuth";
import storePrestamos from "../context/storePrestamos";
import storeRecursos from "../context/storeRecursos";
import { ToastContainer, toast } from "react-toastify";
import { MdAssignment } from "react-icons/md";
import ModalPrestarRecurso from "../components/prestamos/ModalPrestarRecurso";
import ModalViewImage from "../components/profile/ModalViewImage" // ✅ NUEVO
import TablaHistorialDocente from "../components/prestamos/TablaHistorialDocente";

const Details = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [docente, setDocente] = useState({});
    const [prestamos, setPrestamos] = useState([]);
    const { fetchDataBackend } = useFetch();
    const { rol } = storeAuth();
    const [showModalPrestamo, setShowModalPrestamo] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false); // ✅ NUEVO
    const { fetchRecursos } = storeRecursos();

    const listDocente = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/detailsDocente/${id}`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
        };
        const response = await fetchDataBackend(url, null, "GET", headers);
        setDocente(response.docentes);

        await loadPrestamosDocente();
    };

    const loadPrestamosDocente = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const headers = {
                Authorization: `Bearer ${storedUser.state.token}`,
            };

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

    // ✅ URL de la imagen RECORTADA para el círculo
    const avatarUrl = docente?.avatarDocente || docente?.avatarDocenteOriginal || docente?.avatar || docente?.avatarOriginal || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    // ✅ URL de la imagen ORIGINAL para el modal
    const avatarOriginalUrl = docente?.avatarDocenteOriginal || docente?.avatarOriginal || docente?.avatarDocente || docente?.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

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
                                    <span className="text-gray-600 font-bold">Correo electrónico:{" "}
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
                        {/* ✅ Click en imagen abre modal con ORIGINAL */}
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="h-70 w-70 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setShowViewModal(true)}
                            title="Click para ver imagen completa"
                        />
                    </div>
                </div>

                <hr className="my-4 border-t-2 border-gray-300" />

                {rol === "Administrador" && (
                    <div className="flex flex-wrap gap-4 mb-6">
                        <button
                            onClick={() => setShowModalPrestamo(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors shadow-lg font-semibold"
                        >
                            <MdAssignment size={20} />
                            Prestar Recurso(s)
                        </button>
                    </div>
                )}

                <hr className="my-4 border-t-2 border-gray-300" />

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
                    <TablaHistorialDocente
                        prestamos={prestamos}
                        onRefresh={loadPrestamosDocente}
                        docenteId={id}
                    />
                )}
            </div>

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

            {/* ✅ Modal de vista de imagen - MUESTRA ORIGINAL */}
            <ModalViewImage
                imageSrc={avatarOriginalUrl}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                userName={`${docente?.nombreDocente || ''} ${docente?.apellidoDocente || ''}`}
            />
        </>
    );
};

export default Details;