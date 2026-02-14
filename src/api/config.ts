// Centralized API base URL configuration.
// Set `VITE_API_URL` in your Vite env (e.g. `.env.local`).
// Example (local): VITE_API_URL=http://localhost:3001/api

const DEFAULT_API_URL = "https://reprice-backend-a5mp.onrender.com/api";

function isLoopbackUrl(url: string) {
  return /^(https?:\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/i.test(url.trim());
}

function isLocalHostname(hostname: string) {
  const h = String(hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

function resolveApiUrl(): string {
  const envUrl = String((import.meta as any).env?.VITE_API_URL || "").trim();
  if (!envUrl) return DEFAULT_API_URL;

  // If someone accidentally deployed with VITE_API_URL pointing to localhost,
  // browsers will block it from HTTPS origins (loopback/private network).
  // In that case, force the public backend.
  if (typeof window !== "undefined" && !isLocalHostname(window.location.hostname) && isLoopbackUrl(envUrl)) {
    return DEFAULT_API_URL;
  }

  return envUrl;
}

export const API_URL: string = resolveApiUrl();
