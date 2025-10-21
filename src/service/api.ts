import axios from 'axios';
import { API } from "../constants";
import { showErrorToast } from '../utils/show-toast';
import { handle401 } from './refresh-token-handler';
import { tokenManager } from '../utils/token-manager';

const BASE_URL = API.BASE;

// Client with authentication for protected endpoints
export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
    // withCredentials removed to avoid CORS issues with wildcard Access-Control-Allow-Origin
    // Authentication is handled via Bearer token in Authorization header
});

// Client without authentication for public endpoints (same baseURL, no auth interceptor)
export const apiPublicClient = axios.create({
    baseURL: BASE_URL,  // Fixed: use BASE_URL instead of API.PUBLIC
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});


apiClient.interceptors.request.use(
    async (config) => {
        // Chỉ check token cho các request không phải refresh token để tránh vòng lặp vô hạn
        if (!config.url?.includes('/refresh-token')) {
            try {
                // Kiểm tra và refresh token nếu cần trước mỗi request
                await tokenManager.checkAndRefreshToken();
            } catch (error) {
                console.log('Token check failed, continuing with current token');
            }
        }

        const token = tokenManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        const apiMessage = error?.response?.data?.message || "Lỗi không xác định";

        // ✅ Refresh token nếu token hết hạn
        if (status === 401 && !originalRequest._retry) {
            return handle401(originalRequest, apiClient);
        }

        // ✅ Nếu lỗi khác (403, 500, etc)
        if (status === 403) {
            showErrorToast("Không có quyền truy cập");
        } else if (status === 500) {
            showErrorToast("Lỗi hệ thống");
        } else {
            showErrorToast(apiMessage);
        }

        return Promise.reject(error);
    }
);
