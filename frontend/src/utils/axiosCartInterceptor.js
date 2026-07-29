// utils/axiosCartInterceptor.js
import axios from "axios";

axios.interceptors.response.use(
  (response) => {
    const url = response.config?.url || "";
    if (url.includes("/api/v1/cart") && response.config.method !== "get") {
      window.dispatchEvent(new Event("cart-updated"));
    }
    return response;
  },
  (error) => Promise.reject(error)
);