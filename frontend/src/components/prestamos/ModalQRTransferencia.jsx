import { IoClose } from "react-icons/io5";
import { MdDownload, MdChat } from "react-icons/md";
import { toast } from "react-toastify";
import { useState } from "react";

const ModalQRTransferencia = ({ transferencia, qrImage, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleDescargarQR = () => {
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `transferencia-${transferencia.codigoQR}.png`;
    link.click();
    toast.success("QR descargado exitosamente");
  };

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
        onClose();
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

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header - Sticky */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b sticky top-0 bg-white z-10 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            📱 QR de Transferencia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 overflow-y-auto">
          {/* QR Image */}
          <div className="flex justify-center">
            <div className="border-4 border-gray-200 rounded-lg p-3 md:p-4 bg-white">
              <img src={qrImage} alt="QR Transferencia" className="w-48 h-48 md:w-64 md:h-64" />
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📋 Instrucciones
            </p>
            <ol className="text-xs md:text-sm text-gray-700 list-decimal pl-5 space-y-1">
              <li>Envía este QR al docente destino por chat</li>
              <li>El docente destino deberá mostrarle el QR al docente origen</li>
              <li>El docente origen debe escanearlo desde su dispositivo y confirmar la transferencia</li>
              <li>Si confirma, el docente destino recibirá una solicitud de préstamo</li>
            </ol>
          </div>

          {/* Detalles */}
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg text-xs md:text-sm">
            <p className="mb-1">
              <span className="font-semibold">De:</span>{" "}
              <span className="break-words">{transferencia.docenteOrigen.nombreDocente} {transferencia.docenteOrigen.apellidoDocente}</span>
            </p>
            <p className="mb-1">
              <span className="font-semibold">Para:</span>{" "}
              <span className="break-words">{transferencia.docenteDestino.nombreDocente} {transferencia.docenteDestino.apellidoDocente}</span>
            </p>
            <p>
              <span className="font-semibold">Recursos:</span>{" "}
              {transferencia.recursos.length + transferencia.recursosAdicionales.length}
            </p>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="flex gap-2 md:gap-3 p-4 md:p-6 border-t bg-white sticky bottom-0 flex-shrink-0">
          <button
            onClick={handleDescargarQR}
            className="flex-1 flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm md:text-base"
          >
            <MdDownload size={18} />
            <span className="hidden sm:inline">Descargar QR</span>
            <span className="sm:hidden">Descargar</span>
          </button>
          <button
            onClick={handleEnviarPorChat}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm md:text-base disabled:opacity-50"
          >
            <MdChat size={18} />
            <span className="hidden sm:inline">{loading ? "Enviando..." : "Enviar por Chat"}</span>
            <span className="sm:hidden">{loading ? "..." : "Enviar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalQRTransferencia;