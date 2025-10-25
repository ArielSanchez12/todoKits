import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import storeTransferencias from "../context/storeTransferencias";
import storeProfile from "../context/storeProfile";
import logoBuho from "../assets/buho_con_lentes.webp";

const ConfirmarTransferencia = () => {
  const { codigoQR } = useParams();
  const navigate = useNavigate();
  const { user } = storeProfile();
  const [transferencia, setTransferencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ AGREGAR: Estados para el formulario
  const [observaciones, setObservaciones] = useState("");
  const [firma, setFirma] = useState("");

  const { obtenerTransferenciaPorQR, confirmarTransferenciaOrigen } = storeTransferencias();

  const docenteId = user?._doc?._id || user?._id;
  const nombreCompleto = user?._doc
    ? `${user._doc.nombreDocente} ${user._doc.apellidoDocente}`
    : `${user?.nombreDocente} ${user?.apellidoDocente}`;

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
      // ✅ Pre-llenar firma con nombre del docente
      setFirma(nombreCompleto);
    } catch (err) {
      console.error("❌ Error al cargar transferencia:", err);
      setError(err.message || "Error al cargar la transferencia");
      toast.error("Error al cargar la transferencia");
    } finally {
      setLoading(false);
    }
  };

  // ✅ AGREGAR: Manejar el formulario
  const handleConfirmarTransferencia = async (e) => {
    e.preventDefault();

    if (!transferencia) {
      toast.error("No hay transferencia para confirmar");
      return;
    }

    if (!firma.trim()) {
      toast.error("Debes ingresar tu firma digital");
      return;
    }

    // ✅ Validar que sea el docente origen
    if (transferencia.docenteOrigen._id !== docenteId) {
      toast.error("No tienes permisos para confirmar esta transferencia");
      return;
    }

    setConfirmando(true);
    try {
      console.log("📝 Confirmando transferencia con código QR:", codigoQR);
      const resultado = await confirmarTransferenciaOrigen(codigoQR, {
        observaciones,
        firma,
      });
      console.log("✅ Transferencia confirmada:", resultado);

      toast.success("¡Transferencia confirmada exitosamente!");

      setTimeout(() => {
        navigate("/dashboard/prestamos-docente");
      }, 1500);
    } catch (error) {
      console.error("❌ Error al confirmar transferencia:", error);
      toast.error(error.message || "Error al confirmar la transferencia");
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ Confirmar Transferencia
          </h1>
          <p className="text-gray-600">
            Por favor revisa los detalles antes de confirmar
          </p>
        </div>

        {/* ✅ CAMBIO: Usar form en lugar de div */}
        <form onSubmit={handleConfirmarTransferencia}>
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
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  📤 De (Docente Actual)
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

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-2">
                  📥 Para
                </p>
                <div>
                  <p className="font-bold text-lg">
                    {transferencia.docenteDestino?.nombreDocente}{" "}
                    {transferencia.docenteDestino?.apellidoDocente}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transferencia.docenteDestino?.emailDocente}
                  </p>
                </div>
              </div>
            </div>

            {/* Recursos */}
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

            {/* ✅ AGREGAR: Observaciones */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observaciones del Estado de los Recursos
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Describe el estado actual de los recursos..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            {/* ✅ AGREGAR: Firma */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Firma Digital *
              </label>
              <input
                type="text"
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Advertencia */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">⚠️ Importante:</span> Al confirmar,
                estás cediendo estos recursos. El docente destino deberá aceptar la transferencia.
              </p>
            </div>

            {/* ✅ CAMBIO: Actualizar botones */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/dashboard/prestamos-docente")}
                disabled={confirmando}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={confirmando || transferencia.estado !== "pendiente_origen"}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold text-white ${
                  transferencia.estado !== "pendiente_origen"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {confirmando ? "Confirmando..." : "✅ Confirmar Transferencia"}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Si tienes dudas, contacta con el administrador</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarTransferencia;