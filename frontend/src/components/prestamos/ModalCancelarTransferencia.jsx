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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-red-50">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <MdCancel size={24} />
            Cancelar Transferencia
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Información de la transferencia */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Código:</strong> {transferencia.codigoQR.substring(0, 8)}...
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Destino:</strong>{" "}
              {transferencia.docenteDestino?.nombreDocente}{" "}
              {transferencia.docenteDestino?.apellidoDocente}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Estado Actual:</strong>{" "}
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                {transferencia.estado === "pendiente_origen"
                  ? "Pendiente Origen"
                  : "Confirmado Origen"}
              </span>
            </p>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Advertencia:</strong> Al cancelar esta transferencia:
            </p>
            <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700 space-y-1">
              <li>El código QR quedará inhabilitado</li>
              <li>El docente destino será notificado</li>
              <li>El préstamo original permanecerá activo contigo</li>
              <li>Esta acción no se puede deshacer</li>
            </ul>
          </div>

          {/* Motivo de cancelación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo de Cancelación *
            </label>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Explica por qué deseas cancelar esta transferencia..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {motivoCancelacion.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            disabled={loading}
          >
            No, Volver
          </button>
          <button
            onClick={handleCancelar}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading || !motivoCancelacion.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Cancelando...
              </>
            ) : (
              <>
                <MdCancel size={20} />
                Sí, Cancelar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCancelarTransferencia;