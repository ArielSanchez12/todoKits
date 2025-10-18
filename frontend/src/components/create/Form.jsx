import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "../../schemas/formSchema";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export const Form = ({ docente }) => {

    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombreDocente: docente?.nombreDocente || "",
            apellidoDocente: docente?.apellidoDocente || "",
            celularDocente: docente?.celularDocente || "",
            emailDocente: docente?.emailDocente || "",
            imagen: null,
        }
    });

    const { fetchDataBackend } = useFetch();
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        // Validaciones
        if (!file) {
            setArchivoSeleccionado(null);
            return;
        }

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor selecciona un archivo de imagen válido");
            setArchivoSeleccionado(null);
            e.target.value = "";
            return;
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("La imagen no debe superar 5MB");
            setArchivoSeleccionado(null);
            e.target.value = "";
            return;
        }

        // Si pasa todas las validaciones, guardar el archivo
        setArchivoSeleccionado({
            name: file.name,
            size: (file.size / 1024).toFixed(2) // Tamaño en KB
        });
    };

    const handleRemoveFile = () => {
        setArchivoSeleccionado(null);
        // Limpiar el input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        // Limpiar el valor del formulario
        setValue("imagen", null);
    };

    const registerDocente = async (data) => {
        try {
            const formData = new FormData();

            // Agregar campos de texto
            formData.append("nombreDocente", data.nombreDocente);
            formData.append("apellidoDocente", data.apellidoDocente);
            formData.append("celularDocente", data.celularDocente);
            formData.append("emailDocente", data.emailDocente);

            // Agregar imagen si existe
            if (data.imagen?.[0]) {
                formData.append("imagen", data.imagen[0]);
            }

            // Obtener token de autenticación
            const storedAuth = JSON.parse(localStorage.getItem("auth-token"));

            // Verificar que existe el token
            if (!storedAuth?.state?.token) {
                toast.error("No se encontró token de autenticación");
                return;
            }

            const token = storedAuth.state.token;

            // URL para la petición
            let url = `${import.meta.env.VITE_BACKEND_URL}/administrador/registerDocente`;

            let response;
            if (docente?._id) {
                url = `${import.meta.env.VITE_BACKEND_URL}/administrador/updateDocente/${docente._id}`;

                // Usar directamente axios para mayor control
                const axiosConfig = {
                    method: 'PUT',
                    url: url,
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                };

                response = await axios(axiosConfig);
            } else {
                // Usar directamente axios para mayor control
                const axiosConfig = {
                    method: 'POST',
                    url: url,
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                };

                response = await axios(axiosConfig);
            }

            if (response) {
                toast.success(docente ? "Docente actualizado correctamente" : "Docente registrado correctamente");
                setTimeout(() => {
                    navigate("/dashboard/listar");
                }, 2000);
            }
        } catch (error) {
            console.error("Error al registrar docente:", error);
            toast.error(error.response?.data?.msg || "Error al procesar la solicitud");
        }
    };

    useEffect(() => {
        if (docente) {
            reset({
                nombreDocente: docente?.nombreDocente || "",
                apellidoDocente: docente?.apellidoDocente || "",
                celularDocente: docente?.celularDocente || "",
                emailDocente: docente?.emailDocente || "",
                imagen: null,
            });
            setArchivoSeleccionado(null);
        }
    }, [docente, reset]);

    return (
        <form onSubmit={handleSubmit(registerDocente)}>
            <ToastContainer />

            {/* Información del docente */}
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-black bg-gray-200 px-4 py-1 rounded-md">
                    Información del Docente
                </legend>

                <div>
                    <label className="mb-2 block text-base font-semibold">Nombre</label>
                    <input
                        type="text"
                        placeholder="Ingresa el nombre"
                        className="mb-2 block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("nombreDocente", { required: "Este campo es obligatorio!" })}
                    />
                    {errors.nombreDocente && <p className="text-red-800 text-base mb-3">{errors.nombreDocente.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-base font-semibold">Apellido</label>
                    <input
                        type="text"
                        placeholder="Ingresa el apellido"
                        className="mb-2 block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("apellidoDocente", { required: "Este campo es obligatorio!" })}
                    />
                    {errors.apellidoDocente && <p className="text-red-800 text-base mb-3">{errors.apellidoDocente.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-base font-semibold">Celular</label>
                    <input
                        type="text"
                        placeholder="Ingresa el celular"
                        className="mb-2 block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("celularDocente", { required: "Este campo es obligatorio!" })}
                    />
                    {errors.celularDocente && <p className="text-red-800 text-base mb-3">{errors.celularDocente.message}</p>}
                </div>

                <div>
                    <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa el correo electrónico"
                        className="mb-2 block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("emailDocente", { required: "Este campo es obligatorio!" })}
                    />
                    {errors.emailDocente && <p className="text-red-800 text-base mb-3">{errors.emailDocente.message}</p>}
                </div>
            </fieldset>

            {/* Imagen del docente */}
            <div className="mt-10">
                <label className="mb-2 block text-base font-semibold">Imagen del docente (opcional)</label>
                <p className="text-gray-600 text-sm mb-3">Si no subes una imagen, se utilizará la imagen por defecto.</p>

                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        {...register("imagen")}
                        onChange={handleFileChange}
                    />
                </div>

                {/* Mensajes de validación */}
                {errors.imagen && (
                    <p className="text-red-500 text-sm mt-2">{errors.imagen.message}</p>
                )}

                {/* Archivo seleccionado */}
                {archivoSeleccionado ? (
                    <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-300 rounded-md p-3">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-green-600"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 00-2 2v4a1 1 0 001 1h12a1 1 0 00-1-1V6a2 2 0 00-2-2H4zm12 4h.01M4 10a1 1 0 000 2h12a1 1 0 100-2H4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <p className="text-green-800 font-semibold text-sm">{archivoSeleccionado.name}</p>
                                <p className="text-green-700 text-xs">{archivoSeleccionado.size} KB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-1 transition-colors"
                            title="Eliminar archivo"
                        >
                            <svg
                                className="w-5 h-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm mt-3">Ningún archivo seleccionado</p>
                )}
            </div>

            <input
                type="submit"
                className="bg-black w-full p-2 mt-7 mb-7 text-white uppercase font-bold rounded-lg 
                hover:scale-[1.03] duration-300 hover:bg-blue-600 cursor-pointer transition-all"
                value={docente ? "Actualizar" : "Registrar"}
            />
        </form>
    );
};