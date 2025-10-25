import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import storeTransferencias from "../context/storeTransferencias";
import logoBuho from "../assets/buho_con_lentes.webp";

const ConfirmarTransferencia = () => {
  // ✅ CAMBIO: Usar codigoQR en lugar de id
  const { codigoQR } = useParams();
  const navigate = useNavigate();
  const [transferencia, setTransferencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CAMBIO: Usar obtenerTransferenciaPorQR en lugar de obtenerTransferencia
  const { obtenerTransferenciaPorQR, confirmarTransferenciaOrigen } = storeTransferencias();

  useEffect(() => {
    cargarTransferencia();
  }, [codigoQR]);

  const cargarTransferencia = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Cargando transferencia con código QR:", codigoQR);
      const data = await obtenerTransferenciaPorQR(codigoQR);
      console.log("✅ Transferencia cargada:", data);

      if (!data) {
        setError("Transferencia no encontrada");
        toast.error("La transferencia no existe o ha expirado");
        return;
      }

      setTransferencia(data);
    } catch (err) {
      console.error("❌ Error al cargar transferencia:", err);
      setError(err.message || "Error al cargar la transferencia");
      toast.error("Error al cargar la transferencia");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarTransferencia = async () => {
    if (!transferencia) {
      toast.error("No hay transferencia para confirmar");
      return;
    }

    setConfirmando(true);
    try {
      console.log("📝 Confirmando transferencia con código QR:", codigoQR);
      // ✅ CAMBIO: Usar confirmarTransferenciaOrigen que usa codigoQR
      const resultado = await confirmarTransferenciaOrigen(codigoQR, {});
      console.log("✅ Transferencia confirmada:", resultado);

      toast.success("¡Transferencia confirmada exitosamente!");

      // Esperar un segundo antes de redirigir
      setTimeout(() => {
        navigate("/dashboard/prestamos-docente");
      }, 1500);
    } catch (error) {
      console.error("❌ Error al confirmar transferencia:", error);
      toast.error(
        error.message || "Error al confirmar la transferencia"
      );
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Cargando transferencia...</p>
      </div>
    );
  }

  if (error || !transferencia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <img
          className="object-cover h-32 w-32 rounded-full border-4 border-solid border-red-600 mb-8"
          src={logoBuho}
          alt="Error"
        />
        <div className="flex flex-col items-center justify-center text-center mt-12">
          <p className="text-3xl md:text-4xl lg:text-5xl text-black">
            ⚠️ Error
          </p>
          <p className="md:text-lg lg:text-xl text-red-600 mt-8">
            {error || "Transferencia no encontrada"}
          </p>
          <button
            onClick={() => navigate("/dashboard/prestamos-docente")}
            className="p-3 m-5 w-full text-center bg-black text-white border rounded-xl hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white"
          >
            Volver a Préstamos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ Confirmar Transferencia
          </h1>
          <p className="text-gray-600">
            Por favor revisa los detalles antes de confirmar
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Estado */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-800 mb-2">Estado</p>
            <p className="text-2xl font-bold text-blue-600">
              {transferencia.estado?.toUpperCase() || "PENDIENTE"}
            </p>
          </div>

          {/* Información de Transferencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Docente Origen */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                📤 De (Docente Actual)
              </p>
              <div>
                <p className="font-bold text-lg">
                  {transferencia.prestamoId?.docente?.nombreDocente}{" "}
                  {transferencia.prestamoId?.docente?.apellidoDocente}
                </p>
                <p className="text-sm text-gray-600">
                  {transferencia.prestamoId?.docente?.emailDocente}
                </p>
              </div>
            </div>

            {/* Docente Destino */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">
                📥 Para (Tu Nombre)
              </p>
              <div>
                <p className="font-bold text-lg">
                  {transferencia.docenteDestinoId?.nombreDocente}{" "}
                  {transferencia.docenteDestinoId?.apellidoDocente}
                </p>
                <p className="text-sm text-gray-600">
                  {transferencia.docenteDestinoId?.emailDocente}
                </p>
              </div>
            </div>
          </div>

          {/* Recurso Principal */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm font-semibold text-purple-800 mb-3">
              📦 Recurso Principal
            </p>
            <div className="bg-white p-3 rounded border border-purple-100">
              <p className="font-bold text-lg">
                {transferencia.prestamoId?.recurso?.nombre}
              </p>
              <p className="text-sm text-gray-600">
                Tipo: {transferencia.prestamoId?.recurso?.tipo?.toUpperCase()}
              </p>
              {transferencia.prestamoId?.observaciones && (
                <p className="text-sm text-gray-700 mt-2">
                  Observaciones: {transferencia.prestamoId.observaciones}
                </p>
              )}
            </div>
          </div>

          {/* Recursos Adicionales */}
          {transferencia.recursosTransferidos &&
            transferencia.recursosTransferidos.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-800 mb-3">
                  📚 Recursos Adicionales ({transferencia.recursosTransferidos.length})
                </p>
                <div className="space-y-2">
                  {transferencia.recursosTransferidos.map((recurso) => (
                    <div
                      key={recurso._id}
                      className="bg-white p-3 rounded border border-indigo-100"
                    >
                      <p className="font-semibold">{recurso.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {recurso.tipo?.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Fecha y Información */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              📅 Información
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-semibold">Código QR:</span> {codigoQR}
              </p>
              <p>
                <span className="font-semibold">ID Transferencia:</span>{" "}
                {transferencia._id}
              </p>
              <p>
                <span className="font-semibold">Solicitada:</span>{" "}
                {new Date(transferencia.createdAt).toLocaleString("es-ES")}
              </p>
              {transferencia.confirmadoEn && (
                <p>
                  <span className="font-semibold">Confirmada:</span>{" "}
                  {new Date(transferencia.confirmadoEn).toLocaleString("es-ES")}
                </p>
              )}
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">⚠️ Importante:</span> Al confirmar
              esta transferencia, asumes la responsabilidad de los recursos
              indicados. Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={() => navigate("/dashboard/prestamos-docente")}
              disabled={confirmando}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarTransferencia}
              disabled={confirmando || transferencia.estado === "confirmado"}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold text-white ${transferencia.estado === "confirmado"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-50`}
            >
              {confirmando ? "Confirmando..." : "✅ Confirmar Transferencia"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Si tienes dudas, contacta con el administrador</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarTransferencia;