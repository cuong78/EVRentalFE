import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user } = useAuth();

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

    const userRole = user?.roles ? getRoleName(user.roles) : null;

    console.log('🔒 ProtectedRoute check:', { userRole, allowedRoles, user });

    // Nếu không có user hoặc không có role, redirect về trang chủ
    if (!user || !userRole) {
        console.log('⚠️ No user or role, redirecting to home');
        return <Navigate to="/" replace />;
    }

    // Kiểm tra role có trong danh sách allowed không
    if (!allowedRoles.includes(userRole)) {
        console.log('🚫 Role not allowed, redirecting to unauthorized');
        return <Navigate to="/unauthorized" replace />;
    }

    // Nếu có quyền, render children
    console.log('✅ Access granted');
    return <>{children}</>;
};

