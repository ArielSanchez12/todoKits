import { MdDeleteForever, MdPublishedWithChanges } from "react-icons/md";
import storeRecursos from "../../context/storeRecursos";
import { useState } from "react";

const TablaRecurso = ({ recursos, filtro, onRefresh }) => {
  const { deleteRecurso } = storeRecursos();
  const [hoveredContenido, setHoveredContenido] = useState(null);

  const recursosFiltrados =
    filtro === "todos"
      ? recursos
      : recursos?.filter((r) => r.tipo === filtro);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) {
      await deleteRecurso(id);
      onRefresh();
    }
  };

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activo: "bg-green-100 text-green-800",
      prestado: "bg-blue-100 text-blue-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  // Renderizar contenido con tooltip
  const renderContenido = (recurso) => {
    if (!recurso.contenido || recurso.contenido.length === 0) {
      return <span className="text-gray-400">No aplica</span>;
    }

    const primerosItems = recurso.contenido.slice(0, 2);
    const hayMas = recurso.contenido.length > 2;

    return (
      <div 
        className="relative"
        onMouseEnter={() => setHoveredContenido(recurso._id)}
        onMouseLeave={() => setHoveredContenido(null)}
      >
        <ul className="list-disc pl-4 text-sm">
          {primerosItems.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
          {hayMas && (
            <li className="text-blue-600 cursor-pointer">
              +{recurso.contenido.length - 2} más...
            </li>
          )}
        </ul>

        {/* Tooltip con todos los items */}
        {hoveredContenido === recurso._id && hayMas && (
          <div className="absolute z-10 bg-gray-800 text-white p-3 rounded-lg shadow-lg -top-2 left-full ml-2 w-64">
            <p className="font-semibold mb-2">Contenido completo:</p>
            <ul className="list-disc pl-4 text-sm space-y-1">
              {recurso.contenido.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <div className="absolute top-3 -left-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full mt-5 table-auto shadow-lg bg-white">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2">N°</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Laboratorio</th>
            <th className="p-2">Aula</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Contenido</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recursosFiltrados && recursosFiltrados.length > 0 ? (
            recursosFiltrados.map((recurso, index) => (
              <tr key={recurso._id} className="hover:bg-gray-300 text-center">
                <td className="p-2">{index + 1}</td>
                <td className="p-2 font-semibold">
                  {recurso.tipo.toUpperCase()}
                </td>
                <td className="p-2">{recurso.nombre}</td>
                {/* Mostrar "No aplica" en lugar de "-" */}
                <td className="p-2">
                  {recurso.laboratorio || <span className="text-gray-400">No aplica</span>}
                </td>
                <td className="p-2">
                  {recurso.aula || <span className="text-gray-400">No aplica</span>}
                </td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeEstado(
                      recurso.estado
                    )}`}
                  >
                    {recurso.estado.charAt(0).toUpperCase() +
                      recurso.estado.slice(1)}
                  </span>
                </td>
                {/* Contenido con tooltip */}
                <td className="p-2 text-left">
                  {renderContenido(recurso)}
                </td>
                <td className="p-2 flex justify-center gap-2">
                  <MdPublishedWithChanges
                    className="h-6 w-6 text-blue-600 cursor-pointer hover:text-blue-800"
                    title="Actualizar"
                  />
                  <MdDeleteForever
                    className="h-6 w-6 text-red-600 cursor-pointer hover:text-red-800"
                    title="Eliminar"
                    onClick={() => handleDelete(recurso._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="p-4 text-center text-gray-500">
                No hay recursos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaRecurso;