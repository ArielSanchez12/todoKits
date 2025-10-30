import { useState, useRef } from "react";
import { MdVisibility, MdCancel, MdAssignmentTurnedIn } from "react-icons/md";
import DetallePrestamo from "./DetallePrestamo";
import storePrestamos from "../../context/storePrestamos";

const TablaHistorialDocente = ({ prestamos, onRefresh }) => {
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const [modalCancelar, setModalCancelar] = useState(null);
  const [modalFinalizar, setModalFinalizar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [observacionesDevolucion, setObservacionesDevolucion] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredMotivo, setHoveredMotivo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, direction: 'right' });
  const tooltipRef = useRef(null);
  const cellRef = useRef(null);

  const { cancelarPrestamoAdmin, finalizarPrestamoAdmin } = storePrestamos();

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activo: "bg-green-100 text-green-800",
      finalizado: "bg-blue-100 text-blue-800",
      rechazado: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVerDetalle = (prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setMostrarDetalle(true);
  };

  const handleCancelar = async () => {
    if (!motivoCancelacion.trim()) {
      alert("Debe especificar el motivo de cancelación");
      return;
    }

    setLoading(true);
    try {
      await cancelarPrestamoAdmin(modalCancelar._id, motivoCancelacion);
      setModalCancelar(null);
      setMotivoCancelacion("");
      onRefresh();
    } catch (error) {
      console.error("Error al cancelar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      await finalizarPrestamoAdmin(modalFinalizar._id, observacionesDevolucion);
      setModalFinalizar(null);
      setObservacionesDevolucion("");
      onRefresh();
    } catch (error) {
      console.error("Error al finalizar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar préstamos
  const prestamosFiltrados = filtro === "todos"
    ? prestamos
    : prestamos?.filter((p) => p.estado === filtro);

  // Contar por estado
  const contadores = {
    activo: prestamos?.filter((p) => p.estado === "activo").length || 0,
    pendiente: prestamos?.filter((p) => p.estado === "pendiente").length || 0,
    finalizado: prestamos?.filter((p) => p.estado === "finalizado").length || 0,
    rechazado: prestamos?.filter((p) => p.estado === "rechazado").length || 0,
    todos: prestamos?.length || 0,
  };

  // Tooltip responsive para motivo
  const handleMouseEnter = (prestamoId) => {
    setHoveredMotivo(prestamoId);

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

  return (
    <>
      {/* ✅ FILTROS ARRIBA DEL HEADER */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: "todos", label: "Todos" },
          { key: "activo", label: "Activos" },
          { key: "pendiente", label: "Pendientes" },
          { key: "finalizado", label: "Finalizados" },
          { key: "rechazado", label: "Rechazados" },
        ].map((tipo) => (
          <button
            key={tipo.key}
            onClick={() => setFiltro(tipo.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
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

      {/* ✅ HEADER SIN BOTÓN ACTUALIZAR */}
      <div className="bg-black text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">📚 Historial del Docente</h2>
      </div>

      {/* ✅ TABLA PEGADA AL HEADER */}
      <div className="overflow-x-auto shadow-lg">
        <table className="w-full table-auto bg-white">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">N°</th>
              <th className="p-2">Recurso</th>
              <th className="p-2">Motivo</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Fecha Préstamo</th>
              <th className="p-2">Hora Confirmación</th>
              <th className="p-2">Hora Devolución</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamosFiltrados && prestamosFiltrados.length > 0 ? (
              prestamosFiltrados.map((prestamo, index) => (
                <tr key={prestamo._id} className="hover:bg-gray-300 text-center">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-semibold">
                    {prestamo.recurso?.nombre || "N/A"}
                    <br />
                    <span className="text-xs text-gray-600">
                      {prestamo.recurso?.tipo?.toUpperCase() || ""}
                    </span>
                  </td>
                  <td
                    className="p-2 relative"
                    ref={prestamo._id === hoveredMotivo ? cellRef : null}
                    onMouseEnter={() => {
                      if (prestamo.motivo?.descripcion && prestamo.motivo.descripcion.length > 30) {
                        handleMouseEnter(prestamo._id);
                      }
                    }}
                    onMouseLeave={() => setHoveredMotivo(null)}
                  >
                    <span className="font-medium">{prestamo.motivo?.tipo}</span>
                    {prestamo.motivo?.descripcion && (
                      <span className="block text-xs text-gray-600 mt-1 cursor-pointer">
                        {prestamo.motivo.descripcion.substring(0, 30)}
                        {prestamo.motivo.descripcion.length > 30 && "..."}
                      </span>
                    )}

                    {/* Tooltip */}
                    {hoveredMotivo === prestamo._id && prestamo.motivo?.descripcion && prestamo.motivo.descripcion.length > 30 && (
                      <div
                        ref={tooltipRef}
                        className="fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-2xl max-w-xs"
                        style={{
                          top: `${tooltipPosition.top}px`,
                          left: `${tooltipPosition.left}px`,
                        }}
                      >
                        <p className="font-semibold mb-2 border-b border-gray-600 pb-1">
                          Motivo completo:
                        </p>
                        <p className="text-sm">{prestamo.motivo.descripcion}</p>

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
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeEstado(
                        prestamo.estado
                      )}`}
                    >
                      {prestamo.estado.charAt(0).toUpperCase() +
                        prestamo.estado.slice(1)}
                    </span>
                  </td>
                  <td className="p-2">{formatFecha(prestamo.fechaPrestamo)}</td>
                  <td className="p-2">
                    {prestamo.estado === "rechazado" ? (
                      <span className="text-gray-400">No Aplica</span>
                    ) : prestamo.horaConfirmacion ? (
                      <>
                        {formatFecha(prestamo.horaConfirmacion)}
                        <br />
                        <span className="text-xs text-gray-600">
                          {formatHora(prestamo.horaConfirmacion)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Pendiente</span>
                    )}
                  </td>
                  <td className="p-2">
                    {prestamo.estado === "rechazado" ? (
                      <span className="text-gray-400">No Aplica</span>
                    ) : prestamo.horaDevolucion ? (
                      <>
                        {formatFecha(prestamo.horaDevolucion)}
                        <br />
                        <span className="text-xs text-gray-600">
                          {formatHora(prestamo.horaDevolucion)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2 flex justify-center gap-2">
                    <MdVisibility
                      className="h-6 w-6 text-blue-600 cursor-pointer hover:text-blue-800"
                      title="Ver detalles"
                      onClick={() => handleVerDetalle(prestamo)}
                    />
                    {prestamo.estado === "pendiente" && (
                      <MdCancel
                        className="h-6 w-6 text-red-600 cursor-pointer hover:text-red-800"
                        title="Cancelar solicitud"
                        onClick={() => setModalCancelar(prestamo)}
                      />
                    )}
                    {prestamo.estado === "activo" && (
                      <MdAssignmentTurnedIn
                        className="h-6 w-6 text-green-600 cursor-pointer hover:text-green-800"
                        title="Finalizar préstamo"
                        onClick={() => setModalFinalizar(prestamo)}
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No hay préstamos en esta categoría
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {mostrarDetalle && prestamoSeleccionado && (
        <DetallePrestamo
          prestamo={prestamoSeleccionado}
          onClose={() => {
            setMostrarDetalle(false);
            setPrestamoSeleccionado(null);
          }}
        />
      )}

      {/* Modal de cancelación */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">Cancelar Solicitud</h3>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Recurso:</p>
              <p className="font-semibold">{modalCancelar.recurso?.nombre}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Motivo de cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Ej: El docente solicitó cancelar la reserva"
                className="w-full p-2 border rounded-lg text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelar}
                disabled={loading || !motivoCancelacion.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? "Cancelando..." : "Confirmar Cancelación"}
              </button>
              <button
                onClick={() => {
                  setModalCancelar(null);
                  setMotivoCancelacion("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de finalización */}
      {modalFinalizar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-green-600">Finalizar Préstamo</h3>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Recurso:</p>
              <p className="font-semibold">{modalFinalizar.recurso?.nombre}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Observaciones de devolución (opcional):
              </label>
              <textarea
                value={observacionesDevolucion}
                onChange={(e) => setObservacionesDevolucion(e.target.value)}
                placeholder="Ej: Recurso devuelto por el administrador"
                className="w-full p-2 border rounded-lg text-sm"
                rows={3}
              />
            </div>

            <p className="text-sm text-gray-600 mb-4">
              ⏰ Se registrará la hora actual de devolución y el recurso quedará disponible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleFinalizar}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? "Procesando..." : "Confirmar Devolución"}
              </button>
              <button
                onClick={() => {
                  setModalFinalizar(null);
                  setObservacionesDevolucion("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TablaHistorialDocente;