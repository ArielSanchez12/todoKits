import { Link, Outlet, useLocation } from 'react-router'
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'

const Dashboard = () => {
    const location = useLocation()
    const urlActual = location.pathname
    const isListarActive =
        urlActual === "/dashboard/listar" ||
        urlActual.startsWith("/dashboard/visualizar");
    const { clearToken } = storeAuth()
    const { user } = storeProfile()

    return (
        <div className='md:flex md:min-h-screen'>

            <div className='md:w-1/6 bg-black px-8 py-6'>

                <h2 className='text-5xl font-black text-center text-white font-sans'>LabTRACK</h2>

                <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client" className="m-auto mt-8 p-1 border-2 border-slate-500 rounded-full" width={120} height={120} />
                <p className='text-white text-center my-4 text-base'>
                    <span className='bg-green-500 w-3 h-3 inline-block rounded-full'></span> Bienvenido - {user?.nombre || user?.nombreDocente} {user?.apellido || user?.apellidoDocente}
                </p>
                <p className='text-white text-center my-4 text-base'> Rol - {user?.rol || user?.rolDocente}</p>
                <hr className="mt-6 border-slate-500" />

                <ul className="mt-6">

                    <li className="text-center">
                        <Link to='/dashboard' className={`${urlActual === '/dashboard' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}>Perfil</Link>
                    </li>

                    <li className="text-center">
                        <Link
                            to={
                                user?.rol === "docente"
                                    ? `/dashboard/visualizar/${user?._id || user?.id || user?.docenteId}`
                                    : "/dashboard/listar"
                            }
                            className={`${
                                isListarActive
                                    ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center'
                                    : 'text-slate-400'
                            } text-xl block mt-2 hover:text-white`}
                        >
                            Listar
                        </Link>
                    </li>

                    <li className="text-center">
                        <Link to='/dashboard/crear' className={`${urlActual === '/dashboard/crear' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}>Crear</Link>
                    </li>

                    <li className="text-center">
                        <Link to='/dashboard/chat' className={`${urlActual === '/dashboard/chat' ? 'text-white bg-blue-600 hover:scale-105 duration-300 px-3 py-2 rounded-md text-center' : 'text-slate-400'} text-xl block mt-2 hover:text-white`}>Chat</Link>
                    </li>
                </ul>

            </div>

            <div className='flex-1 flex flex-col justify-between h-screen bg-white'>
                <div className='bg-black py-3 flex md:justify-end items-center gap-5 justify-center'>
                    <div className='text-md font-semibold text-slate-100'>
                        Usuario - {user?.nombre || user?.nombreDocente} {user?.apellido || user?.apellidoDocente}

                    </div>
                    <div>
                        <img src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png" alt="img-client" className="border-2 border-green-500 rounded-full" width={50} height={50} />
                    </div>
                    <div>
                        <button to='/' className=" text-white mr-3 text-md block hover:bg-red-600 text-center
                        bg-red-700 px-7 py-1 rounded-lg hover:scale-115 duration-300" onClick={() => clearToken()}>Salir</button>
                    </div>
                </div>
                <div className='overflow-y-scroll p-8'>
                    <Outlet />
                </div>
                <div className='bg-black h-12'>
                    <p className='text-center  text-white leading-[2.9rem] underline'>Todos los derechos reservados</p>
                </div>

            </div>



        </div>
    )
}

export default Dashboard