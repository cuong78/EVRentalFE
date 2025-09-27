import { apiClient } from "./api";
import type { LoginFormData, LoginResponse, RegisterFormData, RegisterResponse, UserDetails } from "../types/auth";
import { errorResponse, type ApiResponses } from "../types/api-response";
import { API } from "../constants";
import { tokenManager } from "../utils/token-manager";
import axios from 'axios';

const API_BASE = `${API.BASE}`;
const API_GET_USER = `${API.USER}/accounts/myInfor`;
const API_FORGOT_PASSWORD = `${API.BASE}/forgot-password`;

export const authService = {
    register: async (data: RegisterFormData): Promise<{ data: any; message?: string }> => {
        // Backend expects: { username, password, confirmPassword, email, phone }
        // Our form uses phoneNumber → map to phone
        const payload = {
            username: data.username,
            password: data.password,
            confirmPassword: data.confirmPassword,
            email: data.email,
            phone: data.phoneNumber,
        };

        try {
            // Use a direct axios call WITHOUT credentials/Authorization to avoid CORS preflight issues
            const response = await axios.post(`${API.BASE}/register`, payload, {
                withCredentials: false,
                headers: { 'Content-Type': 'application/json' },
            });
            const res = response.data || {};
            const code = res.code ?? res.statusCode ?? response.status;
            if (code === 200) return { data: res.data, message: res.message };
            throw new Error(res.message || 'Register failed');
        } catch (error: any) {
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.message;
            if (status === 409) {
                // Normalize duplicate conflict message
                const message = serverMessage || 'Tên đăng nhập, email hoặc số điện thoại đã tồn tại';
                throw new Error(message);
            }
            throw error;
        }
    },

    verifyEmail: async (token: string): Promise<{ message?: string }> => {
        const response = await axios.post(`${API.BASE}/verify`, null, {
            params: { token },
            withCredentials: false,
            headers: { 'Content-Type': 'application/json' },
        });
        const res = response.data || {};
        const code = res.code ?? res.statusCode;
        if (code === 200) return { message: res.message };
        throw new Error(res.message || 'Verify email failed');
    },

    login: async (data: LoginFormData): Promise<LoginResponse> => {
        // Sử dụng axios trực tiếp để tránh CORS issue với withCredentials
        const response = await axios.post(`${API.BASE}/login`, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: false
        });
        
        const res = response.data || {};
        const code = res.statusCode ?? res.code ?? response.status;
        
        if (code === 200) {
            return {
                token: res.data.token,
                roles: res.data.roles || []
            };
        }
        
        throw new Error(res.message || 'Login failed');
    },

    logout: async (token: string): Promise<ApiResponses<any>> => {
        try {
            // Sử dụng axios trực tiếp để gửi POST request đến /api/logout
            const response = await axios.post(`${API.BASE}/logout`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: false
            });
            
            const res = response.data || {};
            const code = res.statusCode ?? res.code ?? response.status;
            
            if (code === 200) {
                return {
                    code: 200,
                    message: res.message || 'Logout successful',
                    data: res.data || null
                };
            }
            
            return errorResponse<any>(res.message || 'Logout failed');
        } catch (error: any) {
            console.error("Logout thất bại", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to logout";
            return errorResponse<any>(errorMessage);
        }
    },


    verifyPassword: async (email: string, otp: number): Promise<ApiResponses<void>> => {
        console.log(`${API_FORGOT_PASSWORD}/verify-token`);
        try {
            const response = await apiClient.post(`${API_FORGOT_PASSWORD}/verify-token`, { email, otp });
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
        const response = await axios.post(`${API.BASE}/refresh-token`, {
            token: currentToken,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            withCredentials: false
        });

        const newToken = response.data?.data?.token;

        if (newToken) {
            tokenManager.saveToken(newToken);
            return newToken;
        } else {
            throw new Error("Failed to refresh token");
        }
    },


    loginWithGoogle: async (code: string): Promise<ApiResponses<LoginResponse>> => {
        try {
            const response = await axios.post(`${API.BASE}/google-login`, { code }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: false
            });
            const res = response.data || {};
            const code_status = res.statusCode ?? res.code ?? response.status;
            
            if (code_status === 200) {
                return {
                    code: 200,
                    message: res.message || 'Google login successful',
                    data: {
                        token: res.data.token,
                        roles: res.data.roles || []
                    }
                };
            }
            
            return errorResponse<LoginResponse>(res.message || 'Google login failed');
        } catch (error: any) {
            console.error("Google login failed", error);
            return errorResponse<LoginResponse>(error?.response?.data?.message || 'Google login failed');
        }
    },

    requestPasswordReset: async (email: string): Promise<ApiResponses<void>> => {
        try {
            const response = await apiClient.post(`${API_FORGOT_PASSWORD}/request`, { email });
            return response.data;
        } catch (error) {
            console.error("Request password reset failed", error);
            return errorResponse<void>("Failed to request password reset");
        }
    }


};
