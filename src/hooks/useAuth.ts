import { useContext, useState } from "react";
import type { LoginFormData, RegisterFormData } from "../types/auth.ts";
import { authService } from "../service/authService.ts";
import { showErrorToast, showSuccessToast } from "../utils/show-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context.tsx";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");

    const { user, setUser } = context;
    const token = localStorage.getItem("token");
    const isAdmin = user?.roles[0]?.roleName === "ADMIN";
    const isManager = user?.roles[0]?.roleName === "MANAGER";
    const isEmployee = user?.roles[0]?.roleName === "EMPLOYEE";

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const register = async (data: RegisterFormData, onSuccess?: () => void) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            showSuccessToast("Đăng ký thành công!");
            onSuccess?.();
            return response;
        } catch (error: any) {
            showErrorToast(error?.message || "Đăng ký thất bại");
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

            localStorage.setItem("token", res.token);

            const infoRes = await authService.getInfo();

            if (infoRes.code === 200 && infoRes.data) {
                const userInfo = infoRes.data;
                setUser(userInfo);
                showSuccessToast("Đăng nhập thành công!");

                onSuccess?.();
                if (userInfo.roles[0]?.roleName === "MEMBER" || userInfo == null) navigate("/");
                else navigate("/admin");

                return userInfo;
            } else {
                showErrorToast("Không lấy được thông tin người dùng");
                return null;
            }
        } catch (error: any) {
            showErrorToast(error?.message || "Đăng nhập thất bại");
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
        try {
            const response = await authService.getInfo();
            if (response.code === 200 && response.data) {
                setUser(response.data);
            } else {
                showErrorToast(response.message || "Lấy thông tin người dùng thất bại");
            }
        } catch (error) {
            showErrorToast("Lỗi khi lấy thông tin người dùng");
        }
    }
    const loginWithGoogle = async (code: string) => {
        setIsLoading(true);
        try {
            const response = await authService.loginWithGoogle(code);
            if (response.code === 200) {
                const token = response.data.token;
                localStorage.setItem("token", token);
                console.log(token);
                await getMyInfo();
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
