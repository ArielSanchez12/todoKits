import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import storeTransferencias from "../../context/storeTransferencias";
import storePrestamos from "../../context/storePrestamos";
import storeProfile from "../../context/storeProfile";

const ModalResponderTransferencia = ({ transferencia, onClose, onSuccess }) => {
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const { responderTransferenciaDestino } = storeTransferencias();
  const { confirmarPrestamo } = storePrestamos();
  const { user } = storeProfile();

  const firmaDigital = user?._doc?._id || user?._id;

  // ✅ DETECTAR si es un préstamo o una transferencia completa
  const esPrestamoTransferencia = !transferencia.docenteOrigen;
  const prestamoId = transferencia._id;

  // ✅ Extraer datos según el tipo
  const recursos = esPrestamoTransferencia
    ? [transferencia.recurso]
    : transferencia.recursos;

  const recursosAdicionales = esPrestamoTransferencia
    ? (transferencia.recursosAdicionales || [])
    : (transferencia.recursosAdicionales || []);

  const observacionesOrigen = esPrestamoTransferencia
    ? transferencia.observaciones
    : transferencia.observacionesOrigen;

  // ✅ Extraer nombre del docente origen desde observaciones si es préstamo
  const nombreDocenteOrigen = esPrestamoTransferencia
    ? transferencia.observaciones?.match(/Transferido por: (.+?)(?:\n|Email:|$)/)?.[1]?.trim() || "Docente desconocido"
    : `${transferencia.docenteOrigen.nombreDocente} ${transferencia.docenteOrigen.apellidoDocente}`;

  // ✅ AGREGAR extracción del email desde observaciones
  const emailDocenteOrigen = esPrestamoTransferencia
    ? transferencia.observaciones?.match(/Email: (.+?)(?:\n|$)/)?.[1]?.trim() || null
    : transferencia.docenteOrigen.emailDocente;

  const handleResponder = async (aceptar) => {
    setLoading(true);

    try {
      if (esPrestamoTransferencia) {
        // ✅ Si es préstamo-transferencia, usar confirmarPrestamo
        await confirmarPrestamo(prestamoId, aceptar, aceptar ? "" : "Rechazado por el docente");
        toast.success(
          aceptar
            ? "Transferencia aceptada exitosamente"
            : "Transferencia rechazada"
        );
      } else {
        // ✅ Si es transferencia completa, usar responderTransferenciaDestino
        await responderTransferenciaDestino(transferencia._id, {
          aceptar,
          observaciones,
          firma: firmaDigital,
        });
        toast.success(
          aceptar
            ? "Transferencia aceptada exitosamente"
            : "Transferencia rechazada"
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al responder transferencia:", error);
      toast.error("Error al procesar la respuesta");
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
            Solicitud de Transferencia
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
          {/* Información del origen */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              👤 Docente que Transfiere
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Nombre:</span>{" "}
                <span className="break-words">{nombreDocenteOrigen}</span>
              </p>
              {emailDocenteOrigen && (
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="break-all">{emailDocenteOrigen}</span>
                </p>
              )}
            </div>
          </div>

          {/* Recursos a recibir */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              📦 Recursos que Recibirás
            </p>
            <div className="space-y-3">
              {/* Recurso Principal */}
              {recursos.map((recurso) => (
                <div
                  key={recurso._id}
                  className="p-3 bg-white rounded-lg border border-green-200"
                >
                  <p className="font-semibold text-sm mb-1 break-words">
                    {recurso.nombre}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <p>
                      <span className="font-semibold">Tipo:</span>{" "}
                      <span className="break-words">{recurso.tipo?.toUpperCase()}</span>
                    </p>
                    {recurso.laboratorio && (
                      <>
                        <p>
                          <span className="font-semibold">Lab:</span>{" "}
                          <span className="break-words">{recurso.laboratorio}</span>
                        </p>
                        <p>
                          <span className="font-semibold">Aula:</span>{" "}
                          <span className="break-words">{recurso.aula}</span>
                        </p>
                      </>
                    )}
                  </div>
                  {recurso.contenido && recurso.contenido.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-700">
                        Contenido:
                      </p>
                      <ul className="list-disc pl-5 text-xs text-gray-600">
                        {recurso.contenido.map((item, i) => (
                          <li key={i} className="break-words">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {/* Recursos Adicionales */}
              {recursosAdicionales.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-700 mt-2">
                    Recursos Adicionales:
                  </p>
                  {recursosAdicionales.map((recurso) => (
                    <div
                      key={recurso._id}
                      className="p-3 bg-white rounded-lg border border-yellow-200"
                    >
                      <p className="font-semibold text-sm mb-1 break-words">
                        {recurso.nombre}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <p>
                          <span className="font-semibold">Tipo:</span>{" "}
                          <span className="break-words">{recurso.tipo?.toUpperCase()}</span>
                        </p>
                        {recurso.laboratorio && (
                          <>
                            <p>
                              <span className="font-semibold">Lab:</span>{" "}
                              <span className="break-words">{recurso.laboratorio}</span>
                            </p>
                            <p>
                              <span className="font-semibold">Aula:</span>{" "}
                              <span className="break-words">{recurso.aula}</span>
                            </p>
                          </>
                        )}
                      </div>
                      {recurso.contenido && recurso.contenido.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-700">
                            Contenido:
                          </p>
                          <ul className="list-disc pl-5 text-xs text-gray-600">
                            {recurso.contenido.map((item, i) => (
                              <li key={i} className="break-words">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Observaciones del origen */}
          {observacionesOrigen && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                💬 Información de la Transferencia
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {observacionesOrigen}
              </p>
            </div>
          )}

          {/* Observaciones propias */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tus Observaciones (Opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agrega alguna observación si lo deseas..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>

          {/* Firma Digital */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✍️ Firma Digital (Tu ID)
            </label>
            <div className="font-mono text-sm bg-white p-2 rounded border border-gray-300 break-all overflow-hidden max-h-12">
              {firmaDigital}
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Al aceptar, te harás responsable de estos recursos. Verifica
              el estado antes de confirmar.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => handleResponder(false)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
            >
              <MdCancel size={20} />
              {loading ? "Procesando..." : "Rechazar"}
            </button>
            <button
              type="button"
              onClick={() => handleResponder(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
            >
              <MdCheckCircle size={20} />
              {loading ? "Procesando..." : "Aceptar Transferencia"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalResponderTransferencia;