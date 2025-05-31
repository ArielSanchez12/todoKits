import logoBuho from '../assets/profesor-buho-logo.png';
import { Link } from 'react-router';

export const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <img
                className="object-cover h-75 w-80 rounded-full border-4 border-solid border-slate-600"
                src={logoBuho}
                alt="image description"
            />

            <div className="flex flex-col items-center justify-center text-center mt-12">
                <p className="text-3xl md:text-4xl lg:text-5xl text-black">Página no encontrada</p>
                <p className="md:text-lg lg:text-xl text-black mt-8">¡Lo sentimos mucho¡</p>
                <Link to="/" className="p-3 m-5 w-full text-center bg-black text-white border rounded-xl hover:scale-105 duration-300 hover:bg-blue-600 hover:text-white">
                    Regresar
                </Link>
            </div>
        </div>
    );
};
