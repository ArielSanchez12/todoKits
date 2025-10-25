import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TablaPrestamosAdmin from "../components/prestamos/TablaPrestamosAdmin";
import TablaTransferencias from "../components/prestamos/TablaTransferencias";
import ModalTransferirRecurso from "../components/prestamos/ModalTransferirRecurso";
import ModalQRTransferencia from "../components/prestamos/ModalQRTransferencia";
import storePrestamos from "../context/storePrestamos";
import storeProfile from "../context/storeProfile";

const Prestamos = () => {
  const { prestamos, fetchPrestamosAdmin, clearPrestamos, loading } = storePrestamos();
  const [filtro, setFiltro] = useState("todos");
  const [vistaActual, setVistaActual] = useState("prestamos");
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [qrData, setQRData] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [loadingDocentes, setLoadingDocentes] = useState(false);

  const { fetchDocentes } = storeProfile();

  useEffect(() => {
    const cargarPrestamos = async () => {
      try {
        await fetchPrestamosAdmin();
      } catch (error) {
        console.error("Error al cargar préstamos:", error);
        if (document.location.pathname.includes('/prestamos')) {
          toast.error("No se pudieron cargar los préstamos");
        }
      }
    };

    cargarPrestamos();
    cargarDocentes();

    return () => {
      clearPrestamos();
    };
  }, []);

  const cargarDocentes = async () => {
    setLoadingDocentes(true);
    try {
      const data = await fetchDocentes();
      console.log("✅ Docentes cargados:", data);

      if (Array.isArray(data)) {
        setDocentes(data);
        console.log("✅ Estado docentes actualizado:", data);
      } else {
        console.error("❌ fetchDocentes no retornó un array:", data);
        setDocentes([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar docentes:", error);
      setDocentes([]);
    } finally {
      setLoadingDocentes(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchPrestamosAdmin();
      toast.success("Préstamos actualizados");
    } catch (error) {
      toast.error("Error al actualizar préstamos");
    }
  };

  const handleAbrirTransferencia = async (prestamo) => {
    console.log("🔍 Intentando abrir transferencia");
    console.log("📦 Préstamo:", prestamo);
    console.log("👥 Estado docentes ANTES de abrir modal:", docentes);
    console.log("📊 Es array?:", Array.isArray(docentes));
    console.log("📊 Cantidad:", docentes.length);

    if (!Array.isArray(docentes) || docentes.length === 0) {
      toast.info("Cargando docentes disponibles...");
      setLoadingDocentes(true);

      try {
        const data = await fetchDocentes();
        console.log("✅ Docentes recargados:", data);

        if (!Array.isArray(data) || data.length === 0) {
          toast.error("No hay docentes disponibles en el sistema");
          setLoadingDocentes(false);
          return;
        }

        setDocentes(data);
        setLoadingDocentes(false);

        setTimeout(() => {
          console.log("👥 Docentes al abrir modal:", data);
          setPrestamoSeleccionado(prestamo);
          setModalTransferir(true);
        }, 100);

      } catch (error) {
        console.error("❌ Error al recargar docentes:", error);
        toast.error("Error al cargar docentes");
        setLoadingDocentes(false);
        return;
      }
    } else {
      setPrestamoSeleccionado(prestamo);
      setModalTransferir(true);
    }
  };

  const handleSuccessTransferencia = (resultado) => {
    setQRData(resultado);
    setModalTransferir(false);
    setModalQR(true);
  };

  const handleEnviarPorChat = () => {
    toast.info("Funcionalidad de envío por chat próximamente");
    setModalQR(false);
    setQRData(null);
  };

  const prestamosFiltrados =
    filtro === "todos"
      ? prestamos
      : prestamos?.filter((p) => p.estado === filtro);

  const contadores = {
    todos: prestamos?.length || 0,
    pendiente: prestamos?.filter((p) => p.estado === "pendiente").length || 0,
    activo: prestamos?.filter((p) => p.estado === "activo").length || 0,
    finalizado: prestamos?.filter((p) => p.estado === "finalizado").length || 0,
    rechazado: prestamos?.filter((p) => p.estado === "rechazado").length || 0,
  };

  return (
    <div>
      <ToastContainer />

      <h1 className="font-black text-4xl text-black">Préstamos de Recursos</h1>
      <hr className="my-2 border-t-2 border-gray-300" />
      <p className="mb-8">
        Gestiona todos los préstamos de recursos realizados a los docentes
      </p>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleRefresh}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Préstamos
        </button>

        <div className="text-xs text-gray-500">
          Docentes cargados: {docentes.length}
        </div>
      </div>

      <div className="flex bg-white rounded-lg shadow-sm p-1 mb-6 w-fit border">
        <button
          onClick={() => setVistaActual("prestamos")}
          className={`px-6 py-2 rounded-md font-semibold transition-all ${
            vistaActual === "prestamos"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Préstamos
        </button>
        <button
          onClick={() => setVistaActual("transferencias")}
          className={`px-6 py-2 rounded-md font-semibold transition-all ${
            vistaActual === "transferencias"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Transferencias
        </button>
      </div>

      {loadingDocentes && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700 border border-blue-200">
          ⏳ Cargando docentes disponibles...
        </div>
      )}

      {!loadingDocentes && docentes.length === 0 && vistaActual === "prestamos" && (
        <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm text-yellow-700 border border-yellow-200">
          ⚠️ No se pudieron cargar los docentes. La función de transferencia no estará disponible.
        </div>
      )}

      {vistaActual === "prestamos" ? (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {/* ✅ CORREGIDO: Cambiado de {{...}} a [{...}] */}
            {[
              { key: "todos", label: "Todos" },
              { key: "pendiente", label: "Pendientes" },
              { key: "activo", label: "Activos" },
              { key: "finalizado", label: "Finalizados" },
              { key: "rechazado", label: "Rechazados" },
            ].map((tipo) => (
              <button
                key={tipo.key}
                onClick={() => setFiltro(tipo.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === tipo.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border hover:bg-gray-50"
                }`}
              >
                {tipo.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filtro === tipo.key
                      ? "bg-white text-blue-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {contadores[tipo.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-semibold">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">
                {contadores.pendiente}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-semibold">Activos</p>
              <p className="text-3xl font-bold text-green-600">
                {contadores.activo}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-semibold">Finalizados</p>
              <p className="text-3xl font-bold text-blue-600">
                {contadores.finalizado}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-semibold">Rechazados</p>
              <p className="text-3xl font-bold text-red-600">
                {contadores.rechazado}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Cargando préstamos...</p>
            </div>
          ) : (
            <TablaPrestamosAdmin
              prestamos={prestamosFiltrados}
              onRefresh={handleRefresh}
              onSolicitarTransferencia={handleAbrirTransferencia}
            />
          )}
        </>
      ) : (
        <TablaTransferencias />
      )}

      {modalTransferir && prestamoSeleccionado && Array.isArray(docentes) && (
        <ModalTransferirRecurso
          prestamo={prestamoSeleccionado}
          docentes={docentes}
          onClose={() => {
            setModalTransferir(false);
            setPrestamoSeleccionado(null);
          }}
          onSuccess={handleSuccessTransferencia}
        />
      )}

      {modalQR && qrData && (
        <ModalQRTransferencia
          transferencia={qrData.transferencia}
          qrImage={qrData.qrImage}
          onClose={() => {
            setModalQR(false);
            setQRData(null);
          }}
          onEnviarPorChat={handleEnviarPorChat}
        />
      )}
    </div>
  );
};

export default Prestamos;