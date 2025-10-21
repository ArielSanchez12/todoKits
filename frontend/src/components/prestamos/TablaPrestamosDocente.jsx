import { useState } from "react";
import { MdCheckCircle, MdCancel, MdAssignmentTurnedIn } from "react-icons/md";
import storePrestamos from "../../context/storePrestamos";
import { toast } from "react-toastify";

const TablaPrestamosDocente = ({ prestamos, onRefresh }) => {
  const { confirmarPrestamo, finalizarPrestamo } = storePrestamos();
  const [loading, setLoading] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(null);
  const [modalDevolver, setModalDevolver] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [observacionesDevolucion, setObservacionesDevolucion] = useState("");

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

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full mt-5 table-auto shadow-lg bg-white">
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
                  <td className="p-2 text-left text-sm">
                    {prestamo.observaciones ? (
                      <div className="max-w-xs">
                        <p className="text-xs text-gray-700">
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
                  </td>
                  <td className="p-2">
                    {prestamo.estado === "pendiente" && (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setModalConfirmar(prestamo)}
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
                  No tienes préstamos activos o pendientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación/rechazo */}
      {modalConfirmar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Confirmar Préstamo</h3>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Recurso:</p>
              <p className="font-semibold">{modalConfirmar.recurso?.nombre}</p>
              <p className="text-xs text-gray-600 mt-2">
                {modalConfirmar.recurso?.laboratorio &&
                  `${modalConfirmar.recurso.laboratorio} - ${modalConfirmar.recurso.aula}`}
              </p>
            </div>

            <p className="mb-4 text-sm text-gray-700">
              ¿Deseas confirmar este préstamo? Se registrará la hora actual de
              confirmación.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                O rechazar el préstamo:
              </label>
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
                onClick={() => {
                  setModalConfirmar(null);
                  setMotivoRechazo("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de devolución */}
      {modalDevolver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Devolver Recurso</h3>
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Recurso:</p>
              <p className="font-semibold">{modalDevolver.recurso?.nombre}</p>
              <p className="text-xs text-gray-600 mt-1">
                Confirmado: {formatFecha(modalDevolver.horaConfirmacion)} a las{" "}
                {formatHora(modalDevolver.horaConfirmacion)}
              </p>
            </div>

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
              Se registrará la hora actual de devolución y el recurso quedará
              disponible nuevamente.
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
                onClick={() => {
                  setModalDevolver(null);
                  setObservacionesDevolucion("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TablaPrestamosDocente;