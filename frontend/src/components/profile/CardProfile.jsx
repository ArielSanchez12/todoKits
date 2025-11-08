import { useRef, useState, useEffect } from "react"
import storeProfile from "../../context/storeProfile"
import ModalCropImage from "./ModalCropImage"
import ModalViewImage from "./ModalViewImage"
import { createCroppedImage } from "../../helpers/imageHelpers"

export const CardProfile = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
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

    // ✅ NUEVO: Subir imagen RECORTADA + ORIGINAL al servidor
    const handleCropComplete = async (croppedAreaPixels) => {
        try {
            setShowCropModal(false)
            setLoading(true)

            // ✅ Crear imagen recortada
            const croppedBlob = await createCroppedImage(imageToCrop, croppedAreaPixels)
            const croppedFile = new File([croppedBlob], originalFile.name, {
                type: 'image/jpeg'
            })

            // ✅ Enviar AMBAS imágenes al servidor
            const formData = new FormData()
            formData.append('avatar', croppedFile) // ✅ Recortada para el círculo
            formData.append('avatarOriginal', originalFile) // ✅ Original para el modal
            formData.append('nombre', userData.nombre || '')
            formData.append('apellido', userData.apellido || '')
            formData.append('celular', userData.celular || '')
            formData.append('email', userData.email || '')

            await updateProfile(formData, userId)

            setPreview(URL.createObjectURL(croppedFile))
            window.location.reload()
        } catch (error) {
            console.error('Error al procesar imagen:', error)
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

    // ✅ URL para mostrar en el círculo (recortada)
    const avatarUrl =
        preview ||
        userData?.avatar ||
        "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    // ✅ URL para mostrar en el modal (original completa)
    const fullImageUrl = userData?.avatarOriginal || avatarUrl;

    const tieneAvatarPersonalizado = userData?.avatar &&
        userData.avatar !== "https://cdn-icons-png.flaticon.com/512/4715/4715329.png" &&
        userData.avatar !== null;

    return (
        <>
            <div className="bg-gray-200 border border-black h-auto p-4 flex flex-col items-center justify-between shadow-xl rounded-lg">
                <div className="relative">
                    <img
                        src={avatarUrl + `?t=${Date.now()}`}
                        alt="avatar"
                        className="w-32 h-32 max-w-full max-h-40 rounded-full border-2 border-gray-300 object-cover mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ aspectRatio: '1/1' }}
                        onClick={() => setShowViewModal(true)}
                        title="Click para ver imagen completa"
                    />

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

            <ModalViewImage
                imageSrc={fullImageUrl}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                userName={`${userData?.nombre || ''} ${userData?.apellido || ''}`}
            />
        </>
    )
}