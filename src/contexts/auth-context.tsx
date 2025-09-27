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
                // Chỉ kiểm tra token có tồn tại trong localStorage
                if (token) {
                    // Tạo user object cơ bản từ token
                    const basicUser = {
                        userId: 0,
                        username: "User",
                        fullName: "User",
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
                        roles: [],
                        permissions: []
                    };
                    setUser(basicUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking token:', error);
                setUser(null);
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
