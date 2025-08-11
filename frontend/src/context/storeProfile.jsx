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
            const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/${id}`;
            let payload = data;
            let headers = getAuthHeaders();
            // Si data es FormData, cambiar headers
            if (data instanceof FormData) {
                headers = {
                    headers: {
                        ...headers.headers,
                        'Content-Type': 'multipart/form-data',
                    },
                };
                payload = data;
            }
            await axios.put(url, payload, headers);
            // Refresca el perfil después de actualizar
            await storeProfile.getState().profile();
            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.msg);
        }
    },
    updatePasswordProfile: async (data, id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/administrador/actualizarpassword/${id}`
            const respuesta = await axios.put(url, data, getAuthHeaders())
            toast.success("Contraseña actualizada correctamente")
            return respuesta
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.msg)
        }
    }
})
)

export default storeProfile;
