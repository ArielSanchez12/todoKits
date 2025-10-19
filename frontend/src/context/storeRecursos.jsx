import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const storeRecursos = create((set) => ({
  recursos: [],
  loading: false,
  modal: null,

  // Obtener todos los recursos
  fetchRecursos: async () => {
    set({ loading: true });
    try {
      // Corregir obtención del token
      const storedAuth = JSON.parse(localStorage.getItem("auth-token"));
      const token = storedAuth?.state?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/administrador/recursos`,
        { headers }
      );
      
      set({ recursos: response.data });
      return response.data;
    } catch (error) {
      console.error("Error al obtener recursos:", error);
      // No mostrar toast, solo loguear
      set({ recursos: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Crear recurso
  createRecurso: async (datosRecurso) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth-token"));
      const token = storedAuth?.state?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/administrador/recurso/crear`,
        datosRecurso,
        { headers }
      );
      
      toast.success(response.data.msg);
      set((state) => ({
        recursos: [response.data.recurso, ...state.recursos],
      }));
      return response.data;
    } catch (error) {
      console.error("Error al crear recurso:", error);
      toast.error(error.response?.data?.msg || "Error al crear recurso");
      throw error;
    }
  },

  // Actualizar recurso
  updateRecurso: async (id, datosActualizacion) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth-token"));
      const token = storedAuth?.state?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/administrador/recurso/${id}`,
        datosActualizacion,
        { headers }
      );
      
      toast.success(response.data.msg);
      set((state) => ({
        recursos: state.recursos.map((r) =>
          r._id === id ? response.data.recurso : r
        ),
      }));
      return response.data;
    } catch (error) {
      console.error("Error al actualizar recurso:", error);
      toast.error(error.response?.data?.msg || "Error al actualizar recurso");
      throw error;
    }
  },

  // Eliminar recurso
  deleteRecurso: async (id) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth-token"));
      const token = storedAuth?.state?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/administrador/recurso/${id}`,
        { headers }
      );
      
      toast.success(response.data.msg);
      set((state) => ({
        recursos: state.recursos.filter((r) => r._id !== id),
      }));
      return response.data;
    } catch (error) {
      console.error("Error al eliminar recurso:", error);
      toast.error(error.response?.data?.msg || "Error al eliminar recurso");
      throw error;
    }
  },

  // Toggle modal
  toggleModal: (modalName = null) => {
    set({ modal: modalName });
  },
  
  // Limpiar recursos al desmontar
  clearRecursos: () => {
    set({ recursos: [] });
  },
}));

export default storeRecursos;