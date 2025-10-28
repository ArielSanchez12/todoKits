import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdDownload, MdContentCopy } from "react-icons/md";
import { toast } from "react-toastify";
import QRCode from "qrcode";

const DetalleTransferencia = ({ transferencia, onClose }) => {
  const [qrImage, setQrImage] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [urlQR, setUrlQR] = useState("");

  useEffect(() => {
    if (transferencia.codigoQR) {
      generarQR();
    }
  }, [transferencia.codigoQR]);

  const generarQR = async () => {
    setLoadingQR(true);
    try {
      // ✅ Generar URL igual que en el backend
      const url = `${import.meta.env.VITE_FRONTEND_URL}/dashboard/transferencia/${transferencia.codigoQR}`;
      setUrlQR(url);

      // ✅ Generar imagen QR
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });
      setQrImage(qrDataURL);
    } catch (error) {
      console.error("Error al generar QR:", error);
      toast.error("Error al generar código QR");
    } finally {
      setLoadingQR(false);
    }
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

  const handleDescargarQR = () => {
    if (!qrImage) return;
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `transferencia-${transferencia.codigoQR.substring(0, 8)}.png`;
    link.click();
    toast.success("QR descargado exitosamente");
  };

  const handleCopiarURL = () => {
    navigator.clipboard.writeText(urlQR);
    toast.success("URL copiada al portapapeles");
  };

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(transferencia.codigoQR);
    toast.success("Código copiado al portapapeles");
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
              className={`px-4 py-2 rounded-full text-sm font-bold ${getBadgeEstado(
                transferencia.estado
              )}`}
            >
              {getTextoEstado(transferencia.estado)}
            </span>
          </div>

          {/* QR Code y URL */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <p className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📱 Código QR de Transferencia
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Image */}
              <div className="flex flex-col items-center">
                {loadingQR ? (
                  <div className="w-64 h-64 flex items-center justify-center bg-white rounded-lg border-4 border-gray-300">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : qrImage ? (
                  <div className="border-4 border-white rounded-lg shadow-lg">
                    <img
                      src={qrImage}
                      alt="QR Transferencia"
                      className="w-64 h-64"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">QR no disponible</p>
                  </div>
                )}
                {qrImage && (
                  <button
                    onClick={handleDescargarQR}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <MdDownload size={20} />
                    Descargar QR
                  </button>
                )}
              </div>

              {/* URL y Código */}
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

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    🔑 Código de Transferencia
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={transferencia.codigoQR}
                      className="flex-1 text-xs bg-white px-3 py-2 rounded border border-gray-300 font-mono"
                    />
                    <button
                      onClick={handleCopiarCodigo}
                      className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      title="Copiar código"
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
            {/* Docente Origen */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                👤 Docente Origen
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-600">Nombre:</span>
                  <p className="font-semibold">
                    {transferencia.docenteOrigen?.nombreDocente}{" "}
                    {transferencia.docenteOrigen?.apellidoDocente}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Email:</span>
                  <p className="font-semibold text-sm">
                    {transferencia.docenteOrigen?.emailDocente}
                  </p>
                </div>
                {transferencia.firmaOrigen && (
                  <div>
                    <span className="text-xs text-gray-600">Firma Digital:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      ✓ Firmado
                    </p>
                  </div>
                )}
                {transferencia.fechaConfirmacionOrigen && (
                  <div>
                    <span className="text-xs text-gray-600">Confirmado el:</span>
                    <p className="text-xs font-semibold">
                      {formatFecha(transferencia.fechaConfirmacionOrigen)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Docente Destino */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                👤 Docente Destino
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-600">Nombre:</span>
                  <p className="font-semibold">
                    {transferencia.docenteDestino?.nombreDocente}{" "}
                    {transferencia.docenteDestino?.apellidoDocente}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Email:</span>
                  <p className="font-semibold text-sm">
                    {transferencia.docenteDestino?.emailDocente}
                  </p>
                </div>
                {transferencia.firmaDestino && (
                  <div>
                    <span className="text-xs text-gray-600">Firma Digital:</span>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                      ✓ Firmado
                    </p>
                  </div>
                )}
                {transferencia.fechaConfirmacionDestino && (
                  <div>
                    <span className="text-xs text-gray-600">Aceptado el:</span>
                    <p className="text-xs font-semibold">
                      {formatFecha(transferencia.fechaConfirmacionDestino)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recursos Transferidos */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm font-bold text-gray-700 mb-3">
              📦 Recursos Transferidos
            </p>
            <div className="space-y-3">
              {/* Recursos Principales */}
              {transferencia.recursos && transferencia.recursos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Recursos Principales:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {transferencia.recursos.map((rec) => (
                      <span
                        key={rec._id}
                        className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold"
                      >
                        {rec.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recursos Adicionales */}
              {transferencia.recursosAdicionales &&
                transferencia.recursosAdicionales.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Recursos Adicionales:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {transferencia.recursosAdicionales.map((rec) => (
                        <span
                          key={rec._id}
                          className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold"
                        >
                          {rec.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-bold text-gray-700 mb-3">
              ⏰ Registro de Tiempos
            </p>
            <div className="grid md:grid-cols-3 gap-3">
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
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm font-bold text-gray-700 mb-3">
                💬 Observaciones
              </p>
              {transferencia.observacionesOrigen && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-600">
                    Origen:
                  </span>
                  <p className="text-sm text-gray-700">
                    {transferencia.observacionesOrigen}
                  </p>
                </div>
              )}
              {transferencia.observacionesDestino && (
                <div>
                  <span className="text-xs font-semibold text-gray-600">
                    Destino:
                  </span>
                  <p className="text-sm text-gray-700">
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