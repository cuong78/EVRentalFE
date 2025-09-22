import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Authenticate() {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const called = useRef(false);

    useEffect(() => {
        const handleAuthentication = async () => {
            if (called.current) return;
            called.current = true;
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");

            if (code) {
                const success = await loginWithGoogle(code);
                window.history.replaceState({}, document.title, window.location.pathname);
                if (success) {
                    navigate("/");
                    return;
                }
            }
            navigate("/");
        };

        handleAuthentication();
    }, [loginWithGoogle, navigate]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Đang xử lý đăng nhập...</Typography>
        </Box>
    );
}
