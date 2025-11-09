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

  // ✅ Tooltip de Observaciones (refs y estado)
  const [hoveredObservacion, setHoveredObservacion] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, direction: "bottom" });
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

  // ✅ Posicionar el tooltip hacia abajo, con scroll si es muy alto
  const handleMouseEnter = (prestamoId) => {
    setHoveredObservacion(prestamoId);

    setTimeout(() => {
      if (tooltipRef.current && cellRef.current) {
        const cellRect = cellRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Por defecto crece hacia abajo
        let top = cellRect.bottom + 8;
        // Alinear a la izquierda de la celda, pero evitar que se salga por los lados
        let left = Math.min(
          Math.max(16, cellRect.left),
          windowWidth - tooltipRect.width - 16
        );

        // Si se sale por abajo, limitamos la altura (el contenedor ya tiene overflow-y-auto)
        if (top + tooltipRect.height > windowHeight - 16) {
          top = Math.min(top, windowHeight - tooltipRect.height - 16);
        }

        setTooltipPosition({ top, left, direction: "bottom" });
      }
    }, 0);
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
                  {/* ✅ Observaciones con truncado a 15 y tooltip con todo */}
                  <td
                    className="p-2 text-left text-sm relative"
                    ref={prestamo._id === hoveredObservacion ? cellRef : null}
                    onMouseEnter={() => {
                      const textoCompleto = prestamo.observaciones || "";
                      const tieneRecursosAdicionales =
                        prestamo.recursosAdicionales?.length > 0;
                      if (textoCompleto.length > 15 || tieneRecursosAdicionales) {
                        handleMouseEnter(prestamo._id);
                      }
                    }}
                    onMouseLeave={() => setHoveredObservacion(null)}
                  >
                    {prestamo.observaciones ? (
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-700 cursor-pointer">
                          {prestamo.observaciones.substring(0, 25)}
                          {prestamo.observaciones.length > 25 && "..."}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}

                    {prestamo.recursosAdicionales &&
                      prestamo.recursosAdicionales.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-semibold text-blue-600">
                            Recursos adicionales:
                          </p>
                          <ul className="text-xs text-gray-600">
                            {prestamo.recursosAdicionales.map((rec) => (
                              <li key={rec._id}>• {rec.nombre}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* ✅ Tooltip: crece hacia abajo, muestra todo el texto y lista completa */}
                    {hoveredObservacion === prestamo._id &&
                      (prestamo.observaciones?.length > 25 ||
                        prestamo.recursosAdicionales?.length > 0) && (
                        <div
                          ref={tooltipRef}
                          className="fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-2xl w-80 max-w-md max-h-[60vh] overflow-y-auto"
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
                              <p className="text-sm mb-3 whitespace-pre-line">
                                {prestamo.observaciones}
                              </p>
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
                                    <span>
                                      {rec.nombre} {rec.tipo ? `(${rec.tipo.toUpperCase()})` : ""}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}

                          {/* Flecha hacia arriba (tooltip debajo de la celda) */}
                          <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-800"></div>
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

      {/* ✅ BOTONES DE MOSTRAR MÁS / COLAPSAR */}
      {hayMasRegistros && (
        <div className="bg-white p-4 rounded-b-lg shadow-lg border-t border-gray-200 flex justify-center">
          {!mostrarTodos ? (
            <button
              onClick={() => setMostrarTodos(true)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <MdExpandMore size={20} />
              Mostrar Todos ({prestamosFiltrados.length - REGISTROS_INICIALES} más)
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
      {modalTransferencia && (
        <ModalResponderTransferencia
          transferencia={modalTransferencia}
          onClose={() => setModalTransferencia(null)}
          onSuccess={() => {
            setModalTransferencia(null);
            onRefresh();
          }}
        />
      )}

      {modalConfirmar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Confirmar Préstamo</h3>

              {/* Recurso principal completo */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📦 Recurso Principal</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-600">Nombre:</span>
                    <p className="font-semibold">{modalConfirmar.recurso?.nombre || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Tipo:</span>
                    <p className="font-semibold">{modalConfirmar.recurso?.tipo?.toUpperCase() || "N/A"}</p>
                  </div>
                  {modalConfirmar.recurso?.laboratorio && (
                    <>
                      <div>
                        <span className="text-xs text-gray-600">Laboratorio:</span>
                        <p className="font-semibold">{modalConfirmar.recurso.laboratorio}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Aula:</span>
                        <p className="font-semibold">{modalConfirmar.recurso.aula}</p>
                      </div>
                    </>
                  )}
                  {Array.isArray(modalConfirmar.recurso?.contenido) &&
                    modalConfirmar.recurso.contenido.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-xs text-gray-600">Contenido:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {modalConfirmar.recurso.contenido.map((item, i) => (
                            <li key={i} className="text-xs">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              {/* Recursos adicionales completos */}
              {Array.isArray(modalConfirmar.recursosAdicionales) &&
                modalConfirmar.recursosAdicionales.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">📦 Recursos Adicionales</p>
                    <div className="space-y-3">
                      {modalConfirmar.recursosAdicionales.map((rec) => (
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

              <p className="mb-4 text-sm text-gray-700">
                ¿Deseas confirmar este préstamo? Se registrará la hora actual de confirmación.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">O rechazar el préstamo:</label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Motivo del rechazo (obligatorio si rechaza)"
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirmar(modalConfirmar._id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </button>
                <button
                  onClick={() => handleRechazar(modalConfirmar._id)}
                  disabled={loading || !motivoRechazo.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => { setModalConfirmar(null); setMotivoRechazo(""); }}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalDevolver && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Devolver Recurso</h3>

              {/* Recurso principal completo */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📦 Recurso Principal</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-600">Nombre:</span>
                    <p className="font-semibold">{modalDevolver.recurso?.nombre || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Tipo:</span>
                    <p className="font-semibold">{modalDevolver.recurso?.tipo?.toUpperCase() || "N/A"}</p>
                  </div>
                  {modalDevolver.recurso?.laboratorio && (
                    <>
                      <div>
                        <span className="text-xs text-gray-600">Laboratorio:</span>
                        <p className="font-semibold">{modalDevolver.recurso.laboratorio}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Aula:</span>
                        <p className="font-semibold">{modalDevolver.recurso.aula}</p>
                      </div>
                    </>
                  )}
                  {Array.isArray(modalDevolver.recurso?.contenido) &&
                    modalDevolver.recurso.contenido.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-xs text-gray-600">Contenido:</span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {modalDevolver.recurso.contenido.map((item, i) => (
                            <li key={i} className="text-xs">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Confirmado: {formatFecha(modalDevolver.horaConfirmacion)} a las {formatHora(modalDevolver.horaConfirmacion)}
                </p>
              </div>

              {/* Recursos adicionales completos */}
              {Array.isArray(modalDevolver.recursosAdicionales) &&
                modalDevolver.recursosAdicionales.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">📦 Recursos Adicionales</p>
                    <div className="space-y-3">
                      {modalDevolver.recursosAdicionales.map((rec) => (
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
                  placeholder="Ej: Todo en orden, sin novedades"
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                ⏰ Se registrará la hora actual de devolución y el recurso quedará disponible nuevamente.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDevolver(modalDevolver._id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Procesando..." : "Confirmar Devolución"}
                </button>
                <button
                  onClick={() => { setModalDevolver(null); setObservacionesDevolucion(""); }}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TablaPrestamosDocente;