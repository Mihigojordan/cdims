import axios, { type AxiosInstance } from "axios";

export const API_URL: string = import.meta.env.VITE_API_URL as string;

// Create an axios instance with a base URL
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // ❌ Don't send cookies
});

// Attach Authorization header dynamically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token"); // or sessionStorage if you prefer
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
