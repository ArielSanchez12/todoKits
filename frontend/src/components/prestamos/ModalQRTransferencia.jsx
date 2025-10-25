import { IoClose } from "react-icons/io5";
import { MdDownload, MdChat } from "react-icons/md";
import { toast } from "react-toastify";

const ModalQRTransferencia = ({ transferencia, qrImage, onClose, onEnviarPorChat }) => {
  const handleDescargarQR = () => {
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `transferencia-${transferencia.codigoQR}.png`;
    link.click();
    toast.success("QR descargado exitosamente");
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            QR de Transferencia Generado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* QR Image */}
          <div className="flex justify-center">
            <div className="border-4 border-gray-200 rounded-lg p-4">
              <img src={qrImage} alt="QR Transferencia" className="w-64 h-64" />
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📋 Instrucciones
            </p>
            <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
              <li>Envía este QR al docente por chat</li>
              <li>El docente debe escanearlo desde su dispositivo</li>
              <li>Confirmar la transferencia de recursos</li>
              <li>El docente destino recibirá la notificación</li>
            </ol>
          </div>

          {/* Detalles */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p>
              <span className="font-semibold">De:</span>{" "}
              {transferencia.docenteOrigen.nombreDocente}{" "}
              {transferencia.docenteOrigen.apellidoDocente}
            </p>
            <p>
              <span className="font-semibold">Para:</span>{" "}
              {transferencia.docenteDestino.nombreDocente}{" "}
              {transferencia.docenteDestino.apellidoDocente}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Recursos:</span>{" "}
              {transferencia.recursos.length + transferencia.recursosAdicionales.length}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleDescargarQR}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              <MdDownload size={20} />
              Descargar QR
            </button>
            <button
              onClick={onEnviarPorChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <MdChat size={20} />
              Enviar por Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalQRTransferencia;