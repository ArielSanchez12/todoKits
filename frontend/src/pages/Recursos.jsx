import { useState, useEffect } from "react";
import storeRecursos from "../context/storeRecursos";
import Selector from "../components/recursos/Selector";
import FormRecurso from "../components/recursos/FormRecurso";
import TablaRecursos from "../components/recursos/TablaRecursos";

const Recursos = () => {
  const { recursos, fetchRecursos } = storeRecursos();
  const [vista, setVista] = useState("tabla"); // 'tabla' o 'crear'
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    fetchRecursos();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {vista === "tabla" ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Gestión de Recursos</h1>
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
            <TablaRecursos
              recursos={recursos}
              filtro={filtro}
              onRefresh={fetchRecursos}
            />
          </>
        ) : (
          <FormRecurso onBack={() => setVista("tabla")} />
        )}
      </div>
    </div>
  );
};

export default Recursos;