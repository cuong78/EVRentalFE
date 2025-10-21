import { useContext, useState } from "react";
import type { LoginFormData, RegisterFormData } from "../types/auth.ts";
import { authService } from "../service/authService.ts";
import { showErrorToast, showSuccessToast } from "../utils/show-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth-context.tsx";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");

    const [user, setUser] = useState<UserDetails | null>(() => {
        // Load user from localStorage on init
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        // If no token, clear user data
        if (!token && savedUser) {
            localStorage.removeItem('user');
            return null;
        }
        
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const token = localStorage.getItem("token"); 
    const isAdmin = user?.roles?.some(role => role.roleName === "ADMIN" || role.roleName === "ROLE_ADMIN");
    const isManager = user?.roles?.some(role => role.roleName === "MANAGER");
    const isEmployee = user?.roles?.some(role => role.roleName === "EMPLOYEE");

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

            if (!res?.data?.token) {
                showErrorToast("Đăng nhập thất bại: Không nhận được token");
                return null;
            }

            // Lưu token vào localStorage với key mới
            localStorage.setItem("token", res.data.token);
            if (res.data.refreshToken) {
                localStorage.setItem("refreshToken", res.data.refreshToken);
            }
            
            // Tạo user object từ token response (sẽ fetch user info sau)
            const userInfo = {
                userId: 6, // Temporary - sẽ được update từ backend
                username: data.username,
                fullName: data.username,
                email: data.username,
                phoneNumber: "",
                identityCard: "",
                gender: 'OTHER' as const,
                dateOfBirth: "",
                address: "",
                avatarUrl: "",
                memberScore: 0,
                status: 'ACTIVE' as const,
                deleted: false,
                roles: Array.isArray(res.data.roles) 
                    ? res.data.roles.map(role => ({
                        roleName: typeof role === 'string' ? role : role.roleName || role.name || 'MEMBER'
                    }))
                    : [{ roleName: 'MEMBER' }],
                permissions: []
            };

            setUser(userInfo);
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(userInfo));
            showSuccessToast("Đăng nhập thành công!");
            
            console.log('=== Login Success Debug ===');
            console.log('User info:', userInfo);
            console.log('User roles:', userInfo.roles);
            
            // Chuyển hướng dựa trên role
            const userRoles = userInfo.roles || [];
            let targetPath = "/";
            
            if (userRoles.length > 0) {
                const roleName = userRoles[0].roleName;
                console.log('Detected role:', roleName);
                if (roleName === "ADMIN") {
                    targetPath = "/admin";
                    console.log('Will navigate to /admin');
                } else {
                    targetPath = "/";
                    console.log('Will navigate to /');
                }
            } else {
                console.log('No roles found, will navigate to /');
            }

            // Force navigation immediately using window.location
            console.log('Force navigating to:', targetPath);
            
            // Close popup first
            onSuccess?.();
            
            // Try multiple navigation methods for reliability
            setTimeout(() => {
                console.log('Attempting navigation...');
                
                // Method 1: Try React Router first
                try {
                    navigate(targetPath, { replace: true });
                    console.log('React Router navigate attempted');
                } catch (error) {
                    console.log('React Router failed:', error);
                }
                
                // Method 2: Force with window.location after short delay
                setTimeout(() => {
                    if (window.location.pathname !== targetPath) {
                        console.log('React Router failed, using window.location');
                        window.location.href = targetPath;
                    } else {
                        console.log('Navigation successful via React Router');
                        // Force page refresh to ensure UI updates
                        window.location.reload();
                    }
                }, 200);
            }, 50);

            return userInfo;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
            showErrorToast(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };



    const logout = async (force = false) => {
        setIsLoading(true);
        try {
            // If force logout (due to 401), skip API call
            if (force) {
                localStorage.clear();
                setUser(null);
                showSuccessToast("Phiên đăng nhập đã hết hạn!");
                window.location.href = "/";
                return;
            }

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


    const updateUserInfo = (updatedInfo: Partial<UserDetails>) => {
        if (user) {
            const updatedUser = { ...user, ...updatedInfo };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return {
        login,
        isLoading,
        user,
        register,
        setUser,
        updateUserInfo,
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
