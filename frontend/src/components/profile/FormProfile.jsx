import axios from "axios"
import storeAuth from "../../context/storeAuth"

const FormularioPerfil = () => {
    const { token } = storeAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            nombre: e.target.nombre.value,
            apellido: e.target.apellido.value,
            direccion: e.target.direccion.value,
            celular: e.target.celular.value,
            email: e.target.email.value,
        };
        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/perfil`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Datos actualizados correctamente")
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label className="mb-2 block text-base font-semibold">Nombre</label>
                <input type="text" name="nombre" placeholder="Ingresa tu nombre" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-base font-semibold">Apellido</label>
                <input type="text" name="apellido" placeholder="Ingresa tu apellido" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-base font-semibold">Dirección</label>
                <input type="text" name="direccion" placeholder="Ingresa tu dirección" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-base font-semibold">Teléfono</label>
                <input type="number" name="celular" placeholder="Ingresa tu teléfono" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>
            <div>
                <label className="mb-2 block text-base font-semibold">Correo electrónico</label>
                <input type="email" name="email" placeholder="Ingresa tu correo" className="block w-full rounded-md border border-gray-300 py-1 px-2 text-gray-500 mb-5" />
            </div>

            <input
                type="submit"
                className='bg-gray-800 w-full p-2 mt-5 text-slate-300 uppercase font-bold rounded-lg 
                        hover:bg-gray-600 cursor-pointer transition-all'
                value='Actualizar' />

        </form>
    )
}

export default FormularioPerfil