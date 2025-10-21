import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthChecker: React.FC = () => {
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            // If user data exists but no token, clear everything
            if (user && !token) {
                console.log('User data found but no token, clearing auth state');
                localStorage.clear();
                toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                window.location.href = '/';
            }
        };

        // Check on mount
        checkAuthStatus();

        // Check periodically every 5 minutes
        const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null; // This component doesn't render anything
};

export default AuthChecker;
