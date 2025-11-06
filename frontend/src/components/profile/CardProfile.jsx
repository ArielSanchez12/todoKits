import { useRef, useState, useEffect } from "react"
import storeProfile from "../../context/storeProfile"

export const CardProfile = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)

    const userData = user?._doc || user || {}

    useEffect(() => {
        setPreview(null)
    }, [user])

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file && user?._id) {
            setLoading(true)
            const formData = new FormData()
            formData.append('avatar', file)
            formData.append('nombre', user.nombre || '')
            formData.append('apellido', user.apellido || '')
            formData.append('celular', user.celular || '')
            formData.append('email', user.email || '')

            try {
                await updateProfile(formData, user._id)
                setPreview(URL.createObjectURL(file))
                window.location.reload()
            } catch (error) {
                console.error("Error al actualizar la imagen:", error)
            } finally {
                setLoading(false)
            }
        }
    }

    const avatarUrl =
        (userData?.avatarDocente && typeof userData.avatarDocente === 'string' && userData.avatarDocente.startsWith('http'))
            ? userData.avatarDocente
            : (preview ||
                userData?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/4715/4715329.png");

    return (
        // ✅ DISEÑO HORIZONTAL: Avatar a la izquierda, datos a la derecha
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 p-6 flex items-center gap-8 shadow-xl rounded-lg">
            {/* ✅ Avatar con botón de cámara */}
            <div className="relative flex-shrink-0">
                <img
                    src={avatarUrl + `?t=${Date.now()}`}
                    alt="avatar"
                    className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-lg"
                    style={{ aspectRatio: '1/1' }}
                />
                <label className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-3 cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-110">
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
            </div>

            {/* ✅ Información del usuario en grid 2x2 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Nombre</p>
                    <p className="text-lg font-bold text-gray-800">
                        {userData?.nombre || userData?.nombreDocente || 'Sin nombre'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Apellido</p>
                    <p className="text-lg font-bold text-gray-800">
                        {userData?.apellido || userData?.apellidoDocente || 'Sin apellido'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Teléfono</p>
                    <p className="text-lg font-bold text-gray-800">
                        {userData?.celular || userData?.celularDocente || 'Sin teléfono'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Correo</p>
                    <p className="text-sm font-bold text-gray-800 break-all">
                        {userData?.email || userData?.emailDocente || 'Sin correo'}
                    </p>
                </div>
            </div>
        </div>
    )
}