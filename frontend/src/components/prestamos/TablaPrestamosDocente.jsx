import { useState, useRef } from "react";
import { MdCheckCircle, MdAssignmentTurnedIn, MdRefresh, MdClear, MdExpandMore, MdExpandLess } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import storePrestamos from "../../context/storePrestamos";
import storeProfile from "../../context/storeProfile";
import { toast } from "react-toastify";
import ModalResponderTransferencia from "./ModalResponderTransferencia";

const TablaPrestamosDocente = ({ prestamos, onRefresh }) => {
  const { confirmarPrestamo, finalizarPrestamo } = storePrestamos();
  const { user } = storeProfile();
  const [loading, setLoading] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(null);
  const [modalDevolver, setModalDevolver] = useState(null);
  const [modalTransferencia, setModalTransferencia] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [observacionesDevolucion, setObservacionesDevolucion] = useState("");

  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // ✅ NUEVOS ESTADOS PARA PAGINACIÓN
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const REGISTROS_INICIALES = 5;

  // ✅ NUEVOS ESTADOS PARA TOOLTIP DE OBSERVACIONES
  const [hoveredObservacion, setHoveredObservacion] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, direction: 'right' });
  const tooltipRef = useRef(null);
  const cellRef = useRef(null);

  const firmaDigital = user?._doc?._id || user?._id;

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      activo: "bg-green-100 text-green-800",
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

  const esTransferencia = (prestamo) => {
    return (
      prestamo.motivo?.tipo === "Transferencia" ||
      prestamo.observaciones?.includes("Transferido por") ||
      prestamo.observaciones?.includes("Código de transferencia:")
    );
  };

  const handleClickConfirmar = (prestamo) => {
    if (esTransferencia(prestamo)) {
      setModalTransferencia(prestamo);
    } else {
      setModalConfirmar(prestamo);
    }
  };

  const handleConfirmar = async (id) => {
    setLoading(true);
    try {
      await confirmarPrestamo(id, true);
      onRefresh();
      setModalConfirmar(null);
    } catch (error) {
      console.error("Error al confirmar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async (id) => {
    if (!motivoRechazo.trim()) {
      toast.error("Debe especificar el motivo del rechazo");
      return;
    }

    setLoading(true);
    try {
      await confirmarPrestamo(id, false, motivoRechazo);
      onRefresh();
      setModalConfirmar(null);
      setMotivoRechazo("");
    } catch (error) {
      console.error("Error al rechazar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async (id) => {
    setLoading(true);
    try {
      await finalizarPrestamo(id, observacionesDevolucion);
      onRefresh();
      setModalDevolver(null);
      setObservacionesDevolucion("");
    } catch (error) {
      console.error("Error al devolver:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN PARA MANEJAR TOOLTIP
  const handleMouseEnter = (prestamoId) => {
    setHoveredObservacion(prestamoId);

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

  const prestamosFiltradosPorFecha = () => {
    if (!fechaDesde && !fechaHasta) return prestamos;

    return prestamos.filter((prestamo) => {
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

  const prestamosFiltrados = prestamosFiltradosPorFecha();

  // ✅ FUNCIÓN PARA OBTENER PRÉSTAMOS A MOSTRAR
  const prestamosMostrados = mostrarTodos
    ? prestamosFiltrados
    : prestamosFiltrados?.slice(0, REGISTROS_INICIALES);

  // ✅ VERIFICAR SI HAY MÁS REGISTROS
  const hayMasRegistros = prestamosFiltrados?.length > REGISTROS_INICIALES;

  return (
    <>
      {/* ✅ HEADER CON DATEPICKERS Y CONTADOR */}
      <div className="bg-black text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">📦 Mis Préstamos Activos</h2>
            <p className="text-xs text-gray-300 mt-1">
              Mostrando {prestamosMostrados?.length || 0} de {prestamosFiltrados?.length || 0} préstamos
            </p>
          </div>

          {/* ✅ DATEPICKERS EN LÍNEA (COMPACTOS) */}
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
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              <MdRefresh size={18} />
              Actualizar
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

      {/* ✅ TABLA PEGADA CON shadow-lg */}
      <div className="overflow-x-auto shadow-lg">
        <table className="w-full table-auto bg-white">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">N°</th>
              <th className="p-2">Recurso</th>
              <th className="p-2">Motivo</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Fecha Préstamo</th>
              <th className="p-2">Observaciones</th>
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
                    {prestamo.recurso?.laboratorio && (
                      <span className="block text-xs text-gray-600">
                        {prestamo.recurso.laboratorio} - {prestamo.recurso.aula}
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <span className="font-medium">{prestamo.motivo?.tipo}</span>
                    {prestamo.motivo?.descripcion && (
                      <span className="block text-xs text-gray-600 mt-1">
                        {prestamo.motivo.descripcion.substring(0, 30)}...
                      </span>
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
                  <td className="p-2">
                    {formatFecha(prestamo.fechaPrestamo)}
                    {prestamo.horaConfirmacion && (
                      <span className="block text-xs text-gray-600 mt-1">
                        Confirmado: {formatHora(prestamo.horaConfirmacion)}
                      </span>
                    )}
                  </td>
                  {/* ✅ TOOLTIP EN OBSERVACIONES */}
                  <td
                    className="p-2 text-left text-sm relative"
                    ref={prestamo._id === hoveredObservacion ? cellRef : null}
                    onMouseEnter={() => {
                      const textoCompleto = prestamo.observaciones || "";
                      const tieneRecursosAdicionales = prestamo.recursosAdicionales?.length > 0;
                      if (textoCompleto.length > 50 || tieneRecursosAdicionales) {
                        handleMouseEnter(prestamo._id);
                      }
                    }}
                    onMouseLeave={() => setHoveredObservacion(null)}
                  >
                    {prestamo.observaciones ? (
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-700 cursor-pointer">
                          {prestamo.observaciones.substring(0, 50)}
                          {prestamo.observaciones.length > 50 && "..."}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                    {prestamo.recursosAdicionales &&
                      prestamo.recursosAdicionales.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-semibold text-blue-600 cursor-pointer">
                            Recursos adicionales:
                          </p>
                          <ul className="text-xs text-gray-600">
                            {prestamo.recursosAdicionales.map((rec) => (
                              <li key={rec._id}>• {rec.nombre}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* ✅ TOOLTIP EMERGENTE */}
                    {hoveredObservacion === prestamo._id && (prestamo.observaciones?.length > 50 || prestamo.recursosAdicionales?.length > 0) && (
                      <div
                        ref={tooltipRef}
                        className="fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-2xl max-w-sm"
                        style={{
                          top: `${tooltipPosition.top}px`,
                          left: `${tooltipPosition.left}px`,
                        }}
                      >
                        {prestamo.observaciones && (
                          <>
                            <p className="font-semibold mb-2 border-b border-gray-600 pb-1">
                              Observaciones completas:
                            </p>
                            <p className="text-sm mb-3 whitespace-pre-line">{prestamo.observaciones}</p>
                          </>
                        )}

                        {prestamo.recursosAdicionales?.length > 0 && (
                          <>
                            <p className="font-semibold mb-2 border-b border-gray-600 pb-1">
                              Recursos adicionales:
                            </p>
                            <ul className="text-sm space-y-1">
                              {prestamo.recursosAdicionales.map((rec) => (
                                <li key={rec._id} className="flex items-start gap-2">
                                  <span>•</span>
                                  <span>{rec.nombre} ({rec.tipo?.toUpperCase()})</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        {/* Flechas direccionales */}
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
                    {prestamo.estado === "pendiente" && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleClickConfirmar(prestamo)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                        >
                          <MdCheckCircle /> Confirmar
                        </button>
                      </div>
                    )}
                    {prestamo.estado === "activo" && (
                      <button
                        onClick={() => setModalDevolver(prestamo)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1 mx-auto"
                      >
                        <MdAssignmentTurnedIn /> Devolver
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  {prestamosFiltrados?.length === 0 && (fechaDesde || fechaHasta)
                    ? "No hay préstamos en el rango de fechas seleccionado"
                    : "No tienes préstamos activos o pendientes"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ...existing modales y resto del código... */}
    </>
  );
};

export default TablaPrestamosDocente;