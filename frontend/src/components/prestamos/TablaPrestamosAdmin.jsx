import { useState } from "react";
import { MdVisibility } from "react-icons/md";
import DetallePrestamo from "./DetallePrestamo";

const TablaPrestamosAdmin = ({ prestamos, onRefresh }) => {
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

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

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full mt-5 table-auto shadow-lg bg-white">
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
            {prestamos && prestamos.length > 0 ? (
              prestamos.map((prestamo, index) => (
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
                      <span className="text-gray-400 italic">No Aplica</span>
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
                      <span className="text-gray-400 italic">No Aplica</span>
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  No hay préstamos registrados
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
    </>
  );
};

export default TablaPrestamosAdmin;