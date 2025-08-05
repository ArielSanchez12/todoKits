import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const name = query.get("name");
    const email = query.get("email");
    const token = query.get("token");

    if (name && email && token) {
      console.log("Datos recibidos en login-success:", { name, email, token });
      localStorage.setItem("user", JSON.stringify({ name, email }));
      localStorage.setItem("token", token);
      navigate("/dashboard"); // Redirige al panel principal
    } else {
      navigate("/login"); // Si falta algo, regresa al login
    }
  }, [location, navigate]);

  return <p>Cargando...</p>;
};

export default LoginSuccess;