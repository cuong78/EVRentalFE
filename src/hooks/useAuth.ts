import { useContext, useState } from "react";
import type { LoginFormData, RegisterFormData } from "../types/auth.ts";
import { authService } from "../service/authService.ts";
import { showErrorToast, showSuccessToast } from "../utils/show-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context.tsx";
import { tokenManager } from "../utils/token-manager";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");

    const { user, setUser } = context;
    const token = localStorage.getItem("token");
    const roleHas = (name: string) => (user?.roles || []).some(r => (r?.roleName || '').toUpperCase() === name);
    const isAdmin = roleHas("ADMIN");
    const isManager = roleHas("MANAGER");
    const isEmployee = roleHas("EMPLOYEE");

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const register = async (data: RegisterFormData, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            showSuccessToast(response?.message || "Đăng ký thành công! Vui lòng kiểm tra email của bạn.");
            onSuccess?.();
            return response;
        } catch (error: any) {
            const status = error?.response?.status;
            const serverMessage = error?.response?.data?.message;
            if (status === 409) {
                showErrorToast(serverMessage || "Tên đăng nhập, email hoặc số điện thoại đã tồn tại");
            } else {
                showErrorToast(error?.message || "Đăng ký thất bại");
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginFormData, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            const res = await authService.login(data); // res: LoginResponse

            if (!res?.token) {
                showErrorToast("Đăng nhập thất bại: Không nhận được token");
                return null;
            }

            // Lưu token và lên lịch refresh
            tokenManager.saveToken(res.token);
            
            // Giải mã token để lấy roles (backend không trả roles trong body)
            const payload: any = tokenManager.decodeToken(res.token) || {};
            const jwtRoles: string[] = Array.isArray(payload?.roles) ? payload.roles : [];
            const normalizedRoles = jwtRoles.map((r) => {
                const upper = r.toString().toUpperCase();
                const noPrefix = upper.startsWith("ROLE_") ? upper.replace("ROLE_", "") : upper;
                return { roleId: 0, roleName: noPrefix as any, permissions: [] };
            });
            const roleNames = normalizedRoles.map(r => r.roleName);
            const isPrivileged = roleNames.some(n => n === 'ADMIN' || n === 'MANAGER' || n === 'EMPLOYEE');
            
            // Tạo user object từ token response (không cần gọi API getInfo)
            const userInfo = {
                userId: 0, // Sẽ được cập nhật sau khi có API
                username: data.username,
                fullName: data.username, // Tạm thời dùng username
                email: data.username, // Giả sử username là email
                phoneNumber: "",
                identityCard: "",
                gender: 'OTHER' as const,
                dateOfBirth: "",
                address: "",
                avatarUrl: "",
                memberScore: 0,
                status: 'ACTIVE' as const,
                deleted: false,
                roles: normalizedRoles,
                permissions: []
            };

            setUser(userInfo);
            showSuccessToast("Đăng nhập thành công!");

            onSuccess?.();
            
            // Chuyển hướng dựa trên role (ưu tiên admin pages nếu có quyền)
            if (isPrivileged) {
                navigate("/admin");
                if (!window.location.hash.includes("#/admin")) {
                    window.location.hash = "#/admin";
                }
            } else {
                navigate("/");
            }

            return userInfo;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
            showErrorToast(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };



    const logout = async () => {
        setIsLoading(true);
        try {
            const response = await authService.logout(token || "");

            if (response.code === 200) {
                // Xóa toàn bộ localStorage
                localStorage.clear();
                setUser(null);
                showSuccessToast(response.message || "Đăng Xuất Thành Công!");
                window.location.href = "/";
            } else {
                showErrorToast(response.message || "Đăng Xuất Thất Bại");
            }
        } catch (error) {
            showErrorToast("Đăng xuất thất bại!");
            // Vẫn xóa localStorage trong trường hợp lỗi
            localStorage.clear();
            setUser(null);
            window.location.href = "/";
        } finally {
            setIsLoading(false);
        }
    };

    const hasPermission = (name: string) => {
        return user?.roles[0]?.permissions.some((p) => p.permissionName === name);
    };

    const getMyInfo = async () => {
        // Không cần gọi API getInfo nữa
        console.log("getMyInfo called but no API available");
    }
    const loginWithGoogle = async (code: string) => {
        setIsLoading(true);
        try {
            const response = await authService.loginWithGoogle(code);
            if (response.code === 200) {
                const token = response.data.token;
                localStorage.setItem("token", token);
                console.log(token);
                
                // Tạo user object cơ bản
                const basicUser = {
                    userId: 0,
                    username: "Google User",
                    fullName: "Google User",
                    email: "",
                    phoneNumber: "",
                    identityCard: "",
                    gender: 'OTHER' as const,
                    dateOfBirth: "",
                    address: "",
                    avatarUrl: "",
                    memberScore: 0,
                    status: 'ACTIVE' as const,
                    deleted: false,
                    roles: response.data.roles || [],
                    permissions: []
                };
                setUser(basicUser);
                return true;
            }
            return false;
        } catch (error) {
            showErrorToast("Đăng nhập Google thất bại");
            return false;
        } finally {
            setIsLoading(false);
        }
    };



    const resetPassword = async (email: string, newPassword: string, confirmPassword: string) => {
        setIsLoading(true);
        try {
            const response = await authService.resetPassword(email, newPassword, confirmPassword);
            if (response.code === 200) {
                showSuccessToast("Đặt lại mật khẩu thành công");
            } else {
                showErrorToast(response.message || "Đặt lại mật khẩu thất bại");
                throw new Error(response.message || "Đặt lại mật khẩu không thành công");
            }
        } catch (error) {
            throw new Error(error as string || "Đặt lại mật khẩu không thành công");
        } finally {
            setIsLoading(false);
        }
    };

    const requestEmailVerification = async (email: string) => {
        setIsLoading(true);
        try {
            const response = await authService.requestPasswordReset(email);
            if (response.code === 200) {
                showSuccessToast(response.message || "Đã gửi email xác minh đến địa chỉ của bạn");
            } else {
                showErrorToast(response.message || "Gửi yêu cầu xác minh email thất bại");
                throw new Error(response.message || "Email không tồn tại");
            }
        } catch (error) {
            showErrorToast(error as string || "Gửi yêu cầu xác minh email thất bại");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const verifyPassword = async (email: string, otp: number) => {
        setIsLoading(true);
        try {
            const response = await authService.verifyPassword(email, otp);
            if (response.code === 200) {
                showSuccessToast(response.message || "Xác minh thành công");
            } else {
                showErrorToast(response.message || "Xác minh thất bại");
                throw new Error(response.message || "Xác minh OTP không thành công");
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Xác minh OTP không thành công";
            showErrorToast(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }


    return {
        login,
        isLoading,
        user,
        register,
        setUser,
        isAdmin,
        isManager,
        isEmployee,
        logout,
        hasPermission,
        getMyInfo,
        loginWithGoogle,
        resetPassword,
        requestEmailVerification,
        verifyPassword
    };
}
