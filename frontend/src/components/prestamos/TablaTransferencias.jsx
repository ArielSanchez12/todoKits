import { useEffect, useState } from "react";
import { MdVisibility, MdQrCodeScanner, MdRefresh, MdCancel, MdClear, MdExpandMore, MdExpandLess } from "react-icons/md";
import storeTransferencias from "../../context/storeTransferencias";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DetalleTransferencia from "./DetalleTransferencia";
import ModalCancelarTransferencia from "./ModalCancelarTransferencia";

const TablaTransferencias = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [transferenciaSel, setTransferenciaSel] = useState(null);
  const { fetchTransferencias } = storeTransferencias();
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // ESTADOS PARA PAGINACIÓN
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const REGISTROS_INICIALES = 5;

  const cargarTransferencias = async () => {
    setLoading(true);
    try {
      const data = await fetchTransferencias();
      setTransferencias(data);
    } catch (error) {
      console.error("Error al cargar transferencias:", error);
      toast.error("Error al cargar transferencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTransferencias();
  }, []);

  const handleCancelar = (transferencia) => {
    setTransferenciaSel(transferencia);
    setMostrarModalCancelar(true);
  };

  const puedeCancelar = (transferencia) => {
    return ["pendiente_origen", "confirmado_origen"].includes(transferencia.estado);
  };

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente_origen: "bg-yellow-100 text-yellow-800",
      confirmado_origen: "bg-blue-100 text-blue-800",
      aceptado_destino: "bg-green-100 text-green-800",
      rechazado: "bg-red-100 text-red-800",
      finalizado: "bg-purple-100 text-purple-800",
      cancelado: "bg-gray-100 text-gray-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getTextoEstado = (estado) => {
    const textos = {
      pendiente_origen: "Pendiente Origen",
      confirmado_origen: "Confirmado Origen",
      aceptado_destino: "Aceptado",
      rechazado: "Rechazado",
      finalizado: "Finalizado",
      cancelado: "Cancelado"
    };
    return textos[estado] || estado;
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

  const transferenciasFiltradosPorFecha = () => {
    if (!fechaDesde && !fechaHasta) return transferencias;

    return transferencias.filter((transferencia) => {
      const fechaTransferencia = new Date(transferencia.fechaSolicitud);
      fechaTransferencia.setHours(0, 0, 0, 0);

      if (fechaDesde && fechaHasta) {
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        desde.setHours(0, 0, 0, 0);
        hasta.setHoras(23, 59, 59, 999);
        return fechaTransferencia >= desde && fechaTransferencia <= hasta;
      }

      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        desde.setHours(0, 0, 0, 0);
        return fechaTransferencia >= desde;
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        return fechaTransferencia <= hasta;
      }

      return true;
    });
  };

  const limpiarFechas = () => {
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const handleVerDetalle = (transferencia) => {
    setTransferenciaSel(transferencia);
    setMostrarDetalle(true);
  };

  const transferenciasFiltradas = transferenciasFiltradosPorFecha();

  // FUNCIÓN PARA OBTENER TRANSFERENCIAS A MOSTRAR
  const transferenciasMostradas = mostrarTodos 
    ? transferenciasFiltradas 
    : transferenciasFiltradas?.slice(0, REGISTROS_INICIALES);

  // VERIFICAR SI HAY MÁS REGISTROS
  const hayMasRegistros = transferenciasFiltradas?.length > REGISTROS_INICIALES;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* HEADER CON CONTADOR */}
        <div className="bg-black text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold">📊 Historial de Transferencias</h2>
              <p className="text-xs text-gray-300 mt-1">
                Mostrando {transferenciasMostradas?.length || 0} de {transferenciasFiltradas?.length || 0} transferencias
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
                onClick={cargarTransferencias}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold text-sm"
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

        {/* Tabla */}
        {transferenciasFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <MdQrCodeScanner className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">
              {(fechaDesde || fechaHasta)
                ? "No hay transferencias en el rango de fechas seleccionado"
                : "No hay transferencias registradas"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Las transferencias de recursos aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto shadow-lg">
              <table className="w-full table-auto bg-white">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-4 text-left font-bold">N°</th>
                    <th className="p-4 text-left font-bold">Fecha Solicitud</th>
                    <th className="p-4 text-left font-bold">Docente Origen</th>
                    <th className="p-4 text-left font-bold">Docente Destino</th>
                    <th className="p-4 text-left font-bold">Recursos</th>
                    <th className="p-4 text-left font-bold">Estado</th>
                    <th className="p-4 text-center font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transferenciasMostradas.map((transferencia, index) => (
                    <tr
                      key={transferencia._id}
                      className="hover:bg-gray-300 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-700 font-semibold">
                        {index + 1}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {formatFecha(transferencia.fechaSolicitud)}
                        {transferencia.fechaSolicitud && <br />}
                        <span className="text-xs text-gray-600">
                          {formatHora(transferencia.fechaSolicitud)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <p className="font-semibold">
                          {transferencia.docenteOrigen?.nombreDocente}{" "}
                          {transferencia.docenteOrigen?.apellidoDocente}
                        </p>
                        <span className="text-xs text-gray-600">
                          {transferencia.docenteOrigen?.emailDocente}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        <p className="font-semibold">
                          {transferencia.docenteDestino?.nombreDocente}{" "}
                          {transferencia.docenteDestino?.apellidoDocente}
                        </p>
                        <span className="text-xs text-gray-600">
                          {transferencia.docenteDestino?.emailDocente}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex flex-col gap-2">
                          {transferencia.recursos?.map((rec) => (
                            <span
                              key={rec._id}
                              className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold inline-block"
                            >
                              {rec.nombre}
                            </span>
                          ))}
                          {transferencia.recursosAdicionales?.map((rec) => (
                            <span
                              key={rec._id}
                              className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-semibold inline-block"
                            >
                              {rec.nombre}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeEstado(
                            transferencia.estado
                          )}`}
                        >
                          {getTextoEstado(transferencia.estado)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerDetalle(transferencia)}
                            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                            title="Ver detalles"
                          >
                            <MdVisibility size={20} />
                          </button>
                          
                          {puedeCancelar(transferencia) && (
                            <button
                              onClick={() => handleCancelar(transferencia)}
                              className="text-red-600 hover:text-red-800 transition-colors inline-flex items-center gap-1"
                              title="Cancelar transferencia"
                            >
                              <MdCancel size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOTONES DE MOSTRAR MÁS/COLAPSAR */}
            {hayMasRegistros && (
              <div className="bg-white p-4 border-t border-gray-200 flex justify-center">
                {!mostrarTodos ? (
                  <button
                    onClick={() => setMostrarTodos(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <MdExpandMore size={20} />
                    Mostrar Todos ({transferenciasFiltradas.length - REGISTROS_INICIALES} más)
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
        )}

        {/* Footer con resumen */}
        {transferenciasFiltradas.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center text-sm flex-wrap gap-4">
              <p className="text-gray-700">
                Total de transferencias:{" "}
                <span className="font-bold text-gray-900">
                  {transferenciasFiltradas.length}
                </span>
              </p>
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">
                    Finalizadas:{" "}
                    <span className="font-bold text-green-600">
                      {transferenciasFiltradas.filter((t) => t.estado === "finalizado")
                        .length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-700">
                    Pendientes:{" "}
                    <span className="font-bold text-yellow-600">
                      {
                        transferenciasFiltradas.filter(
                          (t) =>
                            t.estado === "pendiente_origen" ||
                            t.estado === "confirmado_origen"
                        ).length
                      }
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-700">
                    Rechazadas:{" "}
                    <span className="font-bold text-red-600">
                      {transferenciasFiltradas.filter((t) => t.estado === "rechazado")
                        .length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-gray-700">
                    Canceladas:{" "}
                    <span className="font-bold text-gray-600">
                      {transferenciasFiltradas.filter((t) => t.estado === "cancelado").length}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {mostrarDetalle && transferenciaSel && (
        <DetalleTransferencia
          transferencia={transferenciaSel}
          onClose={() => {
            setMostrarDetalle(false);
            setTransferenciaSel(null);
          }}
        />
      )}

      {mostrarModalCancelar && transferenciaSel && (
        <ModalCancelarTransferencia
          transferencia={transferenciaSel}
          onClose={() => {
            setMostrarModalCancelar(false);
            setTransferenciaSel(null);
          }}
          onSuccess={() => {
            cargarTransferencias();
          }}
        />
      )}
    </>
  );
};

export default TablaTransferencias;