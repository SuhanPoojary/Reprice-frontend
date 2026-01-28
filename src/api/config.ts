// Centralized API base URL configuration.
// Set `VITE_API_URL` in your Vite env (e.g. `.env.local`).
// Example: VITE_API_URL=http://localhost:5000/api

export const API_URL: string =
  (import.meta as any).env?.VITE_API_URL ??
  "https://reprice-backend-a5mp.onrender.com/api";
