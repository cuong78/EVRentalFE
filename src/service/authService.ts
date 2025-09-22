import { apiClient } from "./api";
import type { LoginFormData, LoginResponse, RegisterFormData, RegisterResponse, UserDetails } from "../types/auth";
import { errorResponse, type ApiResponses } from "../types/api-response";
import { API } from "../constants";
import { tokenManager } from "../utils/token-manager";
import axios from 'axios';

const API_BASE = `${API.BASE}/auth`;
const API_GET_USER = `${API.USER}/accounts/myInfor`;
const API_FORGOT_PASSWORD = `${API.BASE}/forgot-password`;

export const authService = {
    register: async (data: RegisterFormData) => {
        const response = await apiClient.post<ApiResponses<RegisterResponse>>("/auth/register", data);
        const responseData = response.data;
        if (responseData.code === 200) {
            return responseData.data;
        } else {
            throw new Error(responseData.message);
        }
    },

    login: async (data: LoginFormData) => {
        const response = await apiClient.post<ApiResponses<LoginResponse>>(`${API_BASE}/login`, data);
        const responseData = response.data;

        if (responseData.code === 200 && responseData?.data?.token) {
            // Sử dụng tokenManager để lưu token và lên lịch refresh
            tokenManager.saveToken(responseData.data.token);
            localStorage.setItem("role", JSON.stringify(responseData?.data?.roles ?? ""));
            return responseData.data;
        } else {
            throw new Error(responseData.message);
        }
    },

    getUserFromStorage: () => {
        const roles = JSON.parse(localStorage.getItem("role") || "[]");
        return roles[0] || null;
    },

    introspect: async (token: string): Promise<boolean> => {
        try {
            const response = await apiClient.post(`${API_BASE}/introspect`, { token: token });
            return response.data?.data?.valid === true;
        } catch (error) {
            console.error("Introspect failed", error);
            return false;
        }
    },

    logout: async (token: string): Promise<ApiResponses<any>> => {
        try {
            const response = await apiClient.post(`${API_BASE}/logout`, { token: token });
            return response.data;
        } catch (error) {
            console.error("Logout thất bại", error);
            return errorResponse<any>("Failed to logout");
        }
    },

    getInfo: async (): Promise<ApiResponses<UserDetails>> => {
        try {
            const response = await apiClient.get(`${API_GET_USER}`);
            return response.data;
        } catch (error) {
            console.error("GetInfo thất bại", error);
            return errorResponse<UserDetails>("Failed to getInfo");
        }
    },
    loginWithGoogle: async (code: string) => {
        const response = await apiClient.post(`${API_BASE}/login-google`, null, {
            params: { code },
        });
        console.log(code);

        localStorage.setItem("token", response?.data?.token ?? "");
        return response.data;
    },

    requestPasswordReset: async (email: string): Promise<ApiResponses<void>> => {
        try {
            const response = await apiClient.post(`${API_FORGOT_PASSWORD}/request`, { email });

            return response.data;
        } catch (error) {
            console.error("Yêu cầu đổi mật khẩu thất bại", error);
            return errorResponse<void>("Failed to request password reset");
        }
    },

    verifyPassword: async (email: string, otp: number): Promise<ApiResponses<void>> => {
        console.log(`${API_FORGOT_PASSWORD}/verify`);
        try {
            const response = await apiClient.post(`${API_FORGOT_PASSWORD}/verify`, { email, otp });
            return response.data;
        } catch (error: any) {
            console.error("Xác minh OTP thất bại", error);
            throw error;
        }
    },

    resetPassword: async (email: string, password: string, confirmPassword: string): Promise<ApiResponses<void>> => {
        try {
            const response = await apiClient.post(`${API_FORGOT_PASSWORD}/reset`, { email, password, confirmPassword });
            return response.data;
        } catch (error) {
            console.error("Đặt lại mật khẩu thất bại", error);
            return errorResponse<void>("Failed to reset password");
        }
    },

    refreshToken: async (): Promise<string> => {
        const currentToken = tokenManager.getToken();

        if (!currentToken) throw new Error("No token available for refresh");

        // Sử dụng axios trực tiếp thay vì apiClient để tránh vòng lặp vô hạn
        const response = await axios.post(`${API.BASE}/auth/refresh`, {
            token: currentToken,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            withCredentials: true
        });

        const newToken = response.data?.data?.token;

        if (newToken) {
            tokenManager.saveToken(newToken);
            return newToken;
        } else {
            throw new Error("Failed to refresh token");
        }
    }


};
