import { useState } from "react";
import { MdVisibility, MdTransferWithinAStation, MdRefresh, MdClear, MdExpandMore, MdExpandLess } from "react-icons/md";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DetallePrestamo from "./DetallePrestamo";
import ModalTransferirRecurso from "./ModalTransferirRecurso";
import ModalQRTransferencia from "./ModalQRTransferencia";

const TablaPrestamosAdmin = ({ prestamos, onRefresh, onSolicitarTransferencia, docentes }) => {
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  // ESTADOS PARA PAGINACIÓN
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const REGISTROS_INICIALES = 5;

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

  const handleVerDetalle = (prestamo) => {
    setPrestamoSeleccionado(prestamo);
    setMostrarDetalle(true);
  };

  const handleAbrirTransferencia = (prestamo) => {
    if (!Array.isArray(docentes) || docentes.length === 0) {
      toast.error("No hay docentes disponibles. Por favor recarga la página.");
      return;
    }

    setPrestamoSeleccionado(prestamo);
    setModalTransferir(true);
  };

  const handleSuccessTransferencia = (resultado) => {
    setQRData(resultado);
    setModalTransferir(false);
    setModalQR(true);
  };

  const handleEnviarPorChat = () => {
    toast.info("Funcionalidad de envío por chat próximamente");
  };

  const prestamosFiltrados = prestamosFiltradosPorFecha();

  // FUNCIÓN PARA OBTENER PRÉSTAMOS A MOSTRAR
  const prestamosMostrados = mostrarTodos 
    ? prestamosFiltrados 
    : prestamosFiltrados?.slice(0, REGISTROS_INICIALES);

  // VERIFICAR SI HAY MÁS REGISTROS
  const hayMasRegistros = prestamosFiltrados?.length > REGISTROS_INICIALES;

  return (
    <>
      {/* HEADER CON CONTADOR */}
      <div className="bg-black text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">📋 Gestión de Préstamos</h2>
            <p className="text-xs text-gray-300 mt-1">
              Mostrando {prestamosMostrados?.length || 0} de {prestamosFiltrados?.length || 0} préstamos
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
              onClick={onRefresh}
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

      {/* TABLA PEGADA CON shadow-lg */}
      <div className="overflow-x-auto shadow-lg">
        <table className="w-full table-auto bg-white">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2">N°</th>
              <th className="p-2">Recurso</th>
              <th className="p-2">Docente</th>
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
                  <td className="p-2">
                    {prestamo.docente?.nombreDocente}{" "}
                    {prestamo.docente?.apellidoDocente}
                    <br />
                    <span className="text-xs text-gray-600">
                      {prestamo.docente?.emailDocente}
                    </span>
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
                    {prestamo.estado === "activo" && (
                      <button
                        onClick={() => handleAbrirTransferencia(prestamo)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Solicitar transferencia"
                      >
                        <MdTransferWithinAStation size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  {prestamosFiltrados?.length === 0 && (fechaDesde || fechaHasta)
                    ? "No hay préstamos en el rango de fechas seleccionado"
                    : "No hay préstamos registrados"}
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

      {/* Modal de transferencia con key y docentes */}
      {modalTransferir && prestamoSeleccionado && Array.isArray(docentes) && docentes.length > 0 && (
        <ModalTransferirRecurso
          key={modalKey}
          prestamo={prestamoSeleccionado}
          docentes={docentes}
          onClose={() => {
            setModalTransferir(false);
            setPrestamoSeleccionado(null);
          }}
          onSuccess={handleSuccessTransferencia}
        />
      )}

      {/* Modal de QR */}
      {modalQR && qrData && (
        <ModalQRTransferencia
          transferencia={qrData.transferencia}
          qrImage={qrData.qrImage}
          onClose={() => {
            setModalQR(false);
            setQRData(null);
          }}
          onEnviarPorChat={handleEnviarPorChat}
        />
      )}
    </>
  );
};

export default TablaPrestamosAdmin;