import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import {generateAvatar,convertBlobToBase64} from "../../helpers/consultarIA"
import { toast, ToastContainer } from "react-toastify"


export const Form = (docente) => {

    const [avatar, setAvatar] = useState({
        image: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png",
        prompt: "",
        loading: false
    })

    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm()
    const { fetchDataBackend } = useFetch()


    const selectedOption = watch("imageOption")


    const handleGenerateImage = async () => {
        setAvatar(prev => ({ ...prev, loading: true }))
        const blob = await generateAvatar(avatar.prompt)
        if (blob.type === "image/jpeg") {
            const imageUrl = URL.createObjectURL(blob)
            const base64Image = await convertBlobToBase64(blob)           
            setAvatar(prev => ({ ...prev, image: imageUrl, loading: false }))
            setValue("avatarDocenteIA", base64Image) // Cambiado aquí
        }
        else {
            toast.error("Error al generar la imagen, vuelve a intentarlo dentro de 1 minuto");
            setAvatar(prev => ({ ...prev, image: "https://cdn-icons-png.flaticon.com/512/2138/2138440.png", loading: false }))
            setValue("avatarDocenteIA", avatar.image) // Cambiado aquí
        }
    }



    const registerPatient = async (data) => {
        const formData = new FormData();
        // Enviar los campos del formulario
        Object.keys(data).forEach((key) => {
            // Subida manual de imagen
            if (key === "imagen" && data.imagen && data.imagen.length > 0) {
                formData.append("avatarDocente", data.imagen[0]);
            } 
            // Imagen generada por IA
            else if (key === "avatarMascotaIA" && data.avatarMascotaIA) {
                formData.append("avatarDocenteIA", data.avatarMascotaIA);
            } 
            // Otros campos
            else if (key !== "imagen" && key !== "avatarMascotaIA") {
                formData.append(key, data[key]);
            }
        })
        let url = `${import.meta.env.VITE_BACKEND_URL}/docente/register`
        const storedUser = JSON.parse(localStorage.getItem("auth-token"))
        const headers= {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${storedUser.state.token}`
            }
        
        let response
        if (docente?._id) {
            url = `${import.meta.env.VITE_BACKEND_URL}/docente/update/${docente._id}`
            response = await fetchDataBackend(url, formData, "PUT", headers)
        }
        else{
            response = await fetchDataBackend(url, formData, "POST", headers)
        }
        if (response) {
            setTimeout(() => {
                navigate("/dashboard/listar")
            }, 2000);
        }
    }

    useEffect(() => {
        if (docente) {
            reset({
                cedulaPropietario: docente?.cedulaPropietario,
                nombrePropietario: docente?.nombrePropietario,
                emailPropietario: docente?.emailPropietario,
                celularPropietario: docente?.celularPropietario,
                nombreMascota: docente?.nombreMascota,
                tipoMascota: docente?.tipoMascota,
                fechaNacimientoMascota: new Date(docente?.fechaNacimientoMascota).toLocaleDateString('en-CA', {timeZone: 'UTC'}),
                sintomasMascota: docente?.sintomasMascota
            })
        }
    }, [])


    return (
        <form onSubmit={handleSubmit(registerPatient)}>
            <ToastContainer />

            {/* Información del docente */}
            <fieldset className="border-2 border-gray-500 p-6 rounded-lg shadow-lg">
                <legend className="text-xl font-bold text-gray-700 bg-gray-200 px-4 py-1 rounded-md">
                    Información del docente
                </legend>

                {/* Nombre */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Nombre</label>
                    <input
                        type="text"
                        placeholder="Ingresa el nombre"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("nombreDocente", { required: "El nombre es obligatorio" })}
                    />
                    {errors.nombreDocente && <p className="text-red-800">{errors.nombreDocente.message}</p>}
                </div>

                {/* Apellido */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Apellido</label>
                    <input
                        type="text"
                        placeholder="Ingresa el apellido"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("apellidoDocente", { required: "El apellido es obligatorio" })}
                    />
                    {errors.apellidoDocente && <p className="text-red-800">{errors.apellidoDocente.message}</p>}
                </div>

                {/* Dirección */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Dirección</label>
                    <input
                        type="text"
                        placeholder="Ingresa la dirección"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("direccionDocente", { required: "La dirección es obligatoria" })}
                    />
                    {errors.direccionDocente && <p className="text-red-800">{errors.direccionDocente.message}</p>}
                </div>

                {/* Celular */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Celular</label>
                    <input
                        type="text"
                        placeholder="Ingresa el celular"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("celularDocente", { required: "El celular es obligatorio" })}
                    />
                    {errors.celularDocente && <p className="text-red-800">{errors.celularDocente.message}</p>}
                </div>

                {/* Correo electrónico */}
                <div>
                    <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="Ingresa el correo electrónico"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("emailDocente", { required: "El correo electrónico es obligatorio" })}
                    />
                    {errors.emailDocente && <p className="text-red-800">{errors.emailDocente.message}</p>}
                </div>
            </fieldset>

            {/* Imagen del docente */}
            <label className="mb-2 block text-sm font-semibold mt-10">Imagen del docente</label>
            <div className="flex gap-4 mb-2">
                {/* Opción: Imagen con IA */}
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        value="ia"
                        {...register("imageOption", { required: "Seleccione una opción" })}
                    />
                    Generar con IA
                </label>
                {/* Opción: Subir Imagen */}
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        value="upload"
                        {...register("imageOption", { required: "Seleccione una opción" })}
                    />
                    Subir Imagen
                </label>
            </div>
            {errors.imageOption && <p className="text-red-800">{errors.imageOption.message}</p>}

            {/* Imagen con IA */}
            {selectedOption === "ia" && (
                <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold">Imagen con IA</label>
                    <div className="flex items-center gap-10 mb-5">
                        <input
                            type="text"
                            placeholder="Ingresa el prompt"
                            className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500"
                            value={avatar.prompt}
                            onChange={(e) => setAvatar(prev => ({ ...prev, prompt: e.target.value }))}
                        />
                        <button
                            type="button"
                            className="py-1 px-8 bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white sm:w-80"
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

            {/* Subir Imagen */}
            {selectedOption === "upload" && (
                <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold">Subir Imagen</label>
                    <input
                        type="file"
                        className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5"
                        {...register("imagen")}
                    />
                </div>
            )}

            {/* Botón de submit */}
            <input
                type="submit"
                className="bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg 
                hover:bg-gray-600 cursor-pointer transition-all"
                value={docente ? "Actualizar" : "Registrar"}
            />
        </form>

    )
}