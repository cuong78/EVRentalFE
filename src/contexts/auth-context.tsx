import { createContext, useState, useEffect, type ReactNode } from "react";
import type { AuthContextType, UserDetails } from "../types/auth";
import { authService } from "../service/authService";
import { Box, Skeleton } from "@mui/material";
import { tokenManager } from "../utils/token-manager";
import { useTokenExpiration } from "../hooks/useTokenExpiration";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Sử dụng hook để xử lý token expiration
    useTokenExpiration();

    useEffect(() => {
        const checkToken = async () => {
            const token = tokenManager.getToken();

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                // Fetch thông tin user thật từ API nếu có token
                console.log("🔄 AuthContext: Token found, fetching user profile...");
                const profileData = await authService.getMyInfo();
                console.log("✅ AuthContext: User profile loaded:", profileData);
                
                const userInfo = {
                    userId: profileData.userId || 0,
                    username: profileData.username || "User",
                    fullName: profileData.fullName || profileData.username || "User",
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
                    roles: profileData.roles || [],
                    permissions: profileData.permissions || []
                };
                
                setUser(userInfo);
            } catch (error) {
                console.error('❌ AuthContext: Error fetching user info:', error);
                // Nếu API fail (token expired, etc), clear user
                setUser(null);
                tokenManager.removeToken();
            }

            setLoading(false);
        };

        checkToken();

        // Kiểm tra token định kỳ mỗi 5 phút (chỉ kiểm tra tồn tại)
        const interval = setInterval(async () => {
            try {
                const token = tokenManager.getToken();
                if (!token) {
                    console.log('No token found, clearing user');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error in token check interval:', error);
            }
        }, 5 * 60 * 1000);

        // Lắng nghe event từ useTokenExpiration để clear user state
        const handleTokenExpired = () => {
            setUser(null);
        };

        window.addEventListener('showLoginModal', handleTokenExpired);

        return () => {
            clearInterval(interval);
            window.removeEventListener('showLoginModal', handleTokenExpired);
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ padding: 4 }} className="relative z-100">
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} width="60%" />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} width="80%" />
                <Skeleton variant="rounded" height={400} />
            </Box>
        );
    }

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
