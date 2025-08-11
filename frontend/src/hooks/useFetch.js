import axios from "axios";
import { toast } from "react-toastify";

function useFetch() {
    const fetchDataBackend = async (url, data = null, method = "GET", headers = {}) => {
        const loadingToast = toast.loading("Procesando solicitud...");
        try {
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
            }
            // Solo agrega body si hay datos (para evitar enviar "null" en DELETE)
            if (data !== undefined && data !== null) {
                options.body = JSON.stringify(data);
            }
            const response = await fetch(url, options);
            toast.dismiss(loadingToast);
            toast.success(response?.data?.msg)
            return response.json();
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error(error)
            toast.error(error.response?.data?.msg)
        }
    }

    return { fetchDataBackend }
}

export default useFetch;