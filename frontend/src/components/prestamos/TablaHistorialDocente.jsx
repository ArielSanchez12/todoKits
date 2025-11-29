import { useState, useRef } from "react";
import { MdVisibility, MdCancel, MdAssignmentTurnedIn, MdRefresh, MdClear, MdExpandMore, MdExpandLess } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DetallePrestamo from "./DetallePrestamo";
import storePrestamos from "../../context/storePrestamos";
import { toast } from "react-toastify";

const TablaHistorialDocente = ({ prestamos, onRefresh, docenteId, esDocente = false }) => {
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
  const [prestamosLocal, setPrestamosLocal] = useState(prestamos);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // ESTADOS PARA PAGINACIÓN
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const REGISTROS_INICIALES = 5;

  const { cancelarPrestamoAdmin, finalizarPrestamoAdmin } = storePrestamos();

  const handleRefreshPrestamos = async () => {
    if (!docenteId) {
      toast.error("No se puede actualizar: ID de docente no disponible");
      return;
    }

    setLoadingRefresh(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("auth-token"));
      const headers = {
        Authorization: `Bearer ${storedUser.state.token}`,
      };

      let prestamosDocente = [];

      if (esDocente) {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/docente/prestamos/historial`,
          { headers }
        );
        const data = await response.json();
        prestamosDocente = Array.isArray(data) ? data : [];
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamos`,
          { headers }
        );
        const data = await response.json();
        prestamosDocente = Array.isArray(data) ? data.filter(p => p.docente?._id === docenteId) : [];
      }

      setPrestamosLocal(prestamosDocente);
      toast.success("Préstamos actualizados");

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error al recargar préstamos:", error);
      toast.error("Error al actualizar préstamos");
    } finally {
      setLoadingRefresh(false);
    }
  };

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
      await handleRefreshPrestamos();
    } catch (error) {
      console.error("Error al cancelar:", error);
      toast.error("Error al cancelar el préstamo");
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
      await handleRefreshPrestamos();
    } catch (error) {
      console.error("Error al finalizar:", error);
      toast.error("Error al finalizar el préstamo");
    } finally {
      setLoading(false);
    }
  };

  const prestamosFiltradosPorFecha = () => {
    if (!fechaDesde && !fechaHasta) return prestamosLocal;

    return prestamosLocal.filter((prestamo) => {
      const fechaPrestamo = new Date(prestamo.fechaPrestamo);
      fechaPrestamo.setHours(0, 0, 0, 0);

      if (fechaDesde && fechaHasta) {
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        desde.setHours(0, 0, 0, 0);
        hasta.setHours(23, 59, 59, 999);
        return fechaPrestamo >= desde && fechaPrestamo <= hasta;
      }

      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        desde.setHours(0, 0, 0, 0);
        return fechaPrestamo >= desde;
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        return fechaPrestamo <= hasta;
      }

      return true;
    });
  };

  const limpiarFechas = () => {
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const prestamosPorEstado = filtro === "todos"
    ? prestamosFiltradosPorFecha()
    : prestamosFiltradosPorFecha()?.filter((p) => p.estado === filtro);

  const contadores = {
    activo: prestamosLocal?.filter((p) => p.estado === "activo").length || 0,
    pendiente: prestamosLocal?.filter((p) => p.estado === "pendiente").length || 0,
    finalizado: prestamosLocal?.filter((p) => p.estado === "finalizado").length || 0,
    rechazado: prestamosLocal?.filter((p) => p.estado === "rechazado").length || 0,
    todos: prestamosLocal?.length || 0,
  };

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

  // FUNCIÓN PARA OBTENER PRÉSTAMOS A MOSTRAR
  const prestamosMostrados = mostrarTodos
    ? prestamosPorEstado
    : prestamosPorEstado?.slice(0, REGISTROS_INICIALES);

  // VERIFICAR SI HAY MÁS REGISTROS
  const hayMasRegistros = prestamosPorEstado?.length > REGISTROS_INICIALES;

  return (
    <>
      {/* FILTROS DE ESTADO */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          {
            key: "todos", label: "Todos"
          },
          ...(esDocente ? [] : [ //Solo mostrar activo/pendiente si NO es docente
            { key: "activo", label: "Activos" },
            { key: "pendiente", label: "Pendientes" },
          ]),
          { key: "finalizado", label: "Finalizados" },
          { key: "rechazado", label: "Rechazados" },
        ].map((tipo) => (
          <button
            key={tipo.key}
            onClick={() => setFiltro(tipo.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${filtro === tipo.key
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
          >
            {tipo.label}
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filtro === tipo.key
                ? "bg-white text-blue-600"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              {contadores[tipo.key]}
            </span>
          </button>
        ))}
      </div>

      {/* HEADER CON CONTADOR */}
      <div className="bg-black text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">
              {esDocente ? "📚 Mi Historial" : "📚 Historial del Docente"}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              Mostrando {prestamosMostrados?.length || 0} de {prestamosPorEstado?.length || 0} préstamos
            </p>
          </div>

          {/* DATEPICKERS Y BOTÓN ACTUALIZAR */}
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-300">Desde:</span>
              <DatePicker
                selected={fechaDesde}
                onChange={(date) => setFechaDesde(date)}
                dateFormat="dd/MM/yyyy"
                className="px-2 py-1 text-sm rounded border border-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
                isClearable
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-300">Hasta:</span>
              <DatePicker
                selected={fechaHasta}
                onChange={(date) => setFechaHasta(date)}
                dateFormat="dd/MM/yyyy"
                className="px-2 py-1 text-sm rounded border border-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
                isClearable
              />
            </div>

            {(fechaDesde || fechaHasta) && (
              <button
                onClick={limpiarFechas}
                className="p-1 text-gray-300 hover:text-white transition-colors"
                title="Limpiar filtros de fecha"
              >
                <MdClear size={18} />
              </button>
            )}

            <button
              onClick={handleRefreshPrestamos}
              disabled={loadingRefresh}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
            >
              <MdRefresh size={18} className={loadingRefresh ? "animate-spin" : ""} />
              {loadingRefresh ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {(fechaDesde || fechaHasta) && (
          <div className="text-xs text-blue-300 mt-2">
            📅 Filtrando:
            {fechaDesde && ` desde ${formatFecha(fechaDesde)}`}
            {fechaHasta && ` hasta ${formatFecha(fechaHasta)}`}
          </div>
        )}
      </div>

      {/* TABLA PEGADA AL HEADER */}
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
            {prestamosMostrados && prestamosMostrados.length > 0 ? (
              prestamosMostrados.map((prestamo, index) => (
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
                    {prestamo.estado === "rechazado" || prestamo.estado === "cancelado" ? (
                      <span className="text-gray-400">No aplica</span>
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
                    {prestamo.estado === "rechazado" || prestamo.estado === "cancelado" ? (
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
                    {!esDocente && (
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  {prestamosPorEstado?.length === 0 && (fechaDesde || fechaHasta)
                    ? "No hay préstamos en el rango de fechas seleccionado"
                    : esDocente
                      ? "No tienes préstamos finalizados"
                      : "No hay préstamos en esta categoría"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOTONES DE MOSTRAR MÁS/COLAPSAR */}
      {hayMasRegistros && (
        <div className="bg-white p-4 rounded-b-lg shadow-lg border-t border-gray-200 flex justify-center">
          {!mostrarTodos ? (
            <button
              onClick={() => setMostrarTodos(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <MdExpandMore size={20} />
              Mostrar Todos ({prestamosPorEstado.length - REGISTROS_INICIALES} más)
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

      {/* Modales (sin cambios) */}
      {mostrarDetalle && prestamoSeleccionado && (
        <DetallePrestamo
          prestamo={prestamoSeleccionado}
          onClose={() => {
            setMostrarDetalle(false);
            setPrestamoSeleccionado(null);
          }}
        />
      )}

      {modalCancelar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-red-600">Cancelar Solicitud</h3>

              {/* Recurso principal completo */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📦 Recurso Principal</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-600">Nombre:</span>
                    <p className="font-semibold">{modalCancelar.recurso?.nombre || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Tipo:</span>
                    <p className="font-semibold">{modalCancelar.recurso?.tipo?.toUpperCase() || "N/A"}</p>
                  </div>
                  {modalCancelar.recurso?.laboratorio && (
                    <>
                      <div>
                        <span className="text-xs text-gray-600">Laboratorio:</span>
                        <p className="font-semibold">{modalCancelar.recurso.laboratorio}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Aula:</span>
                        <p className="font-semibold">{modalCancelar.recurso.aula}</p>
                      </div>
                    </>
                  )}
                  {Array.isArray(modalCancelar.recurso?.contenido) &&
                    modalCancelar.recurso.contenido.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-xs text-gray-600">Contenido:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {modalCancelar.recurso.contenido.map((item, i) => (
                            <li key={i} className="text-xs">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              {/* Recursos adicionales completos */}
              {Array.isArray(modalCancelar.recursosAdicionales) &&
                modalCancelar.recursosAdicionales.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">📦 Recursos Adicionales</p>
                    <div className="space-y-3">
                      {modalCancelar.recursosAdicionales.map((rec) => (
                        <div key={rec._id} className="bg-white border border-yellow-200 rounded p-3">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[11px] text-gray-600">Nombre:</span>
                              <p className="font-semibold">{rec.nombre}</p>
                            </div>
                            <div>
                              <span className="text-[11px] text-gray-600">Tipo:</span>
                              <p className="font-semibold">{rec.tipo?.toUpperCase() || "N/A"}</p>
                            </div>
                            {rec.laboratorio && (
                              <>
                                <div>
                                  <span className="text-[11px] text-gray-600">Laboratorio:</span>
                                  <p className="font-semibold">{rec.laboratorio}</p>
                                </div>
                                <div>
                                  <span className="text-[11px] text-gray-600">Aula:</span>
                                  <p className="font-semibold">{rec.aula}</p>
                                </div>
                              </>
                            )}
                            {Array.isArray(rec.contenido) && rec.contenido.length > 0 && (
                              <div className="col-span-2">
                                <span className="text-[11px] text-gray-600">Contenido:</span>
                                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                  {rec.contenido.map((c, idx) => (
                                    <li key={idx} className="text-[11px]">{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
        </div>
      )}

      {modalFinalizar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-green-600">Finalizar Préstamo</h3>

              {/* Recurso principal completo */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📦 Recurso Principal</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-600">Nombre:</span>
                    <p className="font-semibold">{modalFinalizar.recurso?.nombre || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Tipo:</span>
                    <p className="font-semibold">{modalFinalizar.recurso?.tipo?.toUpperCase() || "N/A"}</p>
                  </div>
                  {modalFinalizar.recurso?.laboratorio && (
                    <>
                      <div>
                        <span className="text-xs text-gray-600">Laboratorio:</span>
                        <p className="font-semibold">{modalFinalizar.recurso.laboratorio}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Aula:</span>
                        <p className="font-semibold">{modalFinalizar.recurso.aula}</p>
                      </div>
                    </>
                  )}
                  {Array.isArray(modalFinalizar.recurso?.contenido) &&
                    modalFinalizar.recurso.contenido.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-xs text-gray-600">Contenido:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {modalFinalizar.recurso.contenido.map((item, i) => (
                            <li key={i} className="text-xs">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                {modalFinalizar.horaConfirmacion && (
                  <p className="text-xs text-gray-600 mt-3">
                    Confirmado: {formatFecha(modalFinalizar.horaConfirmacion)} a las {formatHora(modalFinalizar.horaConfirmacion)}
                  </p>
                )}
              </div>

              {/* Recursos adicionales completos */}
              {Array.isArray(modalFinalizar.recursosAdicionales) &&
                modalFinalizar.recursosAdicionales.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">📦 Recursos Adicionales</p>
                    <div className="space-y-3">
                      {modalFinalizar.recursosAdicionales.map((rec) => (
                        <div key={rec._id} className="bg-white border border-yellow-200 rounded p-3">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[11px] text-gray-600">Nombre:</span>
                              <p className="font-semibold">{rec.nombre}</p>
                            </div>
                            <div>
                              <span className="text-[11px] text-gray-600">Tipo:</span>
                              <p className="font-semibold">{rec.tipo?.toUpperCase() || "N/A"}</p>
                            </div>
                            {rec.laboratorio && (
                              <>
                                <div>
                                  <span className="text-[11px] text-gray-600">Laboratorio:</span>
                                  <p className="font-semibold">{rec.laboratorio}</p>
                                </div>
                                <div>
                                  <span className="text-[11px] text-gray-600">Aula:</span>
                                  <p className="font-semibold">{rec.aula}</p>
                                </div>
                              </>
                            )}
                            {Array.isArray(rec.contenido) && rec.contenido.length > 0 && (
                              <div className="col-span-2">
                                <span className="text-[11px] text-gray-600">Contenido:</span>
                                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                  {rec.contenido.map((c, idx) => (
                                    <li key={idx} className="text-[11px]">{c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
        </div>
      )}
    </>
  );
};

export default TablaHistorialDocente;