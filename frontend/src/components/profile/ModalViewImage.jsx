const ModalViewImage = ({ imageSrc, onClose, isOpen, userName }) => {
    if (!isOpen) return null

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
            onClick={onClose}
        >
            <div style={{ position: 'relative', maxWidth: '56rem', maxHeight: '90vh', padding: '1rem' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-0.5rem',
                        right: '-0.5rem',
                        color: 'white',
                        backgroundColor: '#dc2626',
                        borderRadius: '9999px',
                        width: '2.5rem',
                        height: '2.5rem',
                        border: 'none',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                    title="Cerrar"
                >
                    ×
                </button>

                <img
                    src={imageSrc}
                    alt={userName || "Foto de perfil"}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        borderRadius: '0.5rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                />

                {userName && (
                    <p style={{
                        color: 'white',
                        textAlign: 'center',
                        marginTop: '1rem',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
                    }}>
                        {userName}
                    </p>
                )}
            </div>
        </div>
    )
}

export default ModalViewImage