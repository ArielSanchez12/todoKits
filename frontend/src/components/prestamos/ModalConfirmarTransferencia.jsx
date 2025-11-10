import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import storeTransferencias from "../../context/storeTransferencias";
import storeProfile from "../../context/storeProfile";

const ModalConfirmarTransferencia = ({ transferencia, onClose, onSuccess }) => {
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const { confirmarTransferenciaOrigen } = storeTransferencias();
  const { user } = storeProfile();

  const firmaDigital = user?._doc?._id || user?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmarTransferenciaOrigen(transferencia.codigoQR, {
        observaciones,
        firma: firmaDigital
      });
      toast.success("Transferencia confirmada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al confirmar transferencia:", error);
      toast.error("Error al confirmar la transferencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Confirmar Transferencia de Recursos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Detalles */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              📋 Detalles de la Transferencia
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Transferir a:</span>{" "}
                {transferencia.docenteDestino.nombreDocente}{" "}
                {transferencia.docenteDestino.apellidoDocente}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {transferencia.docenteDestino.emailDocente}
              </p>
            </div>
          </div>

          {/* Recursos (caja morada separada) */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-300 space-y-4">
            <p className="text-sm font-semibold text-purple-800">
              📦 Recursos a Transferir
            </p>

            {/* Principales */}
            <div>
              <p className="text-xs font-semibold text-purple-700 mb-2">
                Recursos Principales
              </p>
              {transferencia.recursos && transferencia.recursos.length > 0 ? (
                <div className="space-y-2">
                  {transferencia.recursos.map((recurso) => (
                    <div
                      key={recurso._id}
                      className="bg-white p-3 rounded border border-purple-100 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {recurso.nombre}
                        </span>
                        <span className="text-xs text-gray-600">
                          {recurso.tipo?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No hay recursos principales
                </p>
              )}
            </div>

            {/* Adicionales */}
            <div>
              <p className="text-xs font-semibold text-purple-700 mb-2">
                Recursos Adicionales
              </p>
              {transferencia.recursosAdicionales &&
                transferencia.recursosAdicionales.length > 0 ? (
                <div className="space-y-2">
                  {transferencia.recursosAdicionales.map((recurso) => (
                    <div
                      key={recurso._id}
                      className="bg-white p-3 rounded border border-purple-100 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {recurso.nombre}
                        </span>
                        <span className="text-xs text-gray-600">
                          {recurso.tipo?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No hay recursos adicionales
                </p>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observaciones del Estado de los Recursos
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Describe el estado actual de los recursos..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
            />
          </div>

          {/* Firma Digital */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✍️ Firma Digital (Tu ID)
            </label>
            <div className="font-mono text-xs bg-white p-2 rounded border border-gray-300 break-all">
              {firmaDigital}
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Al confirmar, cedes estos recursos al docente destino. El otro docente deberá aceptar la transferencia.
            </p>
          </div>

          {/* Botones (responsive) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? "Confirmando..." : "Confirmar Transferencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalConfirmarTransferencia;