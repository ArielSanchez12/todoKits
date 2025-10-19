import { useState, useEffect } from "react";
import storeRecursos from "../context/storeRecursos";
import FormRecurso from "../components/recursos/FormRecurso";
import TablaRecurso from "../components/recursos/TablaRecurso";
import { ToastContainer } from "react-toastify";

const Recursos = () => {
  const { recursos, fetchRecursos, clearRecursos, loading } = storeRecursos();
  const [vista, setVista] = useState("tabla");
  const [filtro, setFiltro] = useState("todos");
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        setError(null);
        await fetchRecursos();
      } catch (error) {
        console.error("Error al cargar recursos:", error);
        setError("No se pudieron cargar los recursos. Intenta nuevamente.");
      }
    };

    cargarRecursos();

    return () => {
      clearRecursos();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setError(null);
      await fetchRecursos();
    } catch (error) {
      setError("Error al actualizar recursos");
    }
  };

  return (
    <div>
      <ToastContainer />
      <h1 className='font-black text-4xl text-black'>Recursos</h1>
      <hr className='my-2 border-t-2 border-gray-300' />
      <p className='mb-8'>Este módulo te permite gestionar los recursos del laboratorio</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {vista === "tabla" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setVista("crear")}
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
            />
          )}
        </>
      ) : (
        <FormRecurso 
          onBack={() => {
            setVista("tabla");
            handleRefresh();
          }} 
        />
      )}
    </div>
  );
};

export default Recursos;