import React, { useState, useEffect } from 'react';
import { API } from '../../constants';

export const BackendStatus: React.FC = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    const checkBackendStatus = async () => {
        setStatus('checking');
        try {
            // Sử dụng XMLHttpRequest để test connection tới API.BASE thay vì hardcode localhost
            const base = API.BASE;
            if (!base) {
                setStatus('disconnected');
                setLastCheck(new Date());
                return;
            }

            const swaggerUrlEnv = (import.meta as any).env?.VITE_SWAGGER_URL as string | undefined;
            let testUrl = '';
            if (swaggerUrlEnv) {
                testUrl = swaggerUrlEnv;
            } else {
                let origin = '';
                try {
                    const url = new URL(base);
                    origin = `${url.protocol}//${url.host}`;
                } catch {
                    origin = base.replace(/\/api\/?$/, '');
                }
                testUrl = `${origin}/swagger-ui/index.html`;
            }
            const xhr = new XMLHttpRequest();
            xhr.open('GET', testUrl, true);
            xhr.timeout = 5000; // 5 seconds timeout
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setStatus('connected');
                } else {
                    setStatus('disconnected');
                }
                setLastCheck(new Date());
            };
            
            xhr.onerror = () => {
                setStatus('disconnected');
                setLastCheck(new Date());
            };
            
            xhr.ontimeout = () => {
                setStatus('disconnected');
                setLastCheck(new Date());
            };
            
            xhr.send();
        } catch (error) {
            setStatus('disconnected');
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        checkBackendStatus();
        // Check mỗi 30 giây
        const interval = setInterval(checkBackendStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-100';
            case 'disconnected': return 'text-red-600 bg-red-100';
            case 'checking': return 'text-yellow-600 bg-yellow-100';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'connected': return 'Backend Connected';
            case 'disconnected': return 'Backend Disconnected';
            case 'checking': return 'Checking...';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor()}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                        status === 'connected' ? 'bg-green-500' : 
                        status === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span>{getStatusText()}</span>
                    <button
                        onClick={checkBackendStatus}
                        className="ml-2 text-xs underline hover:no-underline"
                    >
                        Refresh
                    </button>
                </div>
                {lastCheck && (
                    <div className="text-xs opacity-75 mt-1">
                        Last check: {lastCheck.toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
};
