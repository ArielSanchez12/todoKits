import { Link, Outlet, useLocation } from 'react-router'
import { useState } from 'react' // ✅ NUEVO
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'
import ModalViewImage from '../components/profile/ModalViewImage' // ✅ NUEVO

const Dashboard = () => {
    const location = useLocation()
    const urlActual = location.pathname
    const isListarActive =
        urlActual === "/dashboard/listar" ||
        urlActual.startsWith("/dashboard/visualizar");
    const { clearToken } = storeAuth()
    const { user } = storeProfile();
    const [showViewModal, setShowViewModal] = useState(false) // ✅ NUEVO

    const userData = user?._doc || user || {};

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <span className="text-white text-xl">Cargando...</span>
            </div>
        );
    }

    const esAdministrador = userData?.rol === "Administrador";
    const esDocente = userData?.rol === "docente" || userData?.rolDocente === "Docente";

    // ✅ Mostrar imagen RECORTADA en sidebar y header
    const avatarUrl = userData.avatarDocente || userData.avatar || userData.avatarDocenteOriginal || userData.avatarOriginal || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    // ✅ Mostrar imagen ORIGINAL en modal
    const avatarOriginalUrl = userData.avatarDocenteOriginal || userData.avatarOriginal || userData.avatarDocente || userData.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

    return (
        <>
            <div className='md:flex md:min-h-screen'>

                <div className='md:w-1/6 bg-black px-8 py-6'>

                    <h2 className="font-black text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-white font-sans leading-none w-full break-words flex items-start justify-center md:justify-start mb-2">
                        <span className="select-none">LabTRACK</span>
                        <sup className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-wider px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 ml-0.5">ESFOT</sup>
                    </h2>

                    {/* ✅ Avatar del sidebar - clickeable - MUESTRA RECORTADA */}
                    <img
                        src={avatarUrl}
                        alt="img-client"
                        className="m-auto mt-8 p-1 border-2 border-slate-500 rounded-full h-28 w-28 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowViewModal(true)}
                        title="Click para ver imagen completa"
                    />
                    <p className='text-white text-center my-4 text-base'>
                        <span className='bg-green-500 w-3 h-3 inline-block rounded-full'></span> Bienvenido - {userData.nombre || userData.nombreDocente} {userData.apellido || userData.apellidoDocente}
                    </p>
                    <p className='text-white text-center my-4 text-base'> Rol - {userData.rol || userData.rolDocente}</p>
                    <hr className="mt-6 border-slate-500" />

                    <ul className="mt-6">
                        <li className="text-center">
                            <Link to='/dashboard' className={`${urlActual === '/dashboard' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}>
                                Perfil
                            </Link>
                        </li>

                        {esAdministrador && (
                            <li className="text-center">
                                <Link
                                    to="/dashboard/listar"
                                    className={`${isListarActive
                                        ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center'
                                        : 'text-slate-400'
                                        } text-xl block mt-2 hover:text-white`}
                                >
                                    Listar
                                </Link>
                            </li>
                        )}

                        {esAdministrador && (
                            <li className="text-center">
                                <Link to='/dashboard/crear' className={`${urlActual === '/dashboard/crear' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}>
                                    Crear
                                </Link>
                            </li>
                        )}

                        {esAdministrador && (
                            <li className="text-center">
                                <Link
                                    to='/dashboard/recursos'
                                    className={`${urlActual === '/dashboard/recursos' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}
                                >
                                    Recursos
                                </Link>
                            </li>
                        )}

                        {esAdministrador && (
                            <li className="text-center">
                                <Link
                                    to='/dashboard/prestamos'
                                    className={`${urlActual === '/dashboard/prestamos' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}
                                >
                                    Préstamos
                                </Link>
                            </li>
                        )}

                        {esDocente && (
                            <li className="text-center">
                                <Link
                                    to='/dashboard/prestamos-docente'
                                    className={`${urlActual === '/dashboard/prestamos-docente' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}
                                >
                                    Mis Préstamos
                                </Link>
                            </li>
                        )}

                        <li className="text-center">
                            <Link to='/dashboard/chat' className={`${urlActual === '/dashboard/chat' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}>
                                Chat
                            </Link>
                        </li>
                    </ul>

                </div>

                <div className='flex-1 flex flex-col justify-between h-screen bg-white'>
                    <div className='bg-black py-3 flex md:justify-end items-center gap-5 justify-center'>
                        <div className='text-md font-semibold text-slate-100'>
                            Usuario - {userData.nombre || userData.nombreDocente} {userData.apellido || userData.apellidoDocente}
                        </div>
                        <div>
                            {/* ✅ Avatar del header - clickeable - MUESTRA RECORTADA */}
                            <img
                                src={avatarUrl}
                                alt="img-client"
                                className="border-2 border-green-500 rounded-full h-12 w-12 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setShowViewModal(true)}
                                title="Click para ver imagen completa"
                            />
                        </div>
                        <div>
                            <button to='/' className=" text-white mr-3 text-md block hover:bg-red-600 text-center
                            bg-red-700 px-7 py-1 rounded-lg hover:scale-115 duration-300" onClick={() => clearToken()}>Salir</button>
                        </div>
                    </div>
                    <div className='overflow-y-scroll p-8'>
                        <Outlet />
                    </div>
                </div>

            </div>

            {/* ✅ Modal de vista de imagen - MUESTRA ORIGINAL */}
            <ModalViewImage
                imageSrc={avatarOriginalUrl}
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                userName={`${userData?.nombre || userData?.nombreDocente || ''} ${userData?.apellido || userData?.apellidoDocente || ''}`}
            />
        </>
    );
}

export default Dashboard;