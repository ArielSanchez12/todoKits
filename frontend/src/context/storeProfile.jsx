import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token}`,
        },
    };
};

const storeProfile = create((set) => ({

    user: null,
    clearUser: () => set({ user: null }),

    profile: async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const endpoint = storedUser.state.rol === "Administrador"
                ? "perfil"
                : "docente/profile"

            const url = `${import.meta.env.VITE_BACKEND_URL}/${endpoint}`;
            const respuesta = await axios.get(url, getAuthHeaders())
            set({ user: respuesta.data })
        } catch (error) {
            console.error(error)
        }
    },

    updateProfile: async (data, id) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const isDocente = storedUser.state.rol === "Docente";

            // ✅ Endpoint según el rol
            const endpoint = isDocente
                ? `docente/actualizarperfil/${id}`
                : `administrador/${id}`;

            const url = `${import.meta.env.VITE_BACKEND_URL}/${endpoint}`;
            let headers;

            // Detectar correctamente el tipo de contenido
            if (data instanceof FormData) {
                headers = {
                    headers: {
                        Authorization: `Bearer ${storedUser?.state?.token}`,
                    },
                };
            } else {
                headers = getAuthHeaders();
            }

            await axios.put(url, data, headers);
            await storeProfile.getState().profile();
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.msg);
        }
    },

    updatePasswordProfile: async (data, id) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("auth-token"));
            const isDocente = storedUser.state.rol === "Docente";

            // ✅ Endpoint según el rol
            const endpoint = isDocente
                ? `docente/actualizarpassword/${id}`
                : `administrador/actualizarpassword/${id}`;

            const url = `${import.meta.env.VITE_BACKEND_URL}/${endpoint}`;
            const respuesta = await axios.put(url, data, getAuthHeaders());
            toast.success("Contraseña actualizada correctamente");
            return respuesta;
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.msg);
        }
    },

    // Obtener lista de docentes
    fetchDocentes: async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/listDocentes`;
            const respuesta = await axios.get(url, getAuthHeaders());

            // Validar que la respuesta sea un array
            return Array.isArray(respuesta.data) ? respuesta.data : [];
        } catch (error) {
            console.error("Error al obtener docentes:", error);
            toast.error("Error al cargar docentes");
            return [];
        }
    }
}))

export default storeProfile;
