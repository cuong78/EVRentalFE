import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const LoginDebug: React.FC = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show in development
        if (import.meta.env.DEV) {
            updateDebugInfo();
            setIsVisible(true);
        }
    }, [user, location, isLoading]);

    const updateDebugInfo = () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        setDebugInfo({
            isLoggedIn: !!user,
            hasToken: !!token,
            hasUserInStorage: !!savedUser,
            currentPath: location.pathname,
            expectedPath: user ? (user.roles?.some(r => r.roleName === 'ADMIN') ? '/admin' : '/') : '/',
            navigationWorking: user ? location.pathname === (user.roles?.some(r => r.roleName === 'ADMIN') ? '/admin' : '/') : true,
            userInfo: user ? {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                roles: user.roles?.map(r => r.roleName) || []
            } : null,
            isLoading,
            timestamp: new Date().toLocaleTimeString()
        });
    };

    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateDebugInfo();
        window.location.reload();
    };

    const forceNavigateHome = () => {
        window.location.href = '/';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 bg-white border-2 border-green-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-green-800 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Login Debug
                </h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2 text-xs">
                <div>
                    <strong>Login Status:</strong>
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {debugInfo.isLoggedIn ? 'Logged In' : 'Not Logged In'}
                    </span>
                </div>

                <div>
                    <strong>Has Token:</strong>
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {debugInfo.hasToken ? 'YES' : 'NO'}
                    </span>
                </div>

                <div>
                    <strong>User in Storage:</strong>
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.hasUserInStorage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {debugInfo.hasUserInStorage ? 'YES' : 'NO'}
                    </span>
                </div>

                <div>
                    <strong>Current Path:</strong>
                    <div className="bg-gray-100 p-1 rounded text-xs break-all">
                        {debugInfo.currentPath}
                    </div>
                </div>

                <div>
                    <strong>Expected Path:</strong>
                    <div className="bg-blue-100 p-1 rounded text-xs break-all">
                        {debugInfo.expectedPath}
                    </div>
                </div>

                <div>
                    <strong>Navigation OK:</strong>
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.navigationWorking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {debugInfo.navigationWorking ? 'YES' : 'NO - NEEDS FIX'}
                    </span>
                </div>

                <div>
                    <strong>Loading:</strong>
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {debugInfo.isLoading ? 'YES' : 'NO'}
                    </span>
                </div>

                {debugInfo.userInfo && (
                    <div>
                        <strong>User Info:</strong>
                        <div className="bg-blue-100 p-1 rounded text-xs">
                            <div>ID: {debugInfo.userInfo.id}</div>
                            <div>Username: {debugInfo.userInfo.username}</div>
                            <div>Name: {debugInfo.userInfo.fullName}</div>
                            <div>Roles: {debugInfo.userInfo.roles.join(', ')}</div>
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-500">
                    Last updated: {debugInfo.timestamp}
                </div>
            </div>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={updateDebugInfo}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                </button>
                <button
                    onClick={clearAuth}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                    Clear Auth
                </button>
                <button
                    onClick={forceNavigateHome}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default LoginDebug;
