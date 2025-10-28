import { useEffect, useState } from "react";
import { MdVisibility, MdQrCodeScanner, MdRefresh } from "react-icons/md";
import storeTransferencias from "../../context/storeTransferencias";
import { toast } from "react-toastify";
import DetallePrestamo from "./DetallePrestamo";

const TablaTransferencias = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [transferenciaSel, setTransferenciaSel] = useState(null);
  const { fetchTransferencias } = storeTransferencias();

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

  const getBadgeEstado = (estado) => {
    const colors = {
      pendiente_origen: "bg-yellow-100 text-yellow-800",
      confirmado_origen: "bg-blue-100 text-blue-800",
      aceptado_destino: "bg-green-100 text-green-800",
      rechazado: "bg-red-100 text-red-800",
      finalizado: "bg-purple-100 text-purple-800",
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

  const handleVerDetalle = (transferencia) => {
    setTransferenciaSel(transferencia);
    setMostrarDetalle(true);
  };

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
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-black text-white">
          <h2 className="text-2xl font-bold">📋 Historial de Transferencias</h2>
          <button
            onClick={cargarTransferencias}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <MdRefresh size={20} />
            Actualizar
          </button>
        </div>

        {/* Tabla */}
        {transferencias.length === 0 ? (
          <div className="p-8 text-center">
            <MdQrCodeScanner className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No hay transferencias registradas</p>
            <p className="text-gray-500 text-sm mt-2">
              Las transferencias de recursos aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    N°
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Fecha Solicitud
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Docente Origen
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Docente Destino
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Recursos
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Estado
                  </th>
                  <th className="p-4 text-center text-xs font-bold text-gray-700 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transferencias.map((transferencia, index) => (
                  <tr
                    key={transferencia._id}
                    className="hover:bg-gray-50 transition-colors"
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
                        {/* Recursos principales (azul) */}
                        {transferencia.recursos?.map((rec) => (
                          <span
                            key={rec._id}
                            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold inline-block"
                          >
                            {rec.nombre}
                          </span>
                        ))}
                        {/* Recursos adicionales (amarillo) */}
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
                      <button
                        onClick={() => handleVerDetalle(transferencia)}
                        className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-2"
                        title="Ver detalles"
                      >
                        <MdVisibility size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con resumen */}
        {transferencias.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-700">
                Total de transferencias:{" "}
                <span className="font-bold text-gray-900">
                  {transferencias.length}
                </span>
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">
                    Finalizadas:{" "}
                    <span className="font-bold text-green-600">
                      {transferencias.filter((t) => t.estado === "finalizado")
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
                        transferencias.filter(
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
                      {transferencias.filter((t) => t.estado === "rechazado")
                        .length}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {mostrarDetalle && transferenciaSel && (
        <DetallePrestamo
          prestamo={transferenciaSel}
          onClose={() => {
            setMostrarDetalle(false);
            setTransferenciaSel(null);
          }}
        />
      )}
    </>
  );
};

export default TablaTransferencias;