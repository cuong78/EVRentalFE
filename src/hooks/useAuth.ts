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

    const login = async (
        data: LoginFormData,
        onSuccess?: () => void,
        options?: { redirectTo?: string | null }
    ) => {
        setIsLoading(true);
        try {
            const res = await authService.login(data); // res: LoginResponse

            if (!res?.token) {
                showErrorToast("Đăng nhập thất bại: Không nhận được token");
                return null;
            }

            // Lưu token vào localStorage
            localStorage.setItem("token", res.token);
            
            // Fetch thông tin user đầy đủ từ API profile
            console.log("📡 Fetching user profile from API...");
            const profileData = await authService.getMyInfo();
            console.log("👤 Profile data:", profileData);
            
            // Tạo user object từ profile API
            const userInfo = {
                userId: profileData.userId || 0,
                username: profileData.username || data.username,
                fullName: profileData.fullName || profileData.username || data.username,
                email: profileData.email || data.username,
                phoneNumber: profileData.phoneNumber || profileData.phone || "",
                identityCard: profileData.identityCard || "",
                gender: (profileData.gender || 'OTHER') as 'MALE' | 'FEMALE' | 'OTHER',
                dateOfBirth: profileData.dateOfBirth || "",
                address: profileData.address || "",
                avatarUrl: profileData.avatarUrl || "",
                memberScore: profileData.memberScore || 0,
                status: (profileData.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'BANNED' | string,
                deleted: profileData.deleted || false,
                roles: profileData.roles || res.roles || [],
                permissions: profileData.permissions || []
            };

            setUser(userInfo);
            showSuccessToast("Đăng nhập thành công!");

            onSuccess?.();
            
            // Debug: Log roles từ profile API
            console.log("🔐 Profile API Roles:", userInfo.roles);
            
            // Get role name - xử lý cả array of strings và array of objects
            const getRoleName = (roles: any[]) => {
                if (!roles || roles.length === 0) return null;
                const firstRole = roles[0];
                // Nếu role là string trực tiếp (ví dụ: ["ADMIN"])
                if (typeof firstRole === 'string') return firstRole;
                // Nếu role là object với property roleName (ví dụ: [{roleName: "ADMIN"}])
                if (typeof firstRole === 'object' && firstRole.roleName) return firstRole.roleName;
                return null;
            };
            
            const roleName = getRoleName(userInfo.roles);
            console.log("🔐 Role Name:", roleName);
            
            // Điều hướng sau đăng nhập
            const redirect = options?.redirectTo;
            if (redirect === null) {
                // Không điều hướng, ở lại trang hiện tại
            } else if (typeof redirect === 'string') {
                navigate(redirect);
            } else {
                // Mặc định: chuyển theo role từ profile API
                if (roleName) {
                    console.log("🔀 Redirecting based on role:", roleName);
                    
                    // Redirect dựa trên role
                    if (roleName === "ADMIN") {
                        console.log("➡️ Navigating to /admin");
                        navigate("/admin");
                    } else if (roleName === "STAFF") {
                        console.log("➡️ Navigating to /staff");
                        navigate("/staff");
                    } else if (roleName === "CUSTOMER" || roleName === "MEMBER") {
                        console.log("➡️ Navigating to /");
                        navigate("/");
                    } else {
                        // Default cho các role khác
                        console.log("➡️ Unknown role:", roleName, "- navigating to /");
                        navigate("/");
                    }
                } else {
                    // Không có role thì về trang chủ
                    console.log("⚠️ No roles found, navigating to /");
                    navigate("/");
                }
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
        // API getMyInfo đã được gọi trong login và loginWithGoogle
        // Function này giữ lại để compatibility
        try {
            const data = await authService.getMyInfo();
            return data;
        } catch (error) {
            console.error("Failed to fetch user info:", error);
            throw error;
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
                
                // Fetch thông tin user đầy đủ từ API profile
                console.log("📡 Fetching user profile from API (Google login)...");
                const profileData = await authService.getMyInfo();
                console.log("👤 Profile data (Google):", profileData);
                
                // Tạo user object từ profile API
                const userInfo = {
                    userId: profileData.userId || 0,
                    username: profileData.username || "Google User",
                    fullName: profileData.fullName || profileData.username || "Google User",
                    email: profileData.email || "",
                    phoneNumber: profileData.phoneNumber || profileData.phone || "",
                    identityCard: profileData.identityCard || "",
                    gender: (profileData.gender || 'OTHER') as 'MALE' | 'FEMALE' | 'OTHER',
                    dateOfBirth: profileData.dateOfBirth || "",
                    address: profileData.address || "",
                    avatarUrl: profileData.avatarUrl || "",
                    memberScore: profileData.memberScore || 0,
                    status: (profileData.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'BANNED' | string,
                    deleted: profileData.deleted || false,
                    roles: profileData.roles || response.data.roles || [],
                    permissions: profileData.permissions || []
                };
                setUser(userInfo);
                
                // Debug: Log roles từ profile API
                console.log("🔐 Profile API Roles (Google):", userInfo.roles);
                
                // Get role name - xử lý cả array of strings và array of objects
                const getRoleName = (roles: any[]) => {
                    if (!roles || roles.length === 0) return null;
                    const firstRole = roles[0];
                    // Nếu role là string trực tiếp (ví dụ: ["ADMIN"])
                    if (typeof firstRole === 'string') return firstRole;
                    // Nếu role là object với property roleName (ví dụ: [{roleName: "ADMIN"}])
                    if (typeof firstRole === 'object' && firstRole.roleName) return firstRole.roleName;
                    return null;
                };
                
                const roleName = getRoleName(userInfo.roles);
                console.log("🔐 Role Name (Google):", roleName);
                
                // Redirect dựa trên role từ profile API
                if (roleName) {
                    console.log("🔀 Redirecting based on role:", roleName);
                    
                    if (roleName === "ADMIN") {
                        console.log("➡️ Navigating to /admin");
                        navigate("/admin");
                    } else if (roleName === "STAFF") {
                        console.log("➡️ Navigating to /staff");
                        navigate("/staff");
                    } else if (roleName === "CUSTOMER" || roleName === "MEMBER") {
                        console.log("➡️ Navigating to /");
                        navigate("/");
                    } else {
                        console.log("➡️ Unknown role:", roleName, "- navigating to /");
                        navigate("/");
                    }
                } else {
                    console.log("⚠️ No roles found, navigating to /");
                    navigate("/");
                }
                
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
