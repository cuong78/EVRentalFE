// Hard-code BASE_URL to empty string - Vite proxy will handle /api routing
// This prevents URL duplication like /api/api/...
// The Vite proxy in vite.config.ts forwards /api requests to http://localhost:8080
const BASE_URL = '';

export const API = {
    BASE: BASE_URL,
    ADMIN: `${BASE_URL}/admin`,
    PUBLIC: `${BASE_URL}/public`,
    USER: `${BASE_URL}/user`,
};