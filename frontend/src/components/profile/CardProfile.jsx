

import { useRef, useState } from "react"
import storeProfile from "../../context/storeProfile"



export const CardProfile = () => {
    const { user, updateProfile } = storeProfile()
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)



    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (file && user?._id) {
            setLoading(true)
            const formData = new FormData()
            formData.append('avatar', file)
            // Agrega los demás campos del usuario para no perderlos
            formData.append('nombre', user.nombre || '')
            formData.append('apellido', user.apellido || '')
            formData.append('direccion', user.direccion || '')
            formData.append('celular', user.celular || '')
            formData.append('email', user.email || '')
            await updateProfile(formData, user._id)
            setPreview(URL.createObjectURL(file))
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-200 border border-black h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">
            <div className="relative">
                <img
                    src={
                        preview ||
                        user?.avatar ||
                        user?.avatarDocente ||
                        user?.avatarDocenteIA ||
                        user?.avatarIA ||
                        "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
                    }
                    alt="avatar"
                    className="m-auto rounded-full border-2 border-gray-300"
                    width={120}
                    height={120}
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
                <b>Nombre:</b><p className="inline-block ml-3">{user?.nombre}</p>
            </div>
            <div className="self-start">
                <b>Apellido:</b><p className="inline-block ml-3">{user?.apellido}</p>
            </div >
            <div className="self-start">
                <b>Dirección:</b><p className="inline-block ml-3">{user?.direccion}</p>
            </div>
            <div className="self-start">
                <b>Teléfono:</b><p className="inline-block ml-3">{user?.celular}</p>
            </div>
            <div className="self-start">
                <b>Correo:</b><p className="inline-block ml-3">{user?.email}</p>
            </div>
        </div>
    )
}