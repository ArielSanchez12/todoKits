import { useState } from "react";
import { toast } from "react-toastify";
import storePrestamos from "../../context/storePrestamos";
import storeProfile from "../../context/storeProfile";

const ModalResponderTransferencia = ({ transferencia, onClose, onSuccess }) => {
  const [procesando, setProcesando] = useState(false);
  const { confirmarPrestamo } = storePrestamos();
  const { user } = storeProfile();

  const prestamoId = transferencia._id;
  const firmaDigital = user?._doc?._id || user?._id;

  const handleAceptar = async () => {
    setProcesando(true);

    try {
      console.log("✅ Aceptando transferencia - Confirmando préstamo:", prestamoId);

      await confirmarPrestamo(prestamoId, {
        confirmar: true,
        firma: firmaDigital,
      });

      toast.success("✅ Transferencia aceptada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Error al aceptar:", error);
      toast.error(error.message || "Error al aceptar la transferencia");
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!window.confirm("¿Estás seguro de que deseas rechazar esta transferencia?")) {
      return;
    }

    setProcesando(true);

    try {
      console.log("❌ Rechazando transferencia - Préstamo:", prestamoId);

      await confirmarPrestamo(prestamoId, {
        confirmar: false,
        motivoRechazo: "Rechazada por el docente",
        firma: firmaDigital,
      });

      toast.warning("⚠️ Transferencia rechazada");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ Error al rechazar:", error);
      toast.error(error.message || "Error al rechazar la transferencia");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            📤 Solicitud de Transferencia
          </h2>
          <button
            onClick={onClose}
            disabled={procesando}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Información completa de la transferencia */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-800 mb-2">📤 Transferido por:</p>
          <p className="font-bold text-lg">
            {transferencia.observaciones?.match(/Transferido por: (.+)/)?.[1] || "Docente"}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm font-semibold text-purple-800 mb-3">📦 Recurso Principal</p>
          <div className="bg-white p-3 rounded border border-purple-100">
            <p className="font-bold text-lg">{transferencia.recurso?.nombre}</p>
            <p className="text-sm text-gray-600">
              Tipo: {transferencia.recurso?.tipo?.toUpperCase()}
            </p>
          </div>

          {transferencia.recursosAdicionales?.length > 0 && (
            <>
              <p className="text-sm font-semibold text-purple-800 mt-3">Recursos Adicionales:</p>
              {transferencia.recursosAdicionales.map((recurso) => (
                <div key={recurso._id} className="bg-white p-3 rounded border border-purple-100 mt-2">
                  <p className="font-bold">{recurso.nombre}</p>
                  <p className="text-sm text-gray-600">{recurso.tipo?.toUpperCase()}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {transferencia.observaciones && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-800 mb-2">📝 Información de la Transferencia</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{transferencia.observaciones}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">✍️ Tu Firma Digital</p>
          <div className="font-mono text-sm bg-white p-2 rounded border border-gray-300 break-all">
            {firmaDigital}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleRechazar}
            disabled={procesando}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50"
          >
            {procesando ? "Procesando..." : "❌ Rechazar"}
          </button>
          <button
            onClick={handleAceptar}
            disabled={procesando}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
          >
            {procesando ? "Procesando..." : "✅ Aceptar"}
          </button>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">ℹ️ Nota:</span> Al aceptar, estos recursos pasarán a tu cargo de forma activa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalResponderTransferencia;