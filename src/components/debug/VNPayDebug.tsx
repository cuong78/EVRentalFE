import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const VNPayDebug: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show in development
        if (import.meta.env.DEV) {
            updateDebugInfo();
            setIsVisible(true);
        }
    }, []);

    const updateDebugInfo = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const params: Record<string, string> = {};
        urlParams.forEach((value, key) => {
            params[key] = value;
        });

        const pendingPayment = localStorage.getItem('pendingPayment');
        
        setDebugInfo({
            currentUrl: window.location.href,
            currentPort: window.location.port,
            expectedUrl: 'http://localhost:3000/payment/vnpay-return',
            hasHashInUrl: window.location.href.includes('/#/'),
            urlParams: params,
            urlParamsCount: Object.keys(params).length,
            pendingPayment: pendingPayment ? JSON.parse(pendingPayment) : null,
            timestamp: new Date().toLocaleTimeString()
        });
    };

    const clearPendingPayment = () => {
        localStorage.removeItem('pendingPayment');
        updateDebugInfo();
    };

    const simulateSuccess = () => {
        localStorage.setItem('pendingPayment', JSON.stringify({
            bookingId: 'test-booking-123',
            timestamp: Date.now()
        }));
        updateDebugInfo();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4 max-w-md z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    VNPay Debug Info
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
                    <strong>Current URL:</strong>
                    <div className="bg-gray-100 p-1 rounded text-xs break-all">
                        {debugInfo.currentUrl}
                    </div>
                </div>

                <div>
                    <strong>Port:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.currentPort === '3000' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {debugInfo.currentPort || 'N/A'}
                    </span>
                </div>

                <div>
                    <strong>Expected URL:</strong>
                    <div className="bg-blue-100 p-1 rounded text-xs break-all">
                        {debugInfo.expectedUrl}
                    </div>
                </div>

                <div>
                    <strong>Has Hash (#):</strong>
                    <span className={`ml-1 px-2 py-1 rounded ${
                        debugInfo.hasHashInUrl ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {debugInfo.hasHashInUrl ? 'YES (BAD)' : 'NO (GOOD)'}
                    </span>
                </div>

                <div>
                    <strong>URL Params ({debugInfo.urlParamsCount}):</strong>
                    {debugInfo.urlParamsCount > 0 ? (
                        <div className="bg-green-100 p-1 rounded text-xs">
                            {Object.entries(debugInfo.urlParams || {}).map(([key, value]) => (
                                <div key={key}>{key}: {String(value)}</div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-yellow-100 p-1 rounded text-xs">No params</div>
                    )}
                </div>

                <div>
                    <strong>Pending Payment:</strong>
                    {debugInfo.pendingPayment ? (
                        <div className="bg-blue-100 p-1 rounded text-xs">
                            ID: {debugInfo.pendingPayment.bookingId}<br/>
                            Time: {new Date(debugInfo.pendingPayment.timestamp).toLocaleTimeString()}
                        </div>
                    ) : (
                        <div className="bg-gray-100 p-1 rounded text-xs">None</div>
                    )}
                </div>

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
                    onClick={clearPendingPayment}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                    Clear Pending
                </button>
                <button
                    onClick={simulateSuccess}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                    Simulate Success
                </button>
            </div>
        </div>
    );
};

export default VNPayDebug;
