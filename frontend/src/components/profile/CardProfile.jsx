import { useRef, useState, useEffect } from "react"
import storeProfile from "../../context/storeProfile"

export const CardProfile = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)

    const userData = user?._doc || user || {}

    // ✅ DEPURACIÓN: Ver datos del usuario
    useEffect(() => {
        console.log("🔍 USER DATA:", userData)
        console.log("🔍 USER ID:", user?._id)
        console.log("🔍 Avatar actual:", userData?.avatar)
    }, [user])

    useEffect(() => {
        setPreview(null)
    }, [user])

    const handleImageChange = async (e) => {
        console.log("📷 handleImageChange iniciado")
        const file = e.target.files[0]

        // ✅ VALIDACIONES CON LOGS
        if (!file) {
            console.log("❌ No se seleccionó ningún archivo")
            return
        }
        console.log("✅ Archivo seleccionado:", file.name, file.type, file.size)

        if (!user?._id) {
            console.log("❌ No hay ID de usuario disponible")
            console.log("🔍 User completo:", user)
            return
        }
        console.log("✅ ID de usuario:", user._id)

        // ✅ VALIDAR TIPO DE ARCHIVO
        if (!file.type.startsWith('image/')) {
            console.log("❌ El archivo no es una imagen válida")
            alert("Por favor selecciona una imagen válida")
            return
        }

        // ✅ VALIDAR TAMAÑO (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            console.log("❌ Archivo muy grande:", file.size)
            alert("La imagen no debe superar los 5MB")
            return
        }

        setLoading(true)
        console.log("⏳ Iniciando carga...")

        const formData = new FormData()
        formData.append('avatar', file)
        formData.append('nombre', userData.nombre || '')
        formData.append('apellido', userData.apellido || '')
        formData.append('celular', userData.celular || '')
        formData.append('email', userData.email || '')

        // ✅ VER CONTENIDO DEL FORMDATA
        console.log("📦 FormData creado:")
        for (let pair of formData.entries()) {
            console.log(`  ${pair[0]}:`, pair[1])
        }

        try {
            console.log("🚀 Llamando a updateProfile...")
            const response = await updateProfile(formData, user._id)
            console.log("✅ Respuesta de updateProfile:", response)

            setPreview(URL.createObjectURL(file))
            console.log("🖼️ Preview establecido")

            console.log("🔄 Recargando página...")
            window.location.reload()
        } catch (error) {
            console.error("❌ Error al actualizar la imagen:", error)
            console.error("📋 Detalles del error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            })
            alert("Error al actualizar la imagen. Revisa la consola para más detalles.")
        } finally {
            setLoading(false)
            console.log("✅ Loading finalizado")
        }
    }

    // ✅ NUEVA FUNCIÓN: Eliminar avatar
    const handleRemoveAvatar = async () => {
        if (!window.confirm("¿Estás seguro de eliminar tu foto de perfil?")) {
            return
        }

        console.log("🗑️ Eliminando avatar...")
        setLoading(true)

        const formData = new FormData()
        formData.append('avatar', '') // Enviar cadena vacía para eliminar
        formData.append('nombre', userData.nombre || '')
        formData.append('apellido', userData.apellido || '')
        formData.append('celular', userData.celular || '')
        formData.append('email', userData.email || '')

        try {
            console.log("🚀 Eliminando avatar...")
            await updateProfile(formData, user._id)
            console.log("✅ Avatar eliminado")
            window.location.reload()
        } catch (error) {
            console.error("❌ Error al eliminar avatar:", error)
            alert("Error al eliminar la imagen")
        } finally {
            setLoading(false)
        }
    }

    const avatarUrl =
        (userData?.avatarDocente && typeof userData.avatarDocente === 'string' && userData.avatarDocente.startsWith('http'))
            ? userData.avatarDocente
            : (preview ||
                userData?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/4715/4715329.png");

    // ✅ VERIFICAR SI TIENE AVATAR PERSONALIZADO
    const tieneAvatarPersonalizado = userData?.avatar &&
        userData.avatar !== "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    console.log("🖼️ Avatar URL final:", avatarUrl)
    console.log("🎨 Tiene avatar personalizado:", tieneAvatarPersonalizado)

    return (
        <div className="bg-gray-200 border border-black h-auto p-4 flex flex-col items-center justify-between shadow-xl rounded-lg">
            <div className="relative">
                <img
                    src={avatarUrl + `?t=${Date.now()}`}
                    alt="avatar"
                    className="w-32 h-32 max-w-full max-h-40 rounded-full border-2 border-gray-300 object-cover mx-auto"
                    style={{ aspectRatio: '1/1' }}
                />

                {/* ✅ BOTÓN PARA CAMBIAR FOTO */}
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

                {/* ✅ NUEVO BOTÓN PARA ELIMINAR FOTO (solo si tiene avatar personalizado) */}
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
                <b>Nombre:</b><p className="inline-block ml-3">{userData?.nombre || userData?.nombreDocente || 'Sin nombre'}</p>
            </div>
            <div className="self-start">
                <b>Apellido:</b><p className="inline-block ml-3">{userData?.apellido || userData?.apellidoDocente || 'Sin apellido'}</p>
            </div>
            <div className="self-start">
                <b>Teléfono:</b><p className="inline-block ml-3">{userData?.celular || userData?.celularDocente || 'Sin teléfono'}</p>
            </div>
            <div className="self-start">
                <b>Correo:</b><p className="inline-block ml-3">{userData?.email || userData?.emailDocente || 'Sin correo'}</p>
            </div>

            {/* ✅ INDICADOR DE ESTADO DE CARGA */}
            {loading && (
                <div className="mt-3 text-sm text-gray-600 animate-pulse">
                    ⏳ Actualizando imagen...
                </div>
            )}
        </div>
    )
}