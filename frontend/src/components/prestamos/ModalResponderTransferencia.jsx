import { useState } from "react";
import { toast } from "react-toastify";
import storePrestamos from "../../context/storePrestamos";
import storeProfile from "../../context/storeProfile";

const ModalResponderTransferencia = ({ transferencia, onClose, onSuccess }) => {
  const [procesando, setProcesando] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const { confirmarPrestamo } = storePrestamos();
  const { user } = storeProfile();

  const prestamoId = transferencia._id;

  const handleAceptar = async () => {
    setProcesando(true);

    try {
      console.log(
        "✅ Aceptando transferencia - Confirmando préstamo:",
        prestamoId
      );

      // Confirmar el préstamo (que ya está pendiente en la tabla)
      await confirmarPrestamo(prestamoId, {
        confirmar: true,
      });

      toast.success("✅ Transferencia aceptada exitosamente");

      // Cerrar modal y remover notificación
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
    if (
      !window.confirm(
        "¿Estás seguro de que deseas rechazar esta transferencia?"
      )
    ) {
      return;
    }

    setProcesando(true);

    try {
      console.log("❌ Rechazando transferencia - Préstamo:", prestamoId);

      // Rechazar el préstamo
      await confirmarPrestamo(prestamoId, {
        confirmar: false,
        motivoRechazo: "Rechazada por el docente",
      });

      toast.warning("⚠️ Transferencia rechazada");

      // Cerrar modal y remover notificación
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
        {/* Header */}
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

        {/* Información del Docente Origen */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            📤 De (Docente Origen)
          </p>
          <div>
            <p className="font-bold text-lg">
              {transferencia.docenteOrigen?.nombreDocente}{" "}
              {transferencia.docenteOrigen?.apellidoDocente}
            </p>
            <p className="text-sm text-gray-600">
              {transferencia.docenteOrigen?.emailDocente}
            </p>
          </div>
        </div>

        {/* Información de Recursos */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm font-semibold text-purple-800 mb-3">
            📦 Recursos a Transferir
          </p>
          <div className="space-y-2">
            {transferencia.recursos?.map((recurso) => (
              <div
                key={recurso._id}
                className="bg-white p-3 rounded border border-purple-100"
              >
                <p className="font-bold text-lg">{recurso.nombre}</p>
                <p className="text-sm text-gray-600">
                  Tipo: {recurso.tipo?.toUpperCase()}
                </p>
              </div>
            ))}

            {transferencia.recursosAdicionales?.length > 0 && (
              <>
                <p className="text-sm font-semibold text-purple-800 mt-3">
                  Recursos Adicionales:
                </p>
                {transferencia.recursosAdicionales.map((recurso) => (
                  <div
                    key={recurso._id}
                    className="bg-white p-3 rounded border border-purple-100"
                  >
                    <p className="font-bold">{recurso.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {recurso.tipo?.toUpperCase()}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Observaciones de la Transferencia */}
        {transferencia.observacionesOrigen && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-800 mb-2">
              📝 Observaciones del Origen
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {transferencia.observacionesOrigen}
            </p>
          </div>
        )}

        {/* Observaciones Adicionales */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observaciones Adicionales (Opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Agregar observaciones si lo deseas..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
            disabled={procesando}
          />
        </div>

        {/* Información de Firma */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            ✍️ Firma Digital (Tu ID)
          </p>
          <div className="font-mono text-sm bg-white p-2 rounded border border-gray-300 break-all">
            {user?._doc?._id || user?._id}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleRechazar}
            disabled={procesando}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? "Procesando..." : "❌ Rechazar"}
          </button>
          <button
            onClick={handleAceptar}
            disabled={procesando}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? "Procesando..." : "✅ Aceptar"}
          </button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">ℹ️ Nota:</span> Al aceptar, esta
            transferencia aparecerá en tu tabla de préstamos activos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalResponderTransferencia;