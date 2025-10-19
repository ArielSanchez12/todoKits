import { useState, useEffect } from "react";
import storeRecursos from "../context/storeRecursos";
import FormRecurso from "../components/recursos/FormRecurso";
import TablaRecurso from "../components/recursos/TablaRecurso";

const Recursos = () => {
  const { recursos, fetchRecursos, clearRecursos } = storeRecursos();
  const [vista, setVista] = useState("tabla"); // 'tabla' o 'crear'
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    // Fetch solo cuando se monta el componente
    const cargarRecursos = async () => {
      try {
        await fetchRecursos();
      } catch (error) {
        console.error("Error al cargar recursos:", error);
      }
    };

    cargarRecursos();

    // Limpiar cuando se desmonta el componente
    return () => {
      clearRecursos();
    };
  }, []); // Dependencias vacías para ejecutar solo al montar

  return (
    <div>
      <h1 className='font-black text-4xl text-black'>Recursos</h1>
      <hr className='my-2 border-t-2 border-gray-300' />
      <p className='mb-8'>Este módulo te permite gestionar los recursos del laboratorio</p>

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

          {/* Filtros */}
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

          {/* Tabla */}
          <TablaRecurso
            recursos={recursos}
            filtro={filtro}
            onRefresh={fetchRecursos}
          />
        </>
      ) : (
        <FormRecurso onBack={() => setVista("tabla")} />
      )}
    </div>
  );
};

export default Recursos;