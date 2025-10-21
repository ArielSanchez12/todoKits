import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const storePrestamos = create((set) => ({
  prestamos: [],
  prestamosDocente: [],
  historialDocente: [],
  loading: false,
  prestamoSeleccionado: null,

  // FUNCIONES DEL ADMIN 

  // Crear préstamo (Admin)
  crearPrestamo: async (datosPrestamo) => {
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
        `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamo/crear`,
        datosPrestamo,
        { headers }
      );
      
      toast.success(response.data.msg || "Préstamo creado exitosamente");
      
      set((state) => ({
        prestamos: [response.data.prestamo, ...state.prestamos],
      }));
      
      return response.data;
    } catch (error) {
      console.error("Error al crear préstamo:", error);
      const errorMsg = error.response?.data?.msg || "Error al crear préstamo";
      toast.error(errorMsg);
      throw error;
    }
  },

  // Listar préstamos del admin
  fetchPrestamosAdmin: async () => {
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
        `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamos`,
        { headers }
      );
      
      set({ prestamos: response.data || [] });
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener préstamos:", error);
      set({ prestamos: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Obtener detalle de préstamo
  fetchPrestamoById: async (id) => {
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
        `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamo/${id}`,
        { headers }
      );
      
      set({ prestamoSeleccionado: response.data });
      return response.data;
    } catch (error) {
      console.error("Error al obtener préstamo:", error);
      toast.error("Error al cargar el préstamo");
      throw error;
    }
  },
  
  // Cancelar préstamo pendiente 
  cancelarPrestamoAdmin: async (id, motivoCancelacion = "") => {
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
        `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamo/${id}/cancelar`,
        { motivoCancelacion },
        { headers }
      );
      
      toast.success(response.data.msg || "Préstamo cancelado exitosamente");
      
      return response.data;
    } catch (error) {
      console.error("Error al cancelar préstamo:", error);
      const errorMsg = error.response?.data?.msg || "Error al cancelar préstamo";
      toast.error(errorMsg);
      throw error;
    }
  },

  // Finalizar préstamo 
  finalizarPrestamoAdmin: async (id, observacionesDevolucion = "") => {
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
        `${import.meta.env.VITE_BACKEND_URL}/administrador/prestamo/${id}/finalizar`,
        { observacionesDevolucion },
        { headers }
      );
      
      toast.success(response.data.msg || "Préstamo finalizado exitosamente");
      
      return response.data;
    } catch (error) {
      console.error("Error al finalizar préstamo:", error);
      const errorMsg = error.response?.data?.msg || "Error al finalizar préstamo";
      toast.error(errorMsg);
      throw error;
    }
  },

  //FUNCIONES DEL DOCENTE 

  // Listar préstamos activos y pendientes del docente
  fetchPrestamosDocente: async () => {
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
        `${import.meta.env.VITE_BACKEND_URL}/docente/prestamos`,
        { headers }
      );
      
      set({ prestamosDocente: response.data || [] });
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener préstamos del docente:", error);
      set({ prestamosDocente: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Obtener historial de préstamos del docente
  fetchHistorialDocente: async () => {
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
        `${import.meta.env.VITE_BACKEND_URL}/docente/prestamos/historial`,
        { headers }
      );
      
      set({ historialDocente: response.data || [] });
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener historial:", error);
      set({ historialDocente: [] });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Confirmar préstamo (Docente)
  confirmarPrestamo: async (id, confirmar, motivoRechazo = "") => {
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
        `${import.meta.env.VITE_BACKEND_URL}/docente/prestamo/${id}/confirmar`,
        { confirmar, motivoRechazo },
        { headers }
      );
      
      toast.success(response.data.msg || "Préstamo procesado exitosamente");
      
      // Actualizar estado local
      set((state) => ({
        prestamosDocente: state.prestamosDocente.filter((p) => p._id !== id),
      }));
      
      return response.data;
    } catch (error) {
      console.error("Error al confirmar préstamo:", error);
      const errorMsg = error.response?.data?.msg || "Error al procesar préstamo";
      toast.error(errorMsg);
      throw error;
    }
  },

  // Finalizar préstamo - Devolución (Docente)
  finalizarPrestamo: async (id, observacionesDevolucion = "") => {
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
        `${import.meta.env.VITE_BACKEND_URL}/docente/prestamo/${id}/finalizar`,
        { observacionesDevolucion },
        { headers }
      );
      
      toast.success(response.data.msg || "Recurso devuelto exitosamente");
      
      // Actualizar estado local
      set((state) => ({
        prestamosDocente: state.prestamosDocente.filter((p) => p._id !== id),
      }));
      
      return response.data;
    } catch (error) {
      console.error("Error al finalizar préstamo:", error);
      const errorMsg = error.response?.data?.msg || "Error al devolver recurso";
      toast.error(errorMsg);
      throw error;
    }
  },

  // Limpiar store
  clearPrestamos: () => {
    set({ 
      prestamos: [], 
      prestamosDocente: [], 
      historialDocente: [],
      prestamoSeleccionado: null 
    });
  },
}));

export default storePrestamos;