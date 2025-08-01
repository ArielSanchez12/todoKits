import { create } from "zustand"
import { persist } from "zustand/middleware"


const storeAuth = create(
    // MIDDLEWARE
    persist(
        // iNFORMACION A COMPARTIR
        set => ({
            token: null,
            rol: null,
            setToken: (token) => set({ token }),
            setRol: (rol) => set({ rol }),
            clearToken: () => set({ token: null })
        }),
        // LOCALSTORAGE
        { name: "auth-token" }
    )
)

export default storeAuth;