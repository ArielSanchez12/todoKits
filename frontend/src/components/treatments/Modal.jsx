import { useForm } from "react-hook-form";
import storeTreatments from "../../context/storeTreatments";
import { useEffect } from "react";

const ModalTreatments = ({ docenteID }) => {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
    const { toggleModal, registerTreatments } = storeTreatments();

    // Observar los campos de créditos y precio por crédito
    const numeroCreditos = watch("numeroCreditos");
    const precioPorCredito = watch("precioPorCredito");

    // Calcular el precio automáticamente
    useEffect(() => {
        const n = parseFloat(numeroCreditos) || 0;
        const p = parseFloat(precioPorCredito) || 0;
        setValue("precioTotal", n * p);
    }, [numeroCreditos, precioPorCredito, setValue]);

    const registerTreatmentsForm = (data) => {
        const newData = { ...data, docente: docenteID };
        registerTreatments(newData);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <div className="w-full max-w-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 bg-opacity-95 rounded-2xl shadow-xl p-8 overflow-y-auto animate-fadeScale">

                    <p className="text-white font-bold text-lg text-center mb-6">Registro de la Materia</p>

                    <form onSubmit={handleSubmit(registerTreatmentsForm)} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Nombre de la materia</label>
                            <input
                                type="text"
                                placeholder="Ingresa el nombre"
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("nombreMateria", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.nombreMateria && <p className="text-red-400 text-base mt-1">{errors.nombreMateria.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Motivo de perdida de la materia</label>
                            <textarea
                                placeholder="Ingresa la descripción"
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("motivo", { required: "Este campo es obligatorio!" })}
                            />
                            {errors.motivo && <p className="text-red-400 text-base mt-1">{errors.motivo.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Tipo de recuperación</label>
                            <select
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("tipoRecuperacion", { required: "Este campo es obligatorio!" })}
                            >
                                <option value="">--- Seleccionar ---</option>
                                <option value="Ninguna">Ninguna</option>
                                <option value="Repetición regular">Repetición regular</option>
                                <option value="Examen supletorio">Examen supletorio</option>
                                <option value="Curso de recuperación intensivo">Curso de recuperación intensivo</option>
                            </select>
                            {errors.tipoRecuperacion && <p className="text-red-400 text-base mt-1">{errors.tipoRecuperacion.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Número de créditos</label>
                            <input
                                type="text"
                                min="0"
                                placeholder="Ingres el número de créditos"
                                className="block w-full rounded-md border border-gray-600 py-2 px-3 text-gray-900 bg-gray-200"
                                {...register("numeroCreditos", { required: "Este campo es obligatorio!", min: { value: 1, message: "Debe ser al menos 1" } })}
                            />
                            {errors.numeroCreditos && <p className="text-red-400 text-base mt-1">{errors.numeroCreditos.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Precio por crédito</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    min="0"
                                    step="any"
                                    placeholder="ingrese el precio por crédito"
                                    className="block w-full rounded-md border border-gray-600 py-2 pl-8 pr-3 text-gray-900 bg-gray-200"
                                    {...register("precioPorCredito", { required: "Este campo es obligatorio!", min: { value: 1, message: "Debe ser mayor a 0" } })}
                                />
                            </div>
                            {errors.precioPorCredito && <p className="text-red-400 text-base mt-1">{errors.precioPorCredito.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-semibold text-gray-200">Precio total</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    step="any"
                                    placeholder=""
                                    className="block w-full rounded-md border border-gray-600 py-2 pl-8 pr-3 text-gray-900 bg-gray-200"
                                    {...register("precioTotal", {
                                        required: "El precio es obligatorio",
                                        min: { value: 0, message: "El precio no puede ser negativo" }
                                    })}
                                    readOnly
                                />
                            </div>
                            {errors.precioTotal && <p className="text-red-400 text-base mt-1">{errors.precioTotal.message}</p>}
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