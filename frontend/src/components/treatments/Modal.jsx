import { useForm } from "react-hook-form";
import storeTreatments from "../../context/storeTreatments";

const ModalTreatments = ({ docenteID }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { toggleModal, registerTreatments } = storeTreatments();

    const registerTreatmentsForm = (data) => {
        const newData = { ...data, docente: docenteID };
        registerTreatments(newData);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <div className="w-full max-w-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 bg-opacity-95 rounded-2xl shadow-xl p-8 overflow-y-auto animate-fadeScale">

                    <p className="text-white font-bold text-lg text-center mb-6">Tratamientos</p>

                    <form onSubmit={handleSubmit(registerTreatmentsForm)} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Nombre del tratamiento</label>
                            <input
                                type="text"
                                placeholder="Ingresa el nombre"
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("nombre", { required: "El nombre es obligatorio" })}
                            />
                            {errors.nombre && <p className="text-red-400 text-base mt-1">{errors.nombre.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Descripción</label>
                            <textarea
                                placeholder="Ingresa la descripción"
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("descripcion", { required: "La descripción es obligatoria" })}
                            />
                            {errors.descripcion && <p className="text-red-400 text-base mt-1">{errors.descripcion.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Prioridad</label>
                            <select
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("prioridad", { required: "La prioridad es obligatoria" })}
                            >
                                <option value="">--- Seleccionar ---</option>
                                <option value="Baja">Baja</option>
                                <option value="Media">Media</option>
                                <option value="Alta">Alta</option>
                            </select>
                            {errors.prioridad && <p className="text-red-400 text-base mt-1">{errors.prioridad.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Precio</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="Ingresa el precio"
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("precio", {
                                    required: "El precio es obligatorio",
                                    min: { value: 0, message: "El precio no puede ser negativo" }
                                })}
                            />
                            {errors.precio && <p className="text-red-400 text-base mt-1">{errors.precio.message}</p>}
                        </div>

                        <div className="flex justify-center gap-4 pt-4">
                            <input
                                type="submit"
                                className="bg-blue-700 px-6 py-2 text-white rounded-lg hover:bg-blue-900 cursor-pointer transition-all duration-200"
                                value="Registrar"
                            />
                            <button
                                type="button"
                                onClick={() => toggleModal()}
                                className="bg-red-600 px-6 py-2 text-white rounded-lg hover:bg-red-800 transition-all duration-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animación con estilo embebido */}
            <style>
                {`
                @keyframes fadeScale {
                    0% {
                        opacity: 0;
                        transform: scale(0.85);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fadeScale {
                    animation: fadeScale 0.35s ease-out forwards;
                }
                `}
            </style>
        </>
    );
};

export default ModalTreatments;
