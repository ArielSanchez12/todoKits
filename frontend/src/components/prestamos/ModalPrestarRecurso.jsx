import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prestamoSchema } from "../../schemas/prestamoSchema";
import storePrestamos from "../../context/storePrestamos";
import storeRecursos from "../../context/storeRecursos";
import { IoClose } from "react-icons/io5";

const ModalPrestarRecurso = ({ docente, onClose, onSuccess }) => {
  const { crearPrestamo } = storePrestamos();
  const { recursos, fetchRecursos } = storeRecursos();
  const [recursosDisponibles, setRecursosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(prestamoSchema),
    defaultValues: {
      docente: docente._id,
      recurso: "",
      motivo: {
        tipo: "Clase",
        descripcion: "",
      },
      observaciones: "",
    },
  });

  const motivoTipo = watch("motivo.tipo");
  const recursoSeleccionado = watch("recurso");

  // Cargar recursos disponibles
  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        await fetchRecursos();
      } catch (error) {
        console.error("Error al cargar recursos:", error);
      }
    };
    cargarRecursos();
  }, []);

  // Filtrar solo recursos disponibles (pendiente)
  useEffect(() => {
    if (recursos) {
      const disponibles = recursos.filter((r) => r.estado === "pendiente");
      setRecursosDisponibles(disponibles);
    }
  }, [recursos]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await crearPrestamo(data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear préstamo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener info del recurso seleccionado
  const infoRecurso = recursosDisponibles.find((r) => r._id === recursoSeleccionado);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Prestar Recurso
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información del docente */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Docente Responsable:</p>
            <p className="font-semibold text-lg">
              {docente.nombreDocente} {docente.apellidoDocente}
            </p>
            <p className="text-sm text-gray-600">{docente.emailDocente}</p>
          </div>

          {/* Fecha actual */}
          <div>
            <label className="block font-semibold mb-2">Fecha de Préstamo</label>
            <input
              type="text"
              value={new Date().toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              readOnly
              className="w-full p-3 border rounded-lg bg-gray-100"
            />
          </div>

          {/* Seleccionar recurso */}
          <div>
            <label className="block font-semibold mb-2">
              Recurso a Prestar <span className="text-red-500">*</span>
            </label>
            <select
              {...register("recurso")}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.recurso ? "border-red-500" : ""
              }`}
            >
              <option value="">Seleccionar recurso</option>
              {recursosDisponibles.map((recurso) => (
                <option key={recurso._id} value={recurso._id}>
                  {recurso.nombre} - {recurso.tipo.toUpperCase()}
                  {recurso.laboratorio && ` (${recurso.laboratorio})`}
                </option>
              ))}
            </select>
            {errors.recurso && (
              <p className="text-red-500 text-sm mt-1">{errors.recurso.message}</p>
            )}
            {recursosDisponibles.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                No hay recursos disponibles para préstamo
              </p>
            )}
          </div>

          {/* Información del recurso seleccionado */}
          {infoRecurso && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Detalles del recurso:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Tipo:</span>{" "}
                  <span className="font-medium">{infoRecurso.tipo.toUpperCase()}</span>
                </div>
                {infoRecurso.laboratorio && (
                  <div>
                    <span className="text-gray-600">Laboratorio:</span>{" "}
                    <span className="font-medium">{infoRecurso.laboratorio}</span>
                  </div>
                )}
                {infoRecurso.aula && (
                  <div>
                    <span className="text-gray-600">Aula:</span>{" "}
                    <span className="font-medium">{infoRecurso.aula}</span>
                  </div>
                )}
                {infoRecurso.contenido && infoRecurso.contenido.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Contenido:</span>
                    <ul className="list-disc pl-5 mt-1">
                      {infoRecurso.contenido.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs">{item}</li>
                      ))}
                      {infoRecurso.contenido.length > 3 && (
                        <li className="text-xs text-blue-600">
                          +{infoRecurso.contenido.length - 3} más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block font-semibold mb-2">
              Motivo del Préstamo <span className="text-red-500">*</span>
            </label>
            <select
              {...register("motivo.tipo")}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.motivo?.tipo ? "border-red-500" : ""
              }`}
            >
              <option value="Clase">Clase</option>
              <option value="Conferencia">Conferencia</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.motivo?.tipo && (
              <p className="text-red-500 text-sm mt-1">{errors.motivo.tipo.message}</p>
            )}
          </div>

          {/* Descripción del motivo (solo si es "Otro") */}
          {motivoTipo === "Otro" && (
            <div>
              <label className="block font-semibold mb-2">
                Especificar Motivo <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("motivo.descripcion")}
                placeholder="Describa el motivo del préstamo..."
                rows={3}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.motivo?.descripcion ? "border-red-500" : ""
                }`}
              />
              {errors.motivo?.descripcion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.motivo.descripcion.message}
                </p>
              )}
            </div>
          )}

          {/* Observaciones */}
          <div>
            <label className="block font-semibold mb-2">Observaciones</label>
            <textarea
              {...register("observaciones")}
              placeholder="Ej: Se lleva el KIT #2 y la LLAVE #1 adicional (opcional)"
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Si menciona otros recursos (KIT #X, LLAVE #X), se detectarán automáticamente
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading || recursosDisponibles.length === 0}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? "Creando..." : "Crear Préstamo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPrestarRecurso;