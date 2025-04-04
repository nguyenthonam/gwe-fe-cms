import axios from "axios";

// Base URL của API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.yourdomain.com"; // 🔹 Thay bằng URL thật

const AxiosAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 🛑 Interceptor để tự động thêm accessToken vào request
AxiosAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛑 Interceptor để xử lý lỗi response (Ví dụ: Token hết hạn)
AxiosAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("AccessToken");
    }
    return Promise.reject(error);
  }
);

export default AxiosAPI;
