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

const FormRecurso = ({ onBack }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset, trigger } = useForm({
    resolver: zodResolver(recursoFormSchema),
    mode: "onChange", // ✅ Validar en cada cambio
    defaultValues: {
      tipo: "kit",
      laboratorio: "",
      aula: "",
      contenido: [""],
    },
  });

  const { createRecurso, recursos, fetchRecursos } = storeRecursos();
  const [showModal, setShowModal] = useState(false);
  const [labsDisponibles, setLabsDisponibles] = useState([]);
  const tipoActual = watch("tipo");
  const laboratorioActual = watch("laboratorio");
  const contenidoActual = watch("contenido") || [""];

  // Actualizar laboratorios disponibles según tipo y recursos actuales
  useEffect(() => {
    const labsArray = tipoActual === "kit" ? LABS_KIT : LABS_LLAVE;
    const labsUsados = recursos
      ?.filter((r) => r.tipo === tipoActual)
      .map((r) => r.laboratorio)
      .filter(Boolean);

    const disponibles = labsArray.filter(
      (lab) => !labsUsados?.includes(lab.laboratorio)
    );

    setLabsDisponibles(disponibles);
  }, [tipoActual, recursos]);

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

  // Resetear campos cuando cambia el tipo
  useEffect(() => {
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
    // ✅ Validar después de resetear
    setTimeout(() => trigger(), 100);
  }, [tipoActual, setValue, trigger]);

  const handleContenidoChange = (index, value) => {
    const newContenido = [...contenidoActual];
    newContenido[index] = value;
    setValue("contenido", newContenido);
    // ✅ Validar después de cambiar
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
      let datosEnvio = { tipo: data.tipo };

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

      console.log("Enviando datos:", datosEnvio);

      await createRecurso(datosEnvio);

      setTimeout(async () => {
        try {
          await fetchRecursos();
        } catch (error) {
          console.error("Error al refrescar recursos:", error);
        }
      }, 500);

      reset({
        tipo: tipoActual,
        laboratorio: "",
        aula: "",
        contenido: tipoActual === "llave" ? [] : [""],
      });
    } catch (error) {
      console.error("Error en submit:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Crear Recurso</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Tipo de Recurso */}
            <div>
              <label className="block font-semibold mb-2">Tipo de Recurso</label>
              <select
                {...register("tipo")}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="kit">Kit de Laboratorio</option>
                <option value="llave">Llave</option>
                <option value="proyector">Proyector</option>
              </select>
            </div>

            {/* Laboratorio */}
            <div>
              <label className="block font-semibold mb-2">Laboratorio</label>
              {tipoActual === "proyector" ? (
                <input
                  type="text"
                  disabled
                  placeholder="No aplica"
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
              ) : (
                <>
                  <select
                    {...register("laboratorio")}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.laboratorio ? "border-red-500" : ""
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
              {tipoActual === "proyector" ? (
                <input
                  type="text"
                  disabled
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
              {tipoActual === "llave" ? (
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
                    className={`w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${errors.contenido ? "ring-2 ring-red-500" : ""
                      }`}
                  >
                    Editar Contenido ({contenidoActual?.filter(c => c?.trim()).length || 0} items)
                  </button>
                  {/* ✅ Mostrar error de contenido */}
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
              Crear Recurso
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
            trigger("contenido"); // ✅ Validar al cerrar modal
          }}
          tipoRecurso={tipoActual}
        />
      )}
    </div>
  );
};

export default FormRecurso;