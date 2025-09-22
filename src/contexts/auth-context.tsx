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
                // Kiểm tra và refresh token nếu cần
                await tokenManager.checkAndRefreshToken();

                // Lấy token mới sau khi refresh (nếu có)
                const currentToken = tokenManager.getToken();
                if (!currentToken) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const valid = await authService.introspect(currentToken);
                if (valid) {
                    const response = await authService.getInfo();
                    if (response.code === 200 && response.data) {
                        setUser(response.data);
                    } else {
                        setUser(null);
                    }
                } else {
                    tokenManager.clearToken();
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking token:', error);
                // Không clear user ngay lập tức, để user vẫn có thể sử dụng
                // Chỉ clear khi thực sự cần thiết
            }

            setLoading(false);
        };

        checkToken();

        // Kiểm tra token định kỳ mỗi 5 phút
        const interval = setInterval(async () => {
            try {
                const token = tokenManager.getToken();
                if (token) {
                    const success = await tokenManager.checkAndRefreshToken();
                    if (!success) {
                        console.log('Token refresh failed in interval, clearing user');
                        setUser(null);
                    }
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
