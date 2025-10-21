import { useState, useEffect } from "react";
import storePrestamos from "../context/storePrestamos";
import TablaPrestamosAdmin from "../components/prestamos/TablaPrestamosAdmin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Prestamos = () => {
  const { prestamos, fetchPrestamosAdmin, clearPrestamos, loading } = storePrestamos();
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const cargarPrestamos = async () => {
      try {
        await fetchPrestamosAdmin();
      } catch (error) {
        console.error("Error al cargar préstamos:", error);
        if (document.location.pathname.includes('/prestamos')) {
          toast.error("No se pudieron cargar los préstamos");
        }
      }
    };

    cargarPrestamos();

    return () => {
      clearPrestamos();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      await fetchPrestamosAdmin();
      toast.success("Préstamos actualizados");
    } catch (error) {
      toast.error("Error al actualizar préstamos");
    }
  };

  // Filtrar préstamos según estado
  const prestamosFiltrados =
    filtro === "todos"
      ? prestamos
      : prestamos?.filter((p) => p.estado === filtro);

  // Contar préstamos por estado
  const contadores = {
    todos: prestamos?.length || 0,
    pendiente: prestamos?.filter((p) => p.estado === "pendiente").length || 0,
    activo: prestamos?.filter((p) => p.estado === "activo").length || 0,
    finalizado: prestamos?.filter((p) => p.estado === "finalizado").length || 0,
    rechazado: prestamos?.filter((p) => p.estado === "rechazado").length || 0,
  };

  return (
    <div>
      <ToastContainer />
      <h1 className="font-black text-4xl text-black">Préstamos de Recursos</h1>
      <hr className="my-2 border-t-2 border-gray-300" />
      <p className="mb-8">
        Gestiona todos los préstamos de recursos realizados a los docentes
      </p>

      {/* Botón de actualizar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Préstamos
        </button>
      </div>

      {/* Filtros con contadores */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "todos", label: "Todos" },
          { key: "pendiente", label: "Pendientes" },
          { key: "activo", label: "Activos" },
          { key: "finalizado", label: "Finalizados" },
          { key: "rechazado", label: "Rechazados" },
        ].map((tipo) => (
          <button
            key={tipo.key}
            onClick={() => setFiltro(tipo.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === tipo.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            {tipo.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filtro === tipo.key
                  ? "bg-white text-blue-600"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {contadores[tipo.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 font-semibold">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">
            {contadores.pendiente}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 font-semibold">Activos</p>
          <p className="text-3xl font-bold text-green-600">
            {contadores.activo}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-semibold">Finalizados</p>
          <p className="text-3xl font-bold text-blue-600">
            {contadores.finalizado}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 font-semibold">Rechazados</p>
          <p className="text-3xl font-bold text-red-600">
            {contadores.rechazado}
          </p>
        </div>
      </div>

      {/* Tabla de préstamos */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando préstamos...</p>
        </div>
      ) : (
        <TablaPrestamosAdmin
          prestamos={prestamosFiltrados}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default Prestamos;