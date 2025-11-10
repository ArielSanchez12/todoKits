import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import storeTransferencias from "../context/storeTransferencias";
import storeProfile from "../context/storeProfile";
import DetalleTransferencia from "../components/prestamos/DetalleTransferencia";
import logoBuho from "../assets/buho_con_lentes.webp";

const ConfirmarTransferencia = () => {
  const { codigoQR } = useParams();
  const navigate = useNavigate();
  const { user } = storeProfile();
  const { obtenerTransferenciaPorQR, confirmarTransferenciaOrigen } = storeTransferencias();

  const [transferencia, setTransferencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);
  const [observaciones, setObservaciones] = useState("");

  // Firma digital = ID del docente (moderno)
  const firmaDigital = user?._doc?._id || user?._id;

  const esDocenteOrigen = transferencia?.docenteOrigen?._id === firmaDigital;
  const estaPendiente = transferencia?.estado === "pendiente_origen";

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerTransferenciaPorQR(codigoQR);
        if (!data) {
          setError("Transferencia no encontrada");
          toast.error("La transferencia fue cancelada o ha expirado");
          navigate("/notfound", { replace: true });
          return;
        }
        if (data.caducada) {
          toast.error(data.msg || "Esta transferencia ya no está activa");
          navigate("/notfound", { replace: true });
          return;
        }
        setTransferencia(data);
      } catch (e) {
        setError("Error al procesar la transferencia: ha expirado o fue cancelada");
        toast.error("Error al procesar la transferencia: ha expirado o fue cancelada");
        navigate("/notfound", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    if (codigoQR) cargar();
  }, [codigoQR, obtenerTransferenciaPorQR, navigate]);

  const handleConfirmar = async (e) => {
    e.preventDefault();
    if (!transferencia) return;
    if (!esDocenteOrigen || !estaPendiente) {
      toast.error("No autorizado para confirmar");
      return;
    }
    setConfirmando(true);
    try {
      await confirmarTransferenciaOrigen(codigoQR, {
        observaciones,
        firma: firmaDigital
      });
      toast.success("Transferencia confirmada correctamente");
      setTimeout(() => navigate("/dashboard/prestamos-docente"), 1200);
    } catch (e) {
      toast.error(e.message || "Error al confirmar la transferencia, verifica que no haya sido cancelada o esté expirada");
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">Cargando transferencia...</p>
      </div>
    );
  }

  if (error || !transferencia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <img
          className="object-cover h-32 w-32 rounded-full border-4 border-red-600 mb-8"
          src={logoBuho}
          alt="Error"
        />
        <p className="text-3xl text-black">⚠️ Error</p>
        <p className="text-red-600 mt-6">{error || "Transferencia no encontrada"}</p>
        <button
          onClick={() => navigate("/dashboard/prestamos-docente")}
          className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-blue-600 transition"
        >
          Volver
        </button>
      </div>
    );
  }

  // Si no debe confirmar, mostrar detalle moderno
  if (!esDocenteOrigen || !estaPendiente) {
    return (
      <DetalleTransferencia
        transferencia={transferencia}
        onClose={() => navigate("/dashboard/prestamos-docente")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Confirmar Transferencia de Recursos
          </h2>
          <button
            onClick={() => navigate("/dashboard/prestamos-docente")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirmar} className="p-6 space-y-6">
          {/* Destino */}
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

          {/* Recursos (mantener cuadro morado separado) */}
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

          {/* Firma digital (solo lectura, ID) */}
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
              ⚠️ Al confirmar, cedes estos recursos al docente destino. El otro
              docente deberá aceptar la transferencia.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/dashboard/prestamos-docente")}
              className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              disabled={confirmando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={confirmando}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
            >
              {confirmando ? "Confirmando..." : "Confirmar Transferencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmarTransferencia;