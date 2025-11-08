const ModalViewImage = ({ imageSrc, onClose, isOpen, userName }) => {
    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition-colors z-10 shadow-lg"
                    title="Cerrar"
                >
                    ×
                </button>

                {/* Imagen ampliada */}
                <img
                    src={imageSrc}
                    alt={userName || "Foto de perfil"}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Nombre del usuario (opcional) */}
                {userName && (
                    <p className="text-white text-center mt-4 text-lg font-semibold drop-shadow-lg">
                        {userName}
                    </p>
                )}
            </div>
        </div>
    )
}

export default ModalViewImage