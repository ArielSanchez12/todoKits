import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import storeTransferencias from "../../context/storeTransferencias";
import { toast } from "react-toastify";

const ModalCancelarTransferencia = ({ transferencia, onClose, onSuccess }) => {
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [loading, setLoading] = useState(false);
  const { cancelarTransferencia } = storeTransferencias();

  const handleCancelar = async () => {
    if (!motivoCancelacion.trim()) {
      toast.error("Por favor ingresa un motivo de cancelación");
      return;
    }

    setLoading(true);
    try {
      const resultado = await cancelarTransferencia(
        transferencia.codigoQR,
        motivoCancelacion
      );

      toast.success(resultado.msg || "Transferencia cancelada exitosamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al cancelar:", error);
      toast.error(error.message || "Error al cancelar la transferencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header - Sticky */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b bg-red-50 sticky top-0 z-10 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-red-600 flex items-center gap-2">
            <MdCancel size={20} className="md:w-6 md:h-6" />
            Cancelar Transferencia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            disabled={loading}
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4 flex-1 overflow-y-auto">
          {/* Información de la transferencia */}
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              <strong>Código:</strong>{" "}
              <span className="break-all">
                {transferencia.codigoQR.substring(0, 8)}...
              </span>
            </p>
            <p className="text-xs md:text-sm text-gray-600 mb-2">
              <strong>Destino:</strong>{" "}
              <span className="break-words">
                {transferencia.docenteDestino?.nombreDocente}{" "}
                {transferencia.docenteDestino?.apellidoDocente}
              </span>
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              <strong>Estado:</strong>{" "}
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold inline-block mt-1">
                {transferencia.estado === "pendiente_origen"
                  ? "Pendiente Origen"
                  : "Confirmado Origen"}
              </span>
            </p>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4">
            <p className="text-xs md:text-sm text-yellow-800 font-semibold">
              <strong>⚠️ Advertencia:</strong>
            </p>
            <ul className="list-disc pl-5 mt-2 text-xs md:text-sm text-yellow-700 space-y-0.5">
              <li>El código QR quedará inhabilitado</li>
              <li>El préstamo original permanecerá activo</li>
              <li>Esta acción no se puede deshacer</li>
            </ul>
          </div>

          {/* Motivo de cancelación */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Motivo de Cancelación *
            </label>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Explica por qué deseas cancelar esta transferencia..."
              className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-xs md:text-sm"
              rows={3}
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {motivoCancelacion.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="flex justify-end gap-2 md:gap-3 p-4 md:p-6 border-t bg-gray-50 sticky bottom-0 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 md:px-6 py-2 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm md:text-base"
            disabled={loading}
          >
            No, Volver
          </button>
          <button
            onClick={handleCancelar}
            className="px-3 md:px-6 py-2 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2 text-sm md:text-base"
            disabled={loading || !motivoCancelacion.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Cancelando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <MdCancel size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Sí, Cancelar</span>
                <span className="sm:hidden">Cancelar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCancelarTransferencia;