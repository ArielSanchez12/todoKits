import logoEsfot from '../assets/esfotLogo.png'

export const Forbidden = () => {
    return (


        <div className="flex flex-col items-center justify-center">

            <img className="object-cover h-80 w-80 rounded-full border-4 border-solid border-slate-600" src={logoEsfot} alt="image description" />

            <div className="flex flex-col items-center justify-center">

                <p className="text-3xl md:text-4xl lg:text-5xl text-gray-800 mt-12">Pagina solo para Administradores</p>

                <p className="md:text-lg lg:text-xl text-gray-600 mt-8">Lo sentimos, no tienes permiso para acceder a esta página.</p>


            </div>
        </div>
    )
}