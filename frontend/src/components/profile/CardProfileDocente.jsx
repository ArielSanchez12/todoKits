import { useRef, useState, useEffect } from "react"
import storeProfile from "../../context/storeProfile"

export const CardProfileDocente = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)

    const userData = user?._doc || user || {}
    const userId = user?._doc?._id || user?._id

    useEffect(() => {
        setPreview(null)
    }, [user])

    const handleImageChange = async (e) => {
        const file = e.target.files[0]

        if (!file) return
        if (!userId) {
            alert("Error: No se pudo identificar el usuario")
            return
        }

        if (!file.type.startsWith('image/')) {
            alert("Por favor selecciona una imagen válida")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen no debe superar los 5MB")
            return
        }

        setLoading(true)

        // ✅ FormData con el campo correcto para docente
        const formData = new FormData()
        formData.append('avatarDocente', file)

        try {
            await updateProfile(formData, userId)
            setPreview(URL.createObjectURL(file))
            window.location.reload()
        } catch (error) {
            alert("Error al actualizar la imagen. Por favor intenta nuevamente.")
            setLoading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (!window.confirm("¿Estás seguro de eliminar tu foto de perfil?")) {
            return
        }

        if (!userId) {
            alert("Error: No se pudo identificar el usuario")
            return
        }

        setLoading(true)

        // ✅ Enviar removeAvatar como JSON
        const data = {
            removeAvatar: true
        }

        try {
            await updateProfile(data, userId)
            window.location.reload()
        } catch (error) {
            alert("Error al eliminar la imagen")
            setLoading(false)
        }
    }

    // ✅ Prioridad: avatarDocente > avatar > imagen por defecto
    const avatarUrl =
        preview ||
        userData?.avatarDocente ||
        userData?.avatar ||
        "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    // ✅ Verificar si tiene avatar personalizado
    const tieneAvatarPersonalizado =
        (userData?.avatarDocente &&
            userData.avatarDocente !== "https://cdn-icons-png.flaticon.com/512/4715/4715329.png" &&
            userData.avatarDocente !== null) ||
        (userData?.avatar &&
            userData.avatar !== "https://cdn-icons-png.flaticon.com/512/4715/4715329.png" &&
            userData.avatar !== null);

    return (
        <div className="bg-gray-200 border border-black h-auto p-4 flex flex-col items-center justify-between shadow-xl rounded-lg">
            <div className="relative">
                <img
                    src={avatarUrl + `?t=${Date.now()}`}
                    alt="avatar"
                    className="w-32 h-32 max-w-full max-h-40 rounded-full border-2 border-gray-300 object-cover mx-auto"
                    style={{ aspectRatio: '1/1' }}
                />

                {/* 📷 Botón para cambiar foto */}
                <label className="absolute bottom-0 right-0 bg-blue-400 text-white rounded-full p-2 cursor-pointer hover:bg-emerald-400 transition-colors">
                    {loading ? '⏳' : '📷'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        disabled={loading}
                    />
                </label>

                {/* 🗑️ Botón para eliminar foto */}
                {tieneAvatarPersonalizado && !loading && (
                    <button
                        onClick={handleRemoveAvatar}
                        className="absolute bottom-0 left-0 bg-red-500 text-white rounded-full p-2 cursor-pointer hover:bg-red-600 transition-colors"
                        title="Eliminar foto de perfil"
                    >
                        🗑️
                    </button>
                )}
            </div>

            <div className="self-start mt-4">
                <b>Nombre:</b>
                <p className="inline-block ml-3">
                    {userData?.nombreDocente || userData?.nombre || 'Sin nombre'}
                </p>
            </div>
            <div className="self-start">
                <b>Apellido:</b>
                <p className="inline-block ml-3">
                    {userData?.apellidoDocente || userData?.apellido || 'Sin apellido'}
                </p>
            </div>
            <div className="self-start">
                <b>Teléfono:</b>
                <p className="inline-block ml-3">
                    {userData?.celularDocente || userData?.celular || 'Sin teléfono'}
                </p>
            </div>
            <div className="self-start">
                <b>Correo:</b>
                <p className="inline-block ml-3">
                    {userData?.emailDocente || userData?.email || 'Sin correo'}
                </p>
            </div>

            {loading && (
                <div className="mt-3 text-sm text-gray-600 animate-pulse">
                    ⏳ Actualizando imagen...
                </div>
            )}
        </div>
    )
}