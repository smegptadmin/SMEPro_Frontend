// C:\Users\Chris Miguez\projects\SMEPro_Frontend\services\api.ts

import axios from "axios";

// Create a reusable Axios instance for all backend calls
const api = axios.create({
  baseURL: "https://smepro-lite-backup-748515429645.us-west1.run.app",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout for safety
});

// Optional: interceptors for logging or error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default api;
