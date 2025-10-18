import storeProfile from "../../context/storeProfile"

export const CardProfileOwner = () => {

    const { user } = storeProfile()

    // Unifica la lógica de Dashboard: avatarDocente, avatar, imagen por defecto
    const avatarUrl =
        user.avatarDocente ||
        user.avatar ||
        "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    // Si es base64 (data:image), no agregar timestamp
    const isBase64 = typeof avatarUrl === 'string' && avatarUrl.startsWith('data:image');
    const imgSrc = isBase64 ? avatarUrl : avatarUrl + `?t=${Date.now()}`;

    return (
        <div className="bg-white border border-slate-200 h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">
            <div>
                <img
                    src={imgSrc}
                    alt="avatar"
                    className="h-70 w-70 rounded-full object-cover"
                />
            </div>
            <div className="self-start">
                <b>Docente:</b>
                <p className="inline-block ml-3">{user.nombreDocente} {user.apellidoDocente}</p>
            </div>
            <div className="self-start">
                <b>Email:</b>
                <p className="inline-block ml-3">{user.emailDocente}</p>
            </div>
            <div className="self-start">
                <b>Celular:</b>
                <p className="inline-block ml-3">{user.celularDocente}</p>
            </div>
        </div>
    )
}