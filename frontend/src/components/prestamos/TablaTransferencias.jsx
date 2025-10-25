import { useEffect, useState } from "react";
import { MdVisibility, MdQrCodeScanner, MdRefresh } from "react-icons/md";
import storeTransferencias from "../../context/storeTransferencias";
import { toast } from "react-toastify";

const TablaTransferencias = () => {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const badges = {
      pendiente_origen: {
        color: "bg-yellow-100 text-yellow-800",
        texto: "Pendiente Origen",
      },
      confirmado_origen: {
        color: "bg-blue-100 text-blue-800",
        texto: "Confirmado Origen",
      },
      aceptado_destino: {
        color: "bg-green-100 text-green-800",
        texto: "Aceptado",
      },
      rechazado: {
        color: "bg-red-100 text-red-800",
        texto: "Rechazado",
      },
      finalizado: {
        color: "bg-purple-100 text-purple-800",
        texto: "Finalizado",
      },
    };
    return badges[estado] || badges.pendiente_origen;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (transferencias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <MdQrCodeScanner className="mx-auto text-gray-400 mb-4" size={64} />
        <p className="text-gray-600 text-lg">No hay transferencias registradas</p>
        <p className="text-gray-500 text-sm mt-2">
          Las transferencias de recursos aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-2xl font-bold text-gray-800">
          📋 Historial de Transferencias
        </h2>
        <button
          onClick={cargarTransferencias}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdRefresh size={20} />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fecha Solicitud
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Docente Origen
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Docente Destino
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Recursos
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transferencias.map((transferencia) => {
              const badge = getBadgeEstado(transferencia.estado);
              return (
                <tr
                  key={transferencia._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatFecha(transferencia.fechaSolicitud)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <p className="font-semibold">
                      {transferencia.docenteOrigen?.nombreDocente}{" "}
                      {transferencia.docenteOrigen?.apellidoDocente}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <p className="font-semibold">
                      {transferencia.docenteDestino?.nombreDocente}{" "}
                      {transferencia.docenteDestino?.apellidoDocente}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex flex-col gap-1">
                      {transferencia.recursos?.map((rec) => (
                        <span key={rec._id} className="text-xs bg-blue-100 px-2 py-1 rounded inline-block">
                          {rec.nombre}
                        </span>
                      ))}
                      {transferencia.recursosAdicionales?.map((rec) => (
                        <span key={rec._id} className="text-xs bg-yellow-100 px-2 py-1 rounded inline-block">
                          {rec.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
                    >
                      {badge.texto}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Ver detalles"
                    >
                      <MdVisibility size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con resumen */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>
            Total de transferencias: <span className="font-semibold">{transferencias.length}</span>
          </p>
          <div className="flex gap-4">
            <span>
              Finalizadas:{" "}
              <span className="font-semibold text-green-600">
                {transferencias.filter((t) => t.estado === "finalizado").length}
              </span>
            </span>
            <span>
              Pendientes:{" "}
              <span className="font-semibold text-yellow-600">
                {
                  transferencias.filter(
                    (t) =>
                      t.estado === "pendiente_origen" ||
                      t.estado === "confirmado_origen"
                  ).length
                }
              </span>
            </span>
            <span>
              Rechazadas:{" "}
              <span className="font-semibold text-red-600">
                {transferencias.filter((t) => t.estado === "rechazado").length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaTransferencias;