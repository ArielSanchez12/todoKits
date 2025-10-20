import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recursoFormSchema } from "../../schemas/recursoSchema";
import storeRecursos from "../../context/storeRecursos";
import ModalContenido from "./ModalContenido";

const LABS_KIT = [
  { laboratorio: "LAB 23A", aula: "E030" },
  { laboratorio: "LAB 23B", aula: "E031" },
  { laboratorio: "LAB 22B", aula: "E034" },
  { laboratorio: "LAB 14", aula: "E045" },
  { laboratorio: "LAB 16", aula: "E042" },
  { laboratorio: "LAB 20", aula: "E037" },
];

const LABS_LLAVE = [
  { laboratorio: "LAB 22A", aula: "E035" },
  { laboratorio: "LAB 15", aula: "E043" },
  { laboratorio: "LAB 17", aula: "E040" },
];

const FormRecurso = ({ onBack, modoEdicion = false }) => {
  const { createRecurso, updateRecursoCompleto, recursos, fetchRecursos, recursoEditando } = storeRecursos();
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset, trigger } = useForm({
    resolver: zodResolver(recursoFormSchema),
    mode: "onChange",
    defaultValues: modoEdicion && recursoEditando ? {
      tipo: recursoEditando.tipo,
      laboratorio: recursoEditando.laboratorio || "",
      aula: recursoEditando.aula || "",
      contenido: recursoEditando.contenido || [""],
    } : {
      tipo: "kit",
      laboratorio: "",
      aula: "",
      contenido: [""],
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [labsDisponibles, setLabsDisponibles] = useState([]);
  const tipoActual = watch("tipo");
  const laboratorioActual = watch("laboratorio");
  const contenidoActual = watch("contenido") || [""];

  // Cargar datos del recurso en modo edición
  useEffect(() => {
    if (modoEdicion && recursoEditando) {
      setValue("tipo", recursoEditando.tipo);
      setValue("laboratorio", recursoEditando.laboratorio || "");
      setValue("aula", recursoEditando.aula || "");
      setValue("contenido", recursoEditando.contenido || [""]);
    }
  }, [modoEdicion, recursoEditando, setValue]);

  // Actualizar laboratorios disponibles según tipo y recursos actuales
  useEffect(() => {
    const labsArray = tipoActual === "kit" ? LABS_KIT : LABS_LLAVE;
    const labsUsados = recursos
      ?.filter((r) => {
        // En modo edición, excluir el recurso actual de la lista de usados
        if (modoEdicion && recursoEditando) {
          return r.tipo === tipoActual && r._id !== recursoEditando._id;
        }
        return r.tipo === tipoActual;
      })
      .map((r) => r.laboratorio)
      .filter(Boolean);

    const disponibles = labsArray.filter(
      (lab) => !labsUsados?.includes(lab.laboratorio)
    );

    setLabsDisponibles(disponibles);
  }, [tipoActual, recursos, modoEdicion, recursoEditando]);

  // Auto-completar aula cuando se selecciona laboratorio
  useEffect(() => {
    if (laboratorioActual && tipoActual !== "proyector") {
      const labsArray = tipoActual === "kit" ? LABS_KIT : LABS_LLAVE;
      const found = labsArray.find((l) => l.laboratorio === laboratorioActual);
      if (found) {
        setValue("aula", found.aula);
      }
    }
  }, [laboratorioActual, tipoActual, setValue]);

  // Resetear campos cuando cambia el tipo (solo en modo creación)
  useEffect(() => {
    if (!modoEdicion) {
      if (tipoActual === "proyector") {
        setValue("laboratorio", "");
        setValue("aula", "");
        setValue("contenido", [""]);
      } else if (tipoActual === "llave") {
        setValue("laboratorio", "");
        setValue("aula", "");
        setValue("contenido", []);
      } else if (tipoActual === "kit") {
        setValue("laboratorio", "");
        setValue("aula", "");
        setValue("contenido", [""]);
      }
      setTimeout(() => trigger(), 100);
    }
  }, [tipoActual, setValue, trigger, modoEdicion]);

  const handleContenidoChange = (index, value) => {
    const newContenido = [...contenidoActual];
    newContenido[index] = value;
    setValue("contenido", newContenido);
    trigger("contenido");
  };

  const addContenidoField = () => {
    setValue("contenido", [...contenidoActual, ""]);
    trigger("contenido");
  };

  const removeContenidoField = (index) => {
    const newContenido = contenidoActual.filter((_, i) => i !== index);
    setValue("contenido", newContenido.length > 0 ? newContenido : [""]);
    trigger("contenido");
  };

  const onSubmit = async (data) => {
    try {
      let datosEnvio = {};

      // Modo edición
      if (modoEdicion && recursoEditando) {
        const tipo = recursoEditando.tipo;

        if (tipo === "kit") {
          datosEnvio.laboratorio = data.laboratorio;
          datosEnvio.aula = data.aula;
          datosEnvio.contenido = data.contenido?.filter(c => c?.trim()) || [];
        } 
        else if (tipo === "llave") {
          datosEnvio.laboratorio = data.laboratorio;
          datosEnvio.aula = data.aula;
        } 
        else if (tipo === "proyector") {
          datosEnvio.contenido = data.contenido?.filter(c => c?.trim()) || [];
        }

        await updateRecursoCompleto(recursoEditando._id, datosEnvio);
      } 
      // Modo creación
      else {
        datosEnvio = { tipo: data.tipo };

        if (data.tipo === "kit") {
          datosEnvio.laboratorio = data.laboratorio;
          datosEnvio.aula = data.aula;
          datosEnvio.contenido = data.contenido?.filter(c => c?.trim()) || [];
        } 
        else if (data.tipo === "llave") {
          datosEnvio.laboratorio = data.laboratorio;
          datosEnvio.aula = data.aula;
        } 
        else if (data.tipo === "proyector") {
          datosEnvio.contenido = data.contenido?.filter(c => c?.trim()) || [];
        }

        await createRecurso(datosEnvio);
      }

      setTimeout(async () => {
        try {
          await fetchRecursos();
        } catch (error) {
          console.error("Error al refrescar recursos:", error);
        }
      }, 500);

      // Volver a la tabla después de guardar
      onBack();
    } catch (error) {
      console.error("Error en submit:", error);
    }
  };

  // Determinar si un campo debe estar deshabilitado en modo edición
  const isCampoDeshabilitado = (campo) => {
    if (!modoEdicion || !recursoEditando) return false;

    const tipo = recursoEditando.tipo;

    if (campo === "tipo") return true; // Siempre deshabilitar tipo en edición
    if (campo === "laboratorio" || campo === "aula") {
      return tipo === "proyector"; // Proyector no puede editar lab/aula
    }
    if (campo === "contenido") {
      return tipo === "llave"; // Llave no puede editar contenido
    }

    return false;
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {modoEdicion ? `Editar ${recursoEditando?.nombre}` : "Crear Recurso"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Tipo de Recurso */}
            <div>
              <label className="block font-semibold mb-2">Tipo de Recurso</label>
              <select
                {...register("tipo")}
                disabled={isCampoDeshabilitado("tipo")}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isCampoDeshabilitado("tipo") ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="kit">Kit de Laboratorio</option>
                <option value="llave">Llave</option>
                <option value="proyector">Proyector</option>
              </select>
              {modoEdicion && (
                <p className="text-xs text-gray-500 mt-1">No se puede cambiar el tipo en modo edición</p>
              )}
            </div>

            {/* Laboratorio */}
            <div>
              <label className="block font-semibold mb-2">Laboratorio</label>
              {tipoActual === "proyector" || isCampoDeshabilitado("laboratorio") ? (
                <input
                  type="text"
                  disabled
                  value={tipoActual === "proyector" ? "No aplica" : laboratorioActual}
                  placeholder="No aplica"
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              ) : (
                <>
                  <select
                    {...register("laboratorio")}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.laboratorio ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Seleccionar laboratorio</option>
                    {labsDisponibles.map((lab) => (
                      <option key={lab.laboratorio} value={lab.laboratorio}>
                        {lab.laboratorio}
                      </option>
                    ))}
                  </select>
                  {errors.laboratorio && (
                    <p className="text-red-500 text-sm mt-1">{errors.laboratorio.message}</p>
                  )}
                </>
              )}
            </div>

            {/* Aula */}
            <div>
              <label className="block font-semibold mb-2">Aula</label>
              {tipoActual === "proyector" || isCampoDeshabilitado("aula") ? (
                <input
                  type="text"
                  disabled
                  value={tipoActual === "proyector" ? "No aplica" : watch("aula")}
                  placeholder="No aplica"
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              ) : (
                <input
                  type="text"
                  {...register("aula")}
                  readOnly
                  placeholder="Aula (auto-completada)"
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              )}
            </div>

            {/* Contenido */}
            <div>
              <label className="block font-semibold mb-2">Contenido</label>
              {tipoActual === "llave" || isCampoDeshabilitado("contenido") ? (
                <input
                  type="text"
                  disabled
                  placeholder="No aplica"
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className={`w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                      errors.contenido ? "ring-2 ring-red-500" : ""
                    }`}
                  >
                    Editar Contenido ({contenidoActual?.filter(c => c?.trim()).length || 0} items)
                  </button>
                  {errors.contenido && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contenido.message || "Debe agregar al menos un elemento"}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {modoEdicion ? "Actualizar Recurso" : "Crear Recurso"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Atrás
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Contenido */}
      {showModal && (tipoActual === "kit" || tipoActual === "proyector") && (
        <ModalContenido
          contenido={contenidoActual}
          onAdd={addContenidoField}
          onChange={handleContenidoChange}
          onRemove={removeContenidoField}
          onClose={() => {
            setShowModal(false);
            trigger("contenido");
          }}
          tipoRecurso={tipoActual}
        />
      )}
    </div>
  );
};

export default FormRecurso;