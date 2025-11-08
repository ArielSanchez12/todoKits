import { useRef, useState, useEffect } from "react"
import storeProfile from "../../context/storeProfile"
import ModalCropImage from "./ModalCropImage"
import ModalViewImage from "./ModalViewImage"

export const CardProfile = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
    const [previewCropData, setPreviewCropData] = useState(null) // ✅ NUEVO
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)
    
    const [showCropModal, setShowCropModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)
    const [originalFile, setOriginalFile] = useState(null)

    const userData = user?._doc || user || {}
    const userId = user?._doc?._id || user?._id

    useEffect(() => {
        setPreview(null)
        setPreviewCropData(null)
    }, [user])

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        
        if (!file) return
        
        if (!file.type.startsWith('image/')) {
            alert("Por favor selecciona una imagen válida")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen no debe superar los 5MB")
            return
        }

        setOriginalFile(file)
        const reader = new FileReader()
        reader.onload = () => {
            setImageToCrop(reader.result)
            setShowCropModal(true)
        }
        reader.readAsDataURL(file)
    }

    // ✅ MODIFICADO: Guardar imagen ORIGINAL + coordenadas de recorte
    const handleCropComplete = async (croppedAreaPixels) => {
        try {
            setShowCropModal(false)
            setLoading(true)

            const formData = new FormData()
            // ✅ Subir imagen ORIGINAL completa
            formData.append('avatar', originalFile)
            // ✅ Guardar coordenadas del recorte
            formData.append('cropData', JSON.stringify(croppedAreaPixels))
            formData.append('nombre', userData.nombre || '')
            formData.append('apellido', userData.apellido || '')
            formData.append('celular', userData.celular || '')
            formData.append('email', userData.email || '')

            await updateProfile(formData, userId)
            
            // Preview local temporal
            setPreview(URL.createObjectURL(originalFile))
            setPreviewCropData(croppedAreaPixels)
            
            window.location.reload()
        } catch (error) {
            console.error('Error al actualizar imagen:', error)
            alert("Error al procesar la imagen. Por favor intenta nuevamente.")
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

        const data = {
            nombre: userData.nombre || '',
            apellido: userData.apellido || '',
            celular: userData.celular || '',
            email: userData.email || '',
            removeAvatar: true
        }

        try {
            await updateProfile(data, userId)
            window.location.reload()
        } catch (error) {
            alert("Error al eliminar la imagen")
        } finally {
            setLoading(false)
        }
    }

    // ✅ Imagen completa original
    const avatarUrl =
        preview ||
        userData?.avatar ||
        "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    // ✅ Coordenadas de recorte para el círculo
    const cropData = previewCropData || userData?.cropData || null;

    const tieneAvatarPersonalizado = userData?.avatar && 
        userData.avatar !== "https://cdn-icons-png.flaticon.com/512/4715/4715329.png" &&
        userData.avatar !== null;

    // ✅ Calcular estilos para el recorte visual
    const getAvatarStyle = () => {
        if (!cropData) {
            return {
                objectFit: 'cover',
                objectPosition: 'center'
            };
        }

        // Calcular el porcentaje de posición basado en las coordenadas
        const xPercent = (cropData.x / (cropData.width * 2)) * 100;
        const yPercent = (cropData.y / (cropData.height * 2)) * 100;
        
        return {
            objectFit: 'cover',
            objectPosition: `${50 - xPercent}% ${50 - yPercent}%`,
            transform: `scale(${(cropData.zoom || 1) * 1.5})`
        };
    };

    return (
        <>
            <div className="bg-gray-200 border border-black h-auto p-4 flex flex-col items-center justify-between shadow-xl rounded-lg">
                <div className="relative">
                    {/* ✅ Círculo con recorte visual usando CSS */}
                    <div className="w-32 h-32 rounded-full border-2 border-gray-300 overflow-hidden mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                         onClick={() => setShowViewModal(true)}
                         title="Click para ver imagen completa">
                        <img
                            src={avatarUrl + `?t=${Date.now()}`}
                            alt="avatar"
                            className="w-full h-full"
                            style={getAvatarStyle()}
                        />
                    </div>

                    {/* 📷 Botón para cambiar foto */}
                    <label className="absolute bottom-0 right-0 bg-blue-400 text-white rounded-full p-2 cursor-pointer hover:bg-emerald-400 transition-colors">
                        {loading ? '⏳' : '📷'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
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
                    <b>Nombre:</b><p className="inline-block ml-3">{userData?.nombre || 'Sin nombre'}</p>
                </div>
                <div className="self-start">
                    <b>Apellido:</b><p className="inline-block ml-3">{userData?.apellido || 'Sin apellido'}</p>
                </div>
                <div className="self-start">
                    <b>Teléfono:</b><p className="inline-block ml-3">{userData?.celular || 'Sin teléfono'}</p>
                </div>
                <div className="self-start">
                    <b>Correo:</b><p className="inline-block ml-3">{userData?.email || 'Sin correo'}</p>
                </div>

                {loading && (
                    <div className="mt-3 text-sm text-gray-600 animate-pulse">
                        ⏳ Actualizando imagen...
                    </div>
                )}
            </div>

            <ModalCropImage
                imageSrc={imageToCrop}
                isOpen={showCropModal}
                onClose={() => {
                    setShowCropModal(false)
                    setImageToCrop(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                onCropComplete={handleCropComplete}
            />

            {/* ✅ Modal SIEMPRE muestra imagen completa original */}
            <ModalViewImage
                imageSrc={avatarUrl}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                userName={`${userData?.nombre || ''} ${userData?.apellido || ''}`}
            />
        </>
    )
}