import { useState, useEffect } from "react";
import storePrestamos from "../context/storePrestamos";
import TablaPrestamosDocente from "../components/prestamos/TablaPrestamosDocente";
import { ToastContainer, toast } from "react-toastify";
import { MdHistory, MdAssignment } from "react-icons/md";
import "react-toastify/dist/ReactToastify.css";
import EscanerQR from "../components/prestamos/EscanerQR";
import ModalConfirmarTransferencia from "../components/prestamos/ModalConfirmarTransferencia";
import NotificacionesTransferencias from "../components/prestamos/NotificacionesTransferencias";
import { MdQrCodeScanner } from "react-icons/md";
import storeProfile from "../context/storeProfile";
import storeTransferencias from "../context/storeTransferencias"; // ✅ AGREGAR IMPORT

const PrestamosDocente = () => {
  const {
    prestamosDocente,
    historialDocente,
    fetchPrestamosDocente,
    fetchHistorialDocente,
    clearPrestamos,
    loading,
  } = storePrestamos();
  
  const [vista, setVista] = useState("activos"); // "activos" o "historial"
  const [mostrarEscaner, setMostrarEscaner] = useState(false);
  const [transferenciaEscaneada, setTransferenciaEscaneada] = useState(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const { user } = storeProfile();
  
  const docenteId = user?._doc?._id || user?._id;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await fetchPrestamosDocente();
        await fetchHistorialDocente();
      } catch (error) {
        console.error("Error al cargar préstamos:", error);
        if (document.location.pathname.includes('/prestamos-docente')) {
          toast.error("No se pudieron cargar los préstamos");
        }
      }
    };

    cargarDatos();

    return () => {
      clearPrestamos();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      if (vista === "activos") {
        await fetchPrestamosDocente();
      } else {
        await fetchHistorialDocente();
      }
      toast.success("Datos actualizados");
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  // ✅ CORRECCIÓN: Usar storeTransferencias correctamente
  const handleScanSuccess = async (url) => {
    try {
      console.log("🔍 URL escaneada:", url);
      
      // Extraer código QR de la URL
      // URL esperada: https://kitsfrontend-zeta.vercel.app/dashboard/transferencia/{codigoQR}
      const codigoQR = url.split("/").pop();
      
      console.log("✅ Código QR extraído:", codigoQR);
      
      // ✅ CORRECCIÓN: Obtener datos de la transferencia
      const { obtenerTransferenciaPorQR } = storeTransferencias.getState();
      const transferencia = await obtenerTransferenciaPorQR(codigoQR);
      
      console.log("📦 Transferencia obtenida:", transferencia);
      
      setTransferenciaEscaneada(transferencia);
      setMostrarEscaner(false);
      setMostrarModalConfirmacion(true);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("QR inválido o transferencia no encontrada");
      setMostrarEscaner(false);
    }
  };

  const prestamosActuales = vista === "activos" ? prestamosDocente : historialDocente;

  return (
    <div>
      <ToastContainer />
      <h1 className="font-black text-4xl text-black">Mis Préstamos</h1>
      <hr className="my-2 border-t-2 border-gray-300" />
      <p className="mb-8">
        Gestiona tus préstamos activos y consulta tu historial
      </p>

      {/* Notificaciones de transferencias */}
      {docenteId && <NotificacionesTransferencias docenteId={docenteId} />}

      {/* Navegación entre vistas */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setVista("activos")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            vista === "activos"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <MdAssignment size={20} />
          Préstamos Activos
          {prestamosDocente.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
              {prestamosDocente.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setVista("historial")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            vista === "historial"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <MdHistory size={20} />
          Historial
          {historialDocente.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
              {historialDocente.length}
            </span>
          )}
        </button>
      </div>

      {/* Información según la vista */}
      {vista === "activos" ? (
        <>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Préstamos Pendientes:</strong> Debes confirmar o rechazar estos préstamos.
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Préstamos Activos:</strong> Recursos que tienes en tu poder. Puedes devolverlos cuando finalices.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-semibold">
                Pendientes de Confirmar
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {prestamosDocente.filter((p) => p.estado === "pendiente").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-semibold">
                En mi Poder
              </p>
              <p className="text-3xl font-bold text-green-600">
                {prestamosDocente.filter((p) => p.estado === "activo").length}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>Historial de Préstamos:</strong> Aquí se muestran todos los préstamos que has finalizado.
          </p>
        </div>
      )}

      {/* Botón de actualizar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Tabla según vista */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando préstamos...</p>
        </div>
      ) : vista === "activos" ? (
        <TablaPrestamosDocente
          prestamos={prestamosActuales}
          onRefresh={handleRefresh}
        />
      ) : (
        // Tabla de historial (reutilizamos TablaPrestamosAdmin pero sin acciones)
        <div className="overflow-x-auto">
          <table className="w-full mt-5 table-auto shadow-lg bg-white">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-2">N°</th>
                <th className="p-2">Recurso</th>
                <th className="p-2">Motivo</th>
                <th className="p-2">Fecha Préstamo</th>
                <th className="p-2">Fecha Confirmación</th>
                <th className="p-2">Fecha Devolución</th>
              </tr>
            </thead>
            <tbody>
              {historialDocente && historialDocente.length > 0 ? (
                historialDocente.map((prestamo, index) => (
                  <tr key={prestamo._id} className="hover:bg-gray-300 text-center">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 font-semibold">
                      {prestamo.recurso?.nombre || "N/A"}
                      <br />
                      <span className="text-xs text-gray-600">
                        {prestamo.recurso?.tipo?.toUpperCase() || ""}
                      </span>
                    </td>
                    <td className="p-2">{prestamo.motivo?.tipo}</td>
                    <td className="p-2 text-sm">
                      {new Date(prestamo.fechaPrestamo).toLocaleDateString("es-ES")}
                    </td>
                    <td className="p-2 text-sm">
                      {prestamo.horaConfirmacion
                        ? new Date(prestamo.horaConfirmacion).toLocaleString("es-ES")
                        : "-"}
                    </td>
                    <td className="p-2 text-sm">
                      {prestamo.horaDevolucion
                        ? new Date(prestamo.horaDevolucion).toLocaleString("es-ES")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No hay historial de préstamos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón para abrir escáner */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setMostrarEscaner(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <MdQrCodeScanner size={20} />
          Escanear QR de Transferencia
        </button>
      </div>

      {/* Modales */}
      {mostrarEscaner && (
        <EscanerQR
          onScanSuccess={handleScanSuccess}
          onClose={() => setMostrarEscaner(false)}
        />
      )}

      {mostrarModalConfirmacion && transferenciaEscaneada && (
        <ModalConfirmarTransferencia
          transferencia={transferenciaEscaneada}
          onClose={() => {
            setMostrarModalConfirmacion(false);
            setTransferenciaEscaneada(null);
          }}
          onSuccess={() => {
            // Recargar préstamos
            fetchPrestamosDocente();
          }}
        />
      )}
    </div>
  );
};

export default PrestamosDocente;