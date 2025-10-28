import { IoClose } from "react-icons/io5";
import { MdDownload, MdContentCopy } from "react-icons/md";
import { toast } from "react-toastify";

const DetalleTransferencia = ({ transferencia, onClose }) => {
  // ✅ CORRECCIÓN 1: URL quemada como solicitaste
  const urlQR = `https://kitsfrontend-zeta.vercel.app/dashboard/transferencia/${transferencia.codigoQR}`;
  
  // ✅ CORRECCIÓN 2: Usar API de QR Server para generar imagen
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(urlQR)}`;

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
      aceptado_destino: "Aceptado Destino",
      rechazado: "Rechazado",
      finalizado: "Finalizado",
    };
    return textos[estado] || estado;
  };

  // ✅ CORRECCIÓN 3: Función de descarga igual a ModalQRTransferencia
  const handleDescargarQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `transferencia-${transferencia.codigoQR.substring(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("QR descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar QR:", error);
      toast.error("Error al descargar QR");
    }
  };

  const handleCopiarURL = () => {
    navigator.clipboard.writeText(urlQR);
    toast.success("URL copiada al portapapeles");
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            🔄 Detalle de Transferencia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600">Estado:</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getBadgeEstado(
                transferencia.estado
              )}`}
            >
              {getTextoEstado(transferencia.estado)}
            </span>
          </div>

          {/* QR Code */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <p className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📱 Código QR de Transferencia
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Imagen QR */}
              <div className="flex flex-col items-center">
                <div className="border-4 border-white rounded-lg shadow-lg bg-white p-2">
                  <img
                    src={qrImageUrl}
                    alt="QR Transferencia"
                    className="w-64 h-64"
                  />
                </div>
                <button
                  onClick={handleDescargarQR}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <MdDownload size={20} />
                  Descargar QR
                </button>
              </div>

              {/* URL */}
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    🔗 URL de Transferencia
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={urlQR}
                      className="flex-1 text-xs bg-white px-3 py-2 rounded border border-gray-300 font-mono"
                    />
                    <button
                      onClick={handleCopiarURL}
                      className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      title="Copiar URL"
                    >
                      <MdContentCopy size={18} />
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>💡 Instrucciones:</strong> El docente origen debe
                    escanear este QR para confirmar la transferencia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Docentes */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* ✅ CORRECCIÓN 4: Docente Origen - estructura igual a DetallePrestamo */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                👤 Docente Origen
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600">Nombre:</span>
                  <p className="font-semibold">
                    {transferencia.docenteOrigen?.nombreDocente}{" "}
                    {transferencia.docenteOrigen?.apellidoDocente}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Email:</span>
                  <p className="font-semibold">{transferencia.docenteOrigen?.emailDocente}</p>
                </div>
                {transferencia.docenteOrigen?.celularDocente && (
                  <div>
                    <span className="text-xs text-gray-600">Celular:</span>
                    <p className="font-semibold">{transferencia.docenteOrigen.celularDocente}</p>
                  </div>
                )}
                {transferencia.firmaOrigen && (
                  <div>
                    <span className="text-xs text-gray-600">Firma Digital:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      {transferencia.firmaOrigen.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ CORRECCIÓN 4: Docente Destino - estructura igual a DetallePrestamo */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                👤 Docente Destino
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600">Nombre:</span>
                  <p className="font-semibold">
                    {transferencia.docenteDestino?.nombreDocente}{" "}
                    {transferencia.docenteDestino?.apellidoDocente}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Email:</span>
                  <p className="font-semibold">{transferencia.docenteDestino?.emailDocente}</p>
                </div>
                {transferencia.docenteDestino?.celularDocente && (
                  <div>
                    <span className="text-xs text-gray-600">Celular:</span>
                    <p className="font-semibold">{transferencia.docenteDestino.celularDocente}</p>
                  </div>
                )}
                {transferencia.firmaDestino && (
                  <div>
                    <span className="text-xs text-gray-600">Firma Digital:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      {transferencia.firmaDestino.substring(0, 20)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ CORRECCIÓN 5: Recursos Principales - estructura EXACTA de DetallePrestamo */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              📦 Recursos Principales
            </p>
            {transferencia.recursos && transferencia.recursos.length > 0 ? (
              <div className="space-y-3">
                {transferencia.recursos.map((rec) => (
                  <div
                    key={rec._id}
                    className="bg-white p-3 rounded-lg border border-blue-200"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-600">Nombre:</span>
                        <p className="font-semibold">{rec.nombre || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Tipo:</span>
                        <p className="font-semibold">
                          {rec.tipo?.toUpperCase() || "N/A"}
                        </p>
                      </div>
                      {rec.laboratorio && (
                        <>
                          <div>
                            <span className="text-xs text-gray-600">Laboratorio:</span>
                            <p className="font-semibold">{rec.laboratorio}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Aula:</span>
                            <p className="font-semibold">{rec.aula}</p>
                          </div>
                        </>
                      )}
                      {rec.contenido && rec.contenido.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-xs text-gray-600">Contenido:</span>
                          <ul className="list-disc pl-5 mt-1">
                            {rec.contenido.map((item, i) => (
                              <li key={i} className="text-sm">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay recursos principales</p>
            )}
          </div>

          {/* ✅ CORRECCIÓN 5: Recursos Adicionales - estructura EXACTA de DetallePrestamo */}
          {transferencia.recursosAdicionales &&
            transferencia.recursosAdicionales.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  📦 Recursos Adicionales Detectados
                </p>
                <div className="space-y-3">
                  {transferencia.recursosAdicionales.map((rec) => (
                    <div
                      key={rec._id}
                      className="bg-white p-3 rounded-lg border border-yellow-200"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-600">Nombre:</span>
                          <p className="font-semibold">{rec.nombre}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Tipo:</span>
                          <p className="font-semibold">
                            {rec.tipo?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                        {rec.laboratorio && (
                          <>
                            <div>
                              <span className="text-xs text-gray-600">
                                Laboratorio:
                              </span>
                              <p className="font-semibold">{rec.laboratorio}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">Aula:</span>
                              <p className="font-semibold">{rec.aula}</p>
                            </div>
                          </>
                        )}
                        {rec.contenido && rec.contenido.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-xs text-gray-600">
                              Contenido:
                            </span>
                            <ul className="list-disc pl-5 mt-1">
                              {rec.contenido.map((item, i) => (
                                <li key={i} className="text-sm">
                                  {item}
                                </li>
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

          {/* Fechas */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ⏰ Registro de Tiempos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-600">Fecha Solicitud:</span>
                <p className="font-semibold text-sm">
                  {formatFecha(transferencia.fechaSolicitud)}
                </p>
              </div>
              {transferencia.fechaConfirmacionOrigen && (
                <div>
                  <span className="text-xs text-gray-600">
                    Confirmación Origen:
                  </span>
                  <p className="font-semibold text-sm">
                    {formatFecha(transferencia.fechaConfirmacionOrigen)}
                  </p>
                </div>
              )}
              {transferencia.fechaConfirmacionDestino && (
                <div>
                  <span className="text-xs text-gray-600">
                    Confirmación Destino:
                  </span>
                  <p className="font-semibold text-sm">
                    {formatFecha(transferencia.fechaConfirmacionDestino)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {(transferencia.observacionesOrigen ||
            transferencia.observacionesDestino) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                💬 Observaciones
              </p>
              {transferencia.observacionesOrigen && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-600">
                    Origen:
                  </span>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {transferencia.observacionesOrigen}
                  </p>
                </div>
              )}
              {transferencia.observacionesDestino && (
                <div>
                  <span className="text-xs font-semibold text-gray-600">
                    Destino:
                  </span>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {transferencia.observacionesDestino}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botón Cerrar */}
          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleTransferencia;