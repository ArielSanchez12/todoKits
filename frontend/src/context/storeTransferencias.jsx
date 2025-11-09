import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeTransferencias = create(
  persist(
    (set, get) => ({
      transferencias: [],
      transferenciaActual: null,

      // Obtener todas las transferencias (Admin)
      fetchTransferencias: async () => {
        try {
          const storedUser = JSON.parse(localStorage.getItem("auth-token"));
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/administrador/transferencias`,
            {
              headers: {
                Authorization: `Bearer ${storedUser.state.token}`,
              },
            }
          );
          const data = await response.json();
          set({ transferencias: data });
          return data;
        } catch (error) {
          console.error("Error al obtener transferencias:", error);
          return [];
        }
      },

      // Crear transferencia (Admin)
      crearTransferencia: async (datos) => {
        try {
          const storedUser = JSON.parse(localStorage.getItem("auth-token"));
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/administrador/transferencia/crear`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
              },
              body: JSON.stringify(datos),
            }
          );
          const data = await response.json();
          await get().fetchTransferencias();
          return data;
        } catch (error) {
          console.error("Error al crear transferencia:", error);
          throw error;
        }
      },

      // Obtener transferencia por QR
      obtenerTransferenciaPorQR: async (codigoQR) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/transferencia/${codigoQR}`
          );

          // ✅ NUEVO: Manejar error 410 (transferencia caducada)
          if (response.status === 410) {
            const data = await response.json();
            const error = new Error(data.msg || "Transferencia caducada");
            error.status = 410;
            error.caducada = true;
            throw error;
          }

          if (!response.ok) {
            throw new Error("Error al obtener la transferencia");
          }

          const data = await response.json();
          set({ transferenciaActual: data });
          return data;
        } catch (error) {
          console.error("Error al obtener transferencia:", error);
          throw error;
        }
      },

      // Confirmar transferencia desde origen (Docente A)
      confirmarTransferenciaOrigen: async (codigoQR, datos) => {
        try {
          const storedUser = JSON.parse(localStorage.getItem("auth-token"));
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/docente/transferencia/${codigoQR}/confirmar`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
              },
              body: JSON.stringify(datos),
            }
          );
          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Error al confirmar transferencia:", error);
          throw error;
        }
      },

      // Responder transferencia (Docente B)
      responderTransferenciaDestino: async (id, datos) => {
        try {
          const storedUser = JSON.parse(localStorage.getItem("auth-token"));
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/docente/transferencia/${id}/responder`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
              },
              body: JSON.stringify(datos),
            }
          );
          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Error al responder transferencia:", error);
          throw error;
        }
      },

      //Cancelar transferencia
      cancelarTransferencia: async (codigoQR, motivoCancelacion = "") => {
        try {
          const storedUser = JSON.parse(localStorage.getItem("auth-token"));
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/transferencia/${codigoQR}/cancelar`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedUser.state.token}`,
              },
              body: JSON.stringify({ motivoCancelacion }),
            }
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.msg || "Error al cancelar transferencia");
          }

          // Actualizar lista de transferencias
          await get().fetchTransferencias();

          return data;
        } catch (error) {
          console.error("Error al cancelar transferencia:", error);
          throw error;
        }
      },

      limpiarTransferenciaActual: () => set({ transferenciaActual: null }),
    }),
    {
      name: "transferencias-storage",
    }
  )
);

export default storeTransferencias;