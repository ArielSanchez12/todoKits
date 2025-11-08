import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

const ModalCropImage = ({ imageSrc, onCropComplete, onClose, isOpen }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = (crop) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom) => {
        setZoom(zoom)
    }

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = () => {
        onCropComplete(croppedAreaPixels)
    }

    if (!isOpen) return null

    return (
        <div
            // Fondo borroso igual que ModalViewImage
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
        >
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-center">Ajusta tu foto de perfil</h2>

                <div className="relative w-full h-96 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteCallback}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                        Zoom: {Math.round(zoom * 100)}%
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <p className="text-sm text-gray-600 mb-4 text-center">
                    💡 Arrastra la imagen para posicionarla y usa el deslizador para hacer zoom
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Guardar imagen
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalCropImage