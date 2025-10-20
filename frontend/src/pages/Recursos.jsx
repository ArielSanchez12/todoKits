import { useState, useEffect } from "react";
import storeRecursos from "../context/storeRecursos";
import FormRecurso from "../components/recursos/FormRecurso";
import TablaRecurso from "../components/recursos/TablaRecurso";
import { ToastContainer, toast } from "react-toastify";

const Recursos = () => {
  const { recursos, fetchRecursos, clearRecursos, loading, setRecursoEditando } = storeRecursos();
  const [vista, setVista] = useState("tabla");
  const [filtro, setFiltro] = useState("todos");
  const [modoEdicion, setModoEdicion] = useState(false); // Nuevo estado

  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        await fetchRecursos();
      } catch (error) {
        console.error("Error al cargar recursos:", error);
        if (document.location.pathname.includes('/recursos')) {
          toast.error("No se pudieron cargar los recursos");
        }
      }
    };

    cargarRecursos();

    return () => {
      clearRecursos();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      await fetchRecursos();
      toast.success("Recursos actualizados");
    } catch (error) {
      toast.error("Error al actualizar recursos");
    }
  };

  // Función para manejar edición
  const handleEdit = (recurso) => {
    setRecursoEditando(recurso);
    setModoEdicion(true);
    setVista("formulario");
  };

  // Función para volver a la tabla
  const handleBack = () => {
    setVista("tabla");
    setModoEdicion(false);
    setRecursoEditando(null);
    handleRefresh();
  };

  return (
    <div>
      <ToastContainer />
      <h1 className='font-black text-4xl text-black'>Recursos</h1>
      <hr className='my-2 border-t-2 border-gray-300' />
      <p className='mb-8'>Este módulo te permite gestionar los recursos del laboratorio</p>

      {vista === "tabla" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                setModoEdicion(false);
                setRecursoEditando(null);
                setVista("formulario");
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Recurso
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {["todos", "kit", "llave", "proyector"].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filtro === tipo
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                {tipo === "todos"
                  ? "Todos"
                  : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando recursos...</p>
            </div>
          ) : (
            <TablaRecurso
              recursos={recursos}
              filtro={filtro}
              onRefresh={handleRefresh}
              onEdit={handleEdit} // Pasar función de edición
            />
          )}
        </>
      ) : (
        <FormRecurso 
          onBack={handleBack}
          modoEdicion={modoEdicion} // Pasar modo edición
        />
      )}
    </div>
  );
};

export default Recursos;