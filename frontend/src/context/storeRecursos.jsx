import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const storeRecursos = create((set) => ({
  recursos: [],
  loading: false,
  modal: null,
  recursoEditando: null,

  // Obtener todos los recursos
  fetchRecursos: async () => {
    set({ loading: true });
    try {
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

      set({ recursos: response.data || [] });
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener recursos:", error);
      set({ recursos: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Obtener recurso por ID
  fetchRecursoById: async (id) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth-token"));
      const token = storedAuth?.state?.token;

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/administrador/recurso/${id}`,
        { headers }
      );

      set({ recursoEditando: response.data });
      return response.data;
    } catch (error) {
      console.error("Error al obtener recurso:", error);
      toast.error("Error al cargar el recurso");
      throw error;
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

      // Solo mostrar un toast
      toast.success(response.data.msg || "Recurso creado exitosamente");

      // Actualizar el estado directamente sin llamar a fetchRecursos aquí
      set((state) => ({
        recursos: [response.data.recurso, ...state.recursos],
      }));

      return response.data;
    } catch (error) {
      console.error("Error al crear recurso:", error);
      const errorMsg = error.response?.data?.msg || "Error al crear recurso";
      toast.error(errorMsg);
      throw error;
    }
  },

  // Actualizar recurso (estado)
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

      toast.success(response.data.msg || "Recurso actualizado exitosamente");
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

  // NUEVO: Actualizar recurso completo (edición)
  updateRecursoCompleto: async (id, datosActualizacion) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth-token"));
      const token = storedAuth?.state?.token;

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/administrador/recurso/editar/${id}`,
        datosActualizacion,
        { headers }
      );

      toast.success(response.data.msg || "Recurso actualizado exitosamente");

      set((state) => ({
        recursos: state.recursos.map((r) =>
          r._id === id ? response.data.recurso : r
        ),
        recursoEditando: null,
      }));

      return response.data;
    } catch (error) {
      console.error("Error al actualizar recurso:", error);
      const errorMsg = error.response?.data?.msg || "Error al actualizar recurso";
      toast.error(errorMsg);
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

      toast.success(response.data.msg || "Recurso eliminado exitosamente");
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

  // Establecer recurso para editar
  setRecursoEditando: (recurso) => {
    set({ recursoEditando: recurso });
  },

  toggleModal: (modalName = null) => {
    set({ modal: modalName });
  },

  clearRecursos: () => {
    set({ recursos: [] });
  },
}));

export default storeRecursos;