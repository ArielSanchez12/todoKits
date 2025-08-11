import axios from "axios";
import { toast } from "react-toastify";

function useFetch() {
    const fetchDataBackend = async (url, data = null, method = "GET", headers = {}) => {
        const loadingToast = toast.loading("Procesando solicitud...");
        try {
            let customHeaders = { ...headers };
            // Si los datos NO son FormData, agrega Content-Type JSON
            if (!(data instanceof FormData)) {
                customHeaders["Content-Type"] = "application/json";
            }
            const options = {
                method,
                url,
                headers: customHeaders,
            };
            // Solo agrega 'data' si el método lo necesita
            if (["POST", "PUT", "PATCH"].includes(method) && data) {
                options.data = data;
            }
            const response = await axios(options);
            toast.dismiss(loadingToast);
            if (response?.data?.msg) toast.success(response.data.msg);
            return response?.data;
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error(error);
            toast.error(error.response?.data?.msg || "Error en la solicitud");
        }
    };

    return { fetchDataBackend };
}

export default useFetch;
