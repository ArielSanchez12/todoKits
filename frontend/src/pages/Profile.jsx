import CardPassword from '../components/profile/CardPassword'
import { CardProfile } from '../components/profile/CardProfile'
import { CardProfileOwner } from '../components/profile/CardProfileOwner'
import FormProfile from '../components/profile/FormProfile'
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
                user && user?.rolDocente == "Docente"
                    ? (<CardProfileOwner />)
                    : (
                        // ✅ NUEVO LAYOUT: CardProfile arriba (ancho completo), FormProfile y CardPassword abajo
                        <div className='space-y-8'>
                            {/* ✅ CardProfile - Ancho completo arriba */}
                            <div className='w-full'>
                                <CardProfile />
                            </div>

                            {/* ✅ FormProfile y CardPassword - Lado a lado abajo con misma altura */}
                            <div className='flex justify-between gap-8 flex-wrap md:flex-nowrap'>
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