import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import storeTransferencias from "../../context/storeTransferencias";

const ModalTransferirRecurso = ({ prestamo, docentes, onClose, onSuccess }) => {
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [recursosSeleccionados, setRecursosSeleccionados] = useState({
    principales: [prestamo.recurso._id],
    adicionales: prestamo.recursosAdicionales?.map(r => r._id) || [],
  });
  const [loading, setLoading] = useState(false);
  const { crearTransferencia } = storeTransferencias();

  // Filtrar docentes disponibles
  const docentesDisponibles = Array.isArray(docentes)
    ? docentes.filter((d) => d._id !== prestamo.docente._id)
    : [];

  const handleToggleRecursoAdicional = (recursoId) => {
    setRecursosSeleccionados((prev) => ({
      ...prev,
      adicionales: prev.adicionales.includes(recursoId)
        ? prev.adicionales.filter((id) => id !== recursoId)
        : [...prev.adicionales, recursoId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!docenteSeleccionado) {
      toast.error("Selecciona un docente destino");
      return;
    }

    if (recursosSeleccionados.principales.length === 0) {
      toast.error("Debes transferir al menos el recurso principal");
      return;
    }

    setLoading(true);

    try {
      const resultado = await crearTransferencia({
        prestamoId: prestamo._id,
        docenteDestinoId: docenteSeleccionado,
        recursosSeleccionados,
      });

      toast.success("Solicitud de transferencia creada exitosamente");
      onSuccess(resultado);
      onClose();
    } catch (error) {
      console.error("Error al crear transferencia:", error);
      toast.error("Error al crear la transferencia");
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar error si docentes es null/undefined
  // NO validar por length porque puede ser un array vacío temporalmente
  if (!docentes) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Cargando...</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <IoClose size={24} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Cargando docentes disponibles...</p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 mt-4"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay docentes disponibles después de filtrar
  if (docentesDisponibles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">⚠️ Sin Docentes Disponibles</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <IoClose size={24} />
            </button>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              {docentes.length === 0
                ? "No hay docentes registrados en el sistema."
                : "El único docente disponible ya tiene este préstamo asignado."}
            </p>
          </div>
          <p className="text-gray-700 mb-4">
            No es posible realizar una transferencia en este momento.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Solicitar Transferencia de Recursos
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
          {/* Información del préstamo actual */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📦 Préstamo Actual
            </p>
            <p className="text-sm">
              <span className="font-semibold">Docente:</span>{" "}
              {prestamo.docente.nombreDocente} {prestamo.docente.apellidoDocente}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Recurso Principal:</span>{" "}
              {prestamo.recurso.nombre}
            </p>
          </div>

          {/* Seleccionar docente destino */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Docente Destino *
            </label>
            <select
              value={docenteSeleccionado}
              onChange={(e) => setDocenteSeleccionado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un docente</option>
              {docentesDisponibles.map((docente) => (
                <option key={docente._id} value={docente._id}>
                  {docente.nombreDocente} {docente.apellidoDocente} -{" "}
                  {docente.emailDocente}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Mostrando {docentesDisponibles.length} de {docentes.length} docentes disponibles
            </p>
          </div>

          {/* Recurso principal (siempre seleccionado) */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ✅ Recurso Principal (Obligatorio)
            </p>
            <div className="flex items-center gap-3 p-3 bg-white rounded border border-green-200">
              <MdCheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold">{prestamo.recurso.nombre}</p>
                <p className="text-xs text-gray-600">
                  {prestamo.recurso.tipo?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Recursos adicionales (opcionales) */}
          {prestamo.recursosAdicionales &&
            prestamo.recursosAdicionales.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  📦 Recursos Adicionales (Opcional)
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Selecciona los recursos adicionales que deseas transferir
                </p>
                <div className="space-y-2">
                  {prestamo.recursosAdicionales.map((recurso) => (
                    <div
                      key={recurso._id}
                      className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${recursosSeleccionados.adicionales.includes(recurso._id)
                          ? "bg-white border-yellow-400"
                          : "bg-white border-gray-200 opacity-60"
                        }`}
                      onClick={() => handleToggleRecursoAdicional(recurso._id)}
                    >
                      {recursosSeleccionados.adicionales.includes(
                        recurso._id
                      ) ? (
                        <MdCheckCircle className="text-green-600" size={24} />
                      ) : (
                        <MdCancel className="text-gray-400" size={24} />
                      )}
                      <div>
                        <p className="font-semibold">{recurso.nombre}</p>
                        <p className="text-xs text-gray-600">
                          {recurso.tipo?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📋 Resumen
            </p>
            <ul className="text-sm space-y-1">
              <li>
                <span className="font-semibold">Total recursos:</span>{" "}
                {recursosSeleccionados.principales.length +
                  recursosSeleccionados.adicionales.length}
              </li>
              <li>
                <span className="font-semibold">Principales:</span>{" "}
                {recursosSeleccionados.principales.length}
              </li>
              <li>
                <span className="font-semibold">Adicionales:</span>{" "}
                {recursosSeleccionados.adicionales.length}
              </li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Transferencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTransferirRecurso;