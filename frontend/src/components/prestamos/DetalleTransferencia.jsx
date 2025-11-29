import { IoClose } from "react-icons/io5";
import { MdDownload, MdContentCopy, MdChat } from "react-icons/md";
import { toast } from "react-toastify";
import { useState } from "react";

const DetalleTransferencia = ({ transferencia, onClose }) => {
  const [loading, setLoading] = useState(false);

  // URL quemada
  const urlQR = `https://kitsfrontend-zeta.vercel.app/dashboard/transferencia/${transferencia.codigoQR}`;

  // API de QR Server para generar imagen
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
      cancelado: "bg-gray-100 text-gray-800",
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
      cancelado: "Cancelado",
    };
    return textos[estado] || estado;
  };

  const esEstadoInactivo = (estado) => {
    return estado === "rechazado" || estado === "cancelado";
  };

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

  // Enviar por chat (copiada de ModalQRTransferencia)
  const handleEnviarPorChat = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("auth-token"));
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/chat/enviar-transferencia`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser.state.token}`,
          },
          body: JSON.stringify({
            codigoTransferencia: transferencia.codigoQR,
            docenteDestinoId: transferencia.docenteDestino._id
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Transferencia enviada por chat al docente destino");
      } else {
        toast.error(data.msg || "Error al enviar por chat");
      }
    } catch (error) {
      console.error("Error al enviar transferencia por chat:", error);
      toast.error("Error al enviar por chat");
    } finally {
      setLoading(false);
    }
  };

  // Validar si la transferencia está caducada
  const esTransferenciaCaducada = () => {
    const estadosInvalidos = ["cancelado", "rechazado", "finalizado"];
    return estadosInvalidos.includes(transferencia.estado);
  };

  const puedeEnviarPorChat = !esTransferenciaCaducada();

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

            {/* Alerta si está caducada */}
            {esTransferenciaCaducada() && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 font-semibold">
                  Esta transferencia ya no está activa ({transferencia.estado})
                </p>
                <p className="text-xs text-red-600 mt-1">
                  El código QR y los enlaces asociados ya no son válidos.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Imagen QR */}
              <div className="flex flex-col items-center">
                <div className={`border-4 border-white rounded-lg shadow-lg bg-white p-2 ${esTransferenciaCaducada() ? 'opacity-40 grayscale' : ''}`}>
                  <img
                    src={qrImageUrl}
                    alt="QR Transferencia"
                    className="w-64 h-64"
                  />
                </div>
                <div className="mt-4 flex gap-2 w-full max-w-xs">
                  <button
                    onClick={handleDescargarQR}
                    disabled={esTransferenciaCaducada()}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${esTransferenciaCaducada()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    title={esTransferenciaCaducada() ? "QR caducado" : "Descargar QR"}
                  >
                    <MdDownload size={20} />
                    Descargar
                  </button>
                  <button
                    onClick={handleEnviarPorChat}
                    disabled={loading || !puedeEnviarPorChat}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${!puedeEnviarPorChat
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    title={!puedeEnviarPorChat ? "Transferencia caducada" : "Enviar por chat"}
                  >
                    <MdChat size={20} />
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </div>

              {/* URLs */}
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
                      disabled={esTransferenciaCaducada()}
                      className={`flex-1 text-xs px-3 py-2 rounded border font-mono break-all ${esTransferenciaCaducada()
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : 'bg-white border-gray-300'
                        }`}
                    />
                    <button
                      onClick={handleCopiarURL}
                      disabled={esTransferenciaCaducada()}
                      className={`p-2 rounded transition-colors flex-shrink-0 ${esTransferenciaCaducada()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      title={esTransferenciaCaducada() ? "URL caducada" : "Copiar URL"}
                    >
                      <MdContentCopy size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    🖼️ URL del Código QR
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={qrImageUrl}
                      disabled={esTransferenciaCaducada()}
                      className={`flex-1 text-xs px-3 py-2 rounded border font-mono break-all ${esTransferenciaCaducada()
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : 'bg-white border-gray-300'
                        }`}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrImageUrl);
                        toast.success("URL del QR copiada");
                      }}
                      disabled={esTransferenciaCaducada()}
                      className={`p-2 rounded transition-colors flex-shrink-0 ${esTransferenciaCaducada()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      title={esTransferenciaCaducada() ? "URL caducada" : "Copiar URL del QR"}
                    >
                      <MdContentCopy size={18} />
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded border ${esTransferenciaCaducada()
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
                  }`}>
                  <p className={`text-xs ${esTransferenciaCaducada() ? 'text-red-800' : 'text-yellow-800'}`}>
                    <strong>💡 Instrucciones:</strong>{" "}
                    {esTransferenciaCaducada()
                      ? "Esta transferencia ya no está activa y no puede ser procesada."
                      : "El docente origen debe escanear este QR para confirmar la transferencia. Puedes reenviar el mensaje por chat si es necesario."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Docentes */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Docente Origen */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                👤 Docente Origen
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600">Nombre:</span>
                  <p className="font-semibold break-words">
                    {transferencia.docenteOrigen?.nombreDocente}{" "}
                    {transferencia.docenteOrigen?.apellidoDocente}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Email:</span>
                  <p className="font-semibold break-all text-xs">{transferencia.docenteOrigen?.emailDocente}</p>
                </div>
                {transferencia.docenteOrigen?.celularDocente && (
                  <div>
                    <span className="text-xs text-gray-600">Celular:</span>
                    <p className="font-semibold break-words">{transferencia.docenteOrigen.celularDocente}</p>
                  </div>
                )}
                {transferencia.firmaOrigen && (
                  <div>
                    <span className="text-xs text-gray-600">Firma Digital:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border break-all overflow-hidden max-h-12">
                      {transferencia.firmaOrigen}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Docente Destino */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                👤 Docente Destino
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600">Nombre:</span>
                  <p className="font-semibold break-words">
                    {transferencia.docenteDestino?.nombreDocente}{" "}
                    {transferencia.docenteDestino?.apellidoDocente}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Email:</span>
                  <p className="font-semibold break-all text-xs">{transferencia.docenteDestino?.emailDocente}</p>
                </div>
                {transferencia.docenteDestino?.celularDocente && (
                  <div>
                    <span className="text-xs text-gray-600">Celular:</span>
                    <p className="font-semibold break-words">{transferencia.docenteDestino.celularDocente}</p>
                  </div>
                )}
                {transferencia.firmaDestino && (
                  <div>
                    <span className="text-xs text-gray-600">Firma Digital:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border break-all overflow-hidden max-h-12">
                      {transferencia.firmaDestino}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recursos Principales */}
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
                        <p className="font-semibold break-words">{rec.nombre || "N/A"}</p>
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
                            <p className="font-semibold break-words">{rec.laboratorio}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Aula:</span>
                            <p className="font-semibold break-words">{rec.aula}</p>
                          </div>
                        </>
                      )}
                      {rec.contenido && rec.contenido.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-xs text-gray-600">Contenido:</span>
                          <ul className="list-disc pl-5 mt-1">
                            {rec.contenido.map((item, i) => (
                              <li key={i} className="text-sm break-words">
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

          {/* Recursos Adicionales */}
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
                          <p className="font-semibold break-words">{rec.nombre}</p>
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
                              <p className="font-semibold break-words">{rec.laboratorio}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">Aula:</span>
                              <p className="font-semibold break-words">{rec.aula}</p>
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
                                <li key={i} className="text-sm break-words">
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
                <p className="font-semibold text-sm break-words">
                  {formatFecha(transferencia.fechaSolicitud)}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">
                  Confirmación Origen:
                </span>
                <p className="text-sm break-words">
                  {esEstadoInactivo(transferencia.estado) ? (
                    <span className="text-gray-400">No aplica</span>
                  ) : transferencia.fechaConfirmacionOrigen ? (
                    formatFecha(transferencia.fechaConfirmacionOrigen)
                  ) : (
                    <span className="text-gray-400">Pendiente</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-600">
                  Confirmación Destino:
                </span>
                <p className="text-sm break-words">
                  {esEstadoInactivo(transferencia.estado) ? (
                    <span className="text-gray-400">No aplica</span>
                  ) : transferencia.fechaConfirmacionDestino ? (
                    formatFecha(transferencia.fechaConfirmacionDestino)
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </p>
              </div>
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
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                      {transferencia.observacionesOrigen}
                    </p>
                  </div>
                )}
                {transferencia.observacionesDestino && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600">
                      Destino:
                    </span>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
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