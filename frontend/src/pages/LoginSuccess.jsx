import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const name = query.get("name");
    const email = query.get("email");

    if (name && email) {
      localStorage.setItem("user", JSON.stringify({ name, email }));
      navigate("/dashboard"); // o cualquier ruta principal que tengas
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Cargando...</p>;
};

export default LoginSuccess;