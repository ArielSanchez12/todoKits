import storeAuth from "../context/storeAuth";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setToken = storeAuth((state) => state.setToken);
  const setRol = storeAuth((state) => state.setRol);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const name = query.get("name");
    const email = query.get("email");
    const token = query.get("token");
    const id = query.get("id"); // <-- Asegúrate que el backend lo envía
    const rol = query.get("rol") || "Docente"; // O lee de query si lo envías

    if (name && email && token && id) { //tambien se podia quitar de aqui el id, pero es recomendable enviarlo desde el back en lugar de quitarlo en front
      // Guarda el usuario completo
      localStorage.setItem("user", JSON.stringify({
        _id: id,
        nombreDocente: name, // o nombreAdmin si es admin
        emailDocente: email, // o emailAdmin si es admin
        rolDocente: rol // o rolAdmin si es admin
      }));
      setToken(token);
      setRol(rol);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [location, navigate, setToken, setRol]);

  return <p>Cargando...</p>;
};

export default LoginSuccess;