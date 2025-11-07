import CardPassword from '../components/profile/CardPassword'
import CardPasswordDocente from '../components/profile/CardPasswordDocente'
import { CardProfile } from '../components/profile/CardProfile'
import { CardProfileDocente } from '../components/profile/CardProfileDocente'
import FormProfile from '../components/profile/FormProfile'
import FormProfileDocente from '../components/profile/FormProfileDocente'
import storeProfile from '../context/storeProfile'

const Profile = () => {
    const { user } = storeProfile()
    console.log(user)
    
    return (
        <>
            <div>
                <h1 className='font-black text-4xl text-black'>Perfil</h1>
                <hr className='my-2 border-t-2 border-gray-300' />
                <p className='mb-8'>Este módulo te permite gestionar el perfil</p>
            </div>
            {
                user && user?.rolDocente === "Docente"
                    ? (
                        // ✅ ESTRUCTURA PARA DOCENTE (igual al admin)
                        <div className='flex flex-col gap-8'>
                            {/* CardProfileDocente - Ancho completo arriba */}
                            <div className='w-full'>
                                <CardProfileDocente />
                            </div>

                            {/* FormProfileDocente y CardPasswordDocente - Lado a lado abajo */}
                            <div className='flex justify-between gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                                <div className='w-full md:w-1/2'>
                                    <FormProfileDocente />
                                </div>
                                <div className='w-full md:w-1/2'>
                                    <CardPasswordDocente />
                                </div>
                            </div>
                        </div>
                    )
                    : (
                        // ✅ ESTRUCTURA PARA ADMIN
                        <div className='flex flex-col gap-8'>
                            {/* CardProfile - Ancho completo arriba */}
                            <div className='w-full'>
                                <CardProfile />
                            </div>

                            {/* FormProfile y CardPassword - Lado a lado abajo */}
                            <div className='flex justify-between gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                                <div className='w-full md:w-1/2'>
                                    <FormProfile />
                                </div>
                                <div className='w-full md:w-1/2'>
                                    <CardPassword />
                                </div>
                            </div>
                        </div>
                    )
            }
        </>
    )
}

export default Profile