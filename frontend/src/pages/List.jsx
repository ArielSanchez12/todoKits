import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import storeProfile from "../context/storeProfile";
import Table from "../components/list/Table"

const List = () => {
  const navigate = useNavigate();
  const { user } = storeProfile();

  useEffect(() => {
    // Si es docente, redirige a su página de tratamientos
    if (user?.rol === "Docente" || user?.rolDocente) {
      navigate(`/dashboard/visualizar/${user?._id || user?.id || user?.docenteId}`);
    }
  }, [user, navigate]);

  // Aquí va el contenido normal para admin
  return (
    <div>
      <h1 className='font-black text-4xl text-black'>Listar</h1>
      <hr className='my-2 border-t-2 border-gray-300' />
      <p className='mb-8'>Este módulo te permite gestionar registros existentes</p>
      <Table />
    </div>
  );
};

export default List;