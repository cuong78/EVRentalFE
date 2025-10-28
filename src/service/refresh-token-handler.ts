// src/services/refresh-token-handler.ts

import { authService } from "./authService";
let isRefreshing = false;
let failedQueue: any[] = [];

export const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

export const handle401 = async (originalRequest: any, apiClient: any) => {
    if (originalRequest._retry) {
        return Promise.reject("Token refresh failed.");
    }

    originalRequest._retry = true;

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({
                resolve: (token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(apiClient(originalRequest));
                },
                reject: (err: any) => reject(err),
            });
        });
    }

    isRefreshing = true;

    try {
        const newToken = await authService.refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
    } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        // Redirect về trang chủ thay vì /unauthorized vì login là modal
        window.location.href = "/";
        return Promise.reject(err);
    } finally {
        isRefreshing = false;
    }
};
