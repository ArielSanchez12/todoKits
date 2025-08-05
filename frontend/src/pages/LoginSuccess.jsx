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
    // Si tu backend también puede enviar el rol, úsalo aquí
    const rol = "Docente"; // O lee de query si lo envías

    if (name && email && token) {
      console.log("Datos recibidos en login-success:", { name, email, token });
      localStorage.setItem("user", JSON.stringify({ name, email }));
      setToken(token); // <-- Usa Zustand para guardar el token
      setRol(rol);     // <-- Guarda el rol si lo necesitas
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [location, navigate, setToken, setRol]);

  return <p>Cargando...</p>;
};

export default LoginSuccess;

      
