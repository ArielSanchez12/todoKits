import { useState, useEffect, useRef } from "react";
import useFetch from "../../hooks/useFetch"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { generateAvatar, convertBlobToBase64 } from "../../helpers/consultarIA"
import { toast, ToastContainer } from "react-toastify"

export const Form = (docente) => {

    const [avatar, setAvatar] = useState({
        image: "https://cdn-icons-png.flaticon.com/512/4715/4715329.png",
        prompt: "",
        loading: false
    });

    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
    const { fetchDataBackend } = useFetch();

    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const selectedOption = watch("imageOption");
    const inputFileRef = useRef(null); // 🔧 referencia al input de archivo

    useEffect(() => {
        // Cuando cambia la opción de imagen, limpia la imagen subida
        if (selectedOption !== "upload") {
            setArchivoSeleccionado(null);
            setValue("imagen", null); // limpia en react-hook-form
            if (inputFileRef.current) {
                inputFileRef.current.value = null; // limpia visualmente
            }
        }
    }, [selectedOption]);

    const handleGenerateImage = async () => {
        setAvatar(prev => ({ ...prev, loading: true }));
        const blob = await generateAvatar(avatar.prompt);
        if (blob.type === "image/jpeg") {
            const imageUrl = URL.createObjectURL(blob);
            const base64Image = await convertBlobToBase64(blob);
            setAvatar(prev => ({ ...prev, image: imageUrl, loading: false }));
            setValue("avatarDocenteIA", base64Image);
        } else {
            toast.error("Error al generar la imagen, vuelve a intentarlo dentro de 1 minuto");
            setAvatar(prev => ({ ...prev, image: "https://cdn-icons-png.flaticon.com/512/4715/4715329.png", loading: false }));
            setValue("avatarDocenteIA", avatar.image);
        }
    };

    const registerDocente = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key === "imagen") {
                formData.append("imagen", data.imagen?.[0]); // puede ser undefined
            } else {
                formData.append(key, data[key]);
            }
        });

        let url = `${import.meta.env.VITE_BACKEND_URL}/docente/register`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const headers = {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${storedUser.state.token}`
        };

        let response;
        if (docente?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}/docente/update/${docente._id}`;
            response = await fetchDataBackend(url, formData, "PUT", headers);
        } else {
            response = await fetchDataBackend(url, formData, "POST", headers);
        }

        if (response) {
            setTimeout(() => {
                navigate("/dashboard/listar");
            }, 2000);
        }
    };

    useEffect(() => {
        if (docente) {
            reset({
                nombreDocente: docente?.nombreDocente,
                apellidoDocente: docente?.apellidoDocente,
                direccionDocente: docente?.direccionDocente,
                celularDocente: docente?.celularDocente,
                emailDocente: docente?.emailDocente,
            });
        }
    }, []);

    return (
        <form onSubmit={handleSubmit(registerDocente)}>
            <ToastContainer />

            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-black bg-gray-200 px-4 py-1 rounded-md">
                    Información del docente
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
                    <label className="mb-2 block text-base font-semibold">Dirección</label>
                    <input
                        type="text"
                        placeholder="Ingresa la dirección"
                        className="mb-2 block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                        {...register("direccionDocente", { required: "Este campo es obligatorio!" })}
                    />
                    {errors.direccionDocente && <p className="text-red-800 text-base mb-3">{errors.direccionDocente.message}</p>}
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

            <label className="mb-2 block text-base font-semibold mt-10">Imagen del docente</label>
            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        value="ia"
                        {...register("imageOption", { required: "Seleccione una opción" })}
                    />
                    Generar con IA
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        value="upload"
                        {...register("imageOption", { required: "Seleccione una opción" })}
                    />
                    Subir Imagen
                </label>
            </div>
            {errors.imageOption && <p className="text-red-800 text-base mb-3">{errors.imageOption.message}</p>}

            {selectedOption === "ia" && (
                <div className="mt-5">
                    <label className="mb-2 block text-base font-semibold">Imagen con IA</label>
                    <div className="flex items-center gap-10 mb-5">
                        <input
                            type="text"
                            placeholder="¿Qué deseas generar con IA?"
                            className="mb-2 block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                            value={avatar.prompt}
                            onChange={(e) => setAvatar(prev => ({ ...prev, prompt: e.target.value }))}
                        />
                        <button
                            type="button"
                            className="py-2 px-8 bg-black hover:bg-red-700 text-white border rounded-xl hover:scale-105 duration-300 hover:bg-gray-900 hover:text-white sm:w-80"
                            onClick={handleGenerateImage}
                            disabled={avatar.loading}
                        >
                            {avatar.loading ? "Generando..." : "Generar con IA"}
                        </button>
                    </div>
                    {avatar.image && (
                        <img src={avatar.image} alt="Avatar IA" width={100} height={100} />
                    )}
                </div>
            )}

            {selectedOption === "upload" && (
                <div className="mt-5">
                    <label className="mb-2 block text-base font-semibold">Subir Imagen</label>
                    <label className="inline-block px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-red-700 transition hover:scale-105 duration-300">
                        Elegir imagen
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            {...register("imagen")}
                            onChange={(e) => {
                                setArchivoSeleccionado(e.target.files[0]?.name || null);
                            }}
                            ref={inputFileRef}
                        />
                    </label>
                    {archivoSeleccionado && (
                        <p className="text-green-600 text-base mt-2">Archivo seleccionado: {archivoSeleccionado}</p>
                    )}
                </div>
            )}

            <input
                type="submit"
                className="bg-black w-full p-2 mt-7 mb-7 text-white uppercase font-bold rounded-lg 
                hover:scale-[1.03] duration-300 hover:bg-blue-600 cursor-pointer transition-all"
                value={docente ? "Actualizar" : "Registrar"}
            />
        </form>
    );
};
