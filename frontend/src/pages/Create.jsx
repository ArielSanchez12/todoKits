import { Form } from '../components/create/Form'

const Create = () => {
    return (
        <div>
            <h1 className='font-black text-4xl text-black'>Agregar</h1>
            <hr className='my-2 border-t-2 border-gray-300' />
            <p className='mb-8'>Este módulo te permite gestionar registros</p>
            <Form />
        </div>
    )
}

export default Create