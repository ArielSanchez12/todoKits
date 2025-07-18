import storeProfile from "../../context/storeProfile"

export const CardProfileOwner = () => {

    const { user } = storeProfile()

    return (
        <div className="bg-white border border-slate-200 h-auto p-4 
                        flex flex-col items-center justify-between shadow-xl rounded-lg">

            <div>
                <img
                    src={user.avatarDocente || user.avatarDocenteIA || "https://cdn-icons-png.flaticon.com/512/2138/2138440.png"}
                    alt="img-docente"
                    className="m-auto rounded-full object-cover"
                    width={120}
                    height={120}
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
            <div className="self-start">
                <b>Dirección:</b>
                <p className="inline-block ml-3">{user.direccionDocente}</p>
            </div>
        </div>
    )
}