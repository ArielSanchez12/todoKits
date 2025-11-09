import { MdDeleteForever, MdPublishedWithChanges, MdRefresh, MdExpandMore, MdExpandLess } from "react-icons/md";
import storeRecursos from "../../context/storeRecursos";
import { useState, useRef } from "react";

const TablaRecurso = ({ recursos, filtro, onRefresh, onEdit }) => {
  const { deleteRecurso } = storeRecursos();
  const [hoveredContenido, setHoveredContenido] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, direction: 'right' });
  const tooltipRef = useRef(null);
  const cellRef = useRef(null);

  // ✅ NUEVOS ESTADOS PARA PAGINACIÓN
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const REGISTROS_INICIALES = 5;

  const recursosFiltrados =
    filtro === "todos"
      ? recursos
      : recursos?.filter((r) => r.tipo === filtro);

  const recursosMostrados = mostrarTodos 
    ? recursosFiltrados 
    : recursosFiltrados?.slice(0, REGISTROS_INICIALES);

  const hayMasRegistros = recursosFiltrados?.length > REGISTROS_INICIALES;

  const handleDelete = async (id, recurso) => {
    if (recurso.estado === "activo" || recurso.estado === "prestado") {
      alert("No se puede eliminar un recurso que está en préstamo activo");
      return;
    }

    if (window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) {
      try {
        await deleteRecurso(id);
        onRefresh();
      } catch (error) {
        console.error("Error al eliminar recurso:", error);
      }
    }
  };

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activo: "bg-orange-100 text-orange-800",
      prestado: "bg-blue-100 text-blue-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const handleMouseEnter = (recursoId) => {
    setHoveredContenido(recursoId);

    setTimeout(() => {
      if (tooltipRef.current && cellRef.current) {
        const cellRect = cellRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let direction = 'right';
        let top = cellRect.top;
        let left = cellRect.right + 10;

        if (left + tooltipRect.width > windowWidth - 20) {
          direction = 'left';
          left = cellRect.left - tooltipRect.width - 10;
        }

        if (top + tooltipRect.height > windowHeight - 20) {
          top = windowHeight - tooltipRect.height - 20;
        }

        if (left < 20) {
          direction = 'bottom';
          left = cellRect.left;
          top = cellRect.bottom + 10;

          if (top + tooltipRect.height > windowHeight - 20) {
            direction = 'top';
            top = cellRect.top - tooltipRect.height - 10;
          }
        }

        setTooltipPosition({ top, left, direction });
      }
    }, 10);
  };

  const renderContenido = (recurso) => {
    if (!recurso.contenido || recurso.contenido.length === 0) {
      return <span className="text-gray-400">No aplica</span>;
    }

    const primerosItems = recurso.contenido.slice(0, 2);
    const hayMas = recurso.contenido.length > 2;

    return (
      <div
        ref={recurso._id === hoveredContenido ? cellRef : null}
        className="relative flex justify-center" // 👈 ajuste de alineación
        onMouseEnter={() => handleMouseEnter(recurso._id)}
        onMouseLeave={() => setHoveredContenido(null)}
      >
        <ul className="list-disc text-sm text-left inline-block"> {/* 👈 ajuste: centrado con inline-block */}
          {primerosItems.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
          {hayMas && (
            <li className="text-blue-600 cursor-pointer font-semibold">
              +{recurso.contenido.length - 2} más...
            </li>
          )}
        </ul>

        {hoveredContenido === recurso._id && hayMas && (
          <div
            ref={tooltipRef}
            className="fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-2xl max-w-xs"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <p className="font-semibold mb-2 border-b border-gray-600 pb-1">
              Contenido completo:
            </p>
            <ul className="list-disc pl-4 text-sm space-y-1 max-h-60 overflow-y-auto">
              {recurso.contenido.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>

            {tooltipPosition.direction === 'right' && (
              <div className="absolute top-3 -left-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-800"></div>
            )}
            {tooltipPosition.direction === 'left' && (
              <div className="absolute top-3 -right-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-800"></div>
            )}
            {tooltipPosition.direction === 'bottom' && (
              <div className="absolute -top-2 left-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-800"></div>
            )}
            {tooltipPosition.direction === 'top' && (
              <div className="absolute -bottom-2 left-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-800"></div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ✅ HEADER CON CONTADOR */}
      <div className="flex justify-between items-center bg-black text-white p-4 rounded-t-lg">
        <div>
          <h2 className="text-xl font-bold">🔧 Gestión de Recursos</h2>
          <p className="text-xs text-gray-300 mt-1">
            Mostrando {recursosMostrados?.length || 0} de {recursosFiltrados?.length || 0} recursos
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <MdRefresh size={20} />
          Actualizar
        </button>
      </div>

      {/* ✅ TABLA PEGADA CON shadow-lg */}
      <div className="overflow-x-auto shadow-lg">
        <table className="w-full table-auto bg-white">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">N°</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Laboratorio</th>
              <th className="p-2">Aula</th>
              <th className="p-2">Estado</th>
              <th className="p-2 text-center">Contenido</th> {/* 👈 asegura que el header quede centrado */}
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recursosMostrados && recursosMostrados.length > 0 ? (
              recursosMostrados.map((recurso, index) => {
                const estaBloqueado = recurso.estado === "activo" || recurso.estado === "prestado";

                return (
                  <tr
                    key={recurso._id}
                    className={`text-center ${estaBloqueado
                      ? "bg-gray-100"
                      : "hover:bg-gray-300"
                      }`}
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 font-semibold">
                      {recurso.tipo.toUpperCase()}
                      {estaBloqueado && (
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                          EN PRÉSTAMO
                        </span>
                      )}
                    </td>
                    <td className="p-2">{recurso.nombre}</td>
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
                    <td className="p-2 text-left align-middle"> {/* 👈 alineado al centro */}
                      {renderContenido(recurso)}
                    </td>
                    <td className="p-2 flex justify-center gap-2">
                      <MdPublishedWithChanges
                        className={`h-6 w-6 ${estaBloqueado
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 cursor-pointer hover:text-blue-800"
                          }`}
                        title={estaBloqueado ? "No se puede editar (en préstamo)" : "Editar"}
                        onClick={() => {
                          if (estaBloqueado) {
                            alert("No se puede editar un recurso que está en préstamo activo");
                          } else {
                            onEdit(recurso);
                          }
                        }}
                      />
                      <MdDeleteForever
                        className={`h-6 w-6 ${estaBloqueado
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 cursor-pointer hover:text-red-800"
                          }`}
                        title={estaBloqueado ? "No se puede eliminar (en préstamo)" : "Eliminar"}
                        onClick={() => handleDelete(recurso._id, recurso)}
                      />
                    </td>
                  </tr>
                );
              })
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

      {/* ✅ BOTONES DE MOSTRAR MÁS / COLAPSAR */}
      {hayMasRegistros && (
        <div className="bg-white p-4 rounded-b-lg shadow-lg border-t border-gray-200 flex justify-center">
          {!mostrarTodos ? (
            <button
              onClick={() => setMostrarTodos(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <MdExpandMore size={20} />
              Mostrar Todos ({recursosFiltrados.length - REGISTROS_INICIALES} más)
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
  );
};

export default TablaRecurso;
