import { useRef, useState, useEffect } from "react"
import storeProfile from "../../context/storeProfile"



export const CardProfile = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)

    // Si el user contiene _doc, usa los datos de _doc, de lo contrario usa el user directamente
    const userData = user?._doc || user || {}

    // Reset preview cuando cambia user (después de actualizar)
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
                //recarga la página para ver la nueva imagen
                //si sirvió, ya se recarga sola y se muestra la nueva imagen, ademas direccion ya se borro de perfil
                window.location.reload()
            } catch (error) {
                console.error("Error al actualizar la imagen:", error)
            } finally {
                setLoading(false)
            }
        }
    }

    // Prioriza avatarDocente, luego preview, luego imagen por defecto
    const avatarUrl =
        (userData?.avatarDocente && typeof userData.avatarDocente === 'string' && userData.avatarDocente.startsWith('http'))
            ? userData.avatarDocente
            : (preview ||
                userData?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/4715/4715329.png");

    return (
        <div className="bg-gray-200 border border-black h-auto p-4 flex flex-col items-center justify-between shadow-xl rounded-lg">
            <div className="relative">
                <img
                    src={avatarUrl + `?t=${Date.now()}`}
                    alt="avatar"
                    className="w-32 h-32 max-w-full max-h-40 rounded-full border-2 border-gray-300 object-cover mx-auto"
                    style={{ aspectRatio: '1/1' }}
                />
                <label className="absolute bottom-0 right-0 bg-blue-400 text-white rounded-full p-2 cursor-pointer hover:bg-emerald-400">
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
            <div className="self-start">
                <b>Nombre:</b><p className="inline-block ml-3">{userData?.nombre || userData?.nombreDocente || 'Sin nombre'}</p>
            </div>
            <div className="self-start">
                <b>Apellido:</b><p className="inline-block ml-3">{userData?.apellido || userData?.apellidoDocente || 'Sin apellido'}</p>
            </div >
            <div className="self-start">
                <b>Teléfono:</b><p className="inline-block ml-3">{userData?.celular || userData?.celularDocente || 'Sin teléfono'}</p>
            </div>
            <div className="self-start">
                <b>Correo:</b><p className="inline-block ml-3">{userData?.email || userData?.emailDocente || 'Sin correo'}</p>
            </div>
        </div>
    )
}