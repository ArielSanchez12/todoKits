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
                <p className='mb-8'>Este módulo te permite gestionar el perfil del administrador</p>
            </div>
            {
                user && user?.rolDocente == "Docente"
                    ? (<CardProfileOwner />)
                    : (
                        <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                            <div className='w-full md:w-1/2'>
                                <FormProfile />
                            </div>
                            <div className='w-full md:w-1/2'>
                                <CardProfile />
                                <CardPassword />
                            </div>
                        </div>
                    )
            }
        </>

    )
}

export default Profile