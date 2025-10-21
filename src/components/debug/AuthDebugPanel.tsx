// import React, { useState } from 'react';
// import { testAuth } from '../../utils/test-auth';
// import { useAuth } from '../../hooks/useAuth';

// export const AuthDebugPanel: React.FC = () => {
//     const [testResults, setTestResults] = useState<string[]>([]);
//     const { user, logout } = useAuth();

//     const addResult = (message: string) => {
//         setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
//     };

//     const clearResults = () => {
//         setTestResults([]);
//     };

//     const runApiConnectionTest = async () => {
//         addResult('Testing API connection...');
//         const result = await testAuth.testApiConnection();
//         addResult(result ? '✅ API connected' : '❌ API not connected');
//     };

    const runLoginTest = async () => {
        addResult('Testing login...');
        try {
            const result = await testAuth.testLogin();
            if (result && typeof result === 'object' && 'verified' in result && result.verified === false) {
                addResult('ℹ️ Login test shows user needs verification (expected)');
            } else {
                addResult('✅ Login test completed');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addResult(`❌ Login test failed: ${errorMessage}`);
        }
    };
//     const runLoginTest = async () => {
//         addResult('Testing login...');
//         try {
//             await testAuth.testLogin();
//             addResult('✅ Login test completed');
//         } catch (error) {
//             addResult(`❌ Login test failed: ${error}`);
//         }
//     };

//     const runRegisterTest = async () => {
//         addResult('Testing register...');
//         try {
//             await testAuth.testRegister();
//             addResult('✅ Register test completed');
//         } catch (error) {
//             addResult(`❌ Register test failed: ${error}`);
//         }
//     };

//     const runTokenTest = () => {
//         addResult('Testing token manager...');
//         testAuth.testTokenManager();
//         addResult('✅ Token manager test completed');
//     };

//     const runFullTest = async () => {
//         addResult('Running full authentication test...');
//         const result = await testAuth.testFullAuthFlow();
//         addResult(result ? '✅ Full test completed' : '❌ Full test failed');
//     };

    const runVerificationTest = async () => {
        const token = prompt('Enter verification token from email:');
        if (!token) {
            addResult('⚠️ No token provided');
            return;
        }
        addResult('Testing with verification token...');
        const result = await testAuth.testLoginWithVerification(token);
        addResult(result ? '✅ Verification test completed' : '❌ Verification test failed');
    };

    const handleLogout = async () => {
        addResult('Logging out...');
        try {
            await logout();
            addResult('✅ Logout completed');
        } catch (error) {
            addResult(`❌ Logout failed: ${error}`);
        }
    };
//     const handleLogout = async () => {
//         addResult('Logging out...');
//         try {
//             await logout();
//             addResult('✅ Logout completed');
//         } catch (error) {
//             addResult(`❌ Logout failed: ${error}`);
//         }
//     };

//     return (
//         <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
//             <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-lg font-semibold text-gray-800">Auth Debug Panel</h3>
//                 <button
//                     onClick={clearResults}
//                     className="text-sm text-gray-500 hover:text-gray-700"
//                 >
//                     Clear
//                 </button>
//             </div>

            <div className="mb-3">
                <div className="text-sm text-gray-600">
                    <strong>Current User:</strong> {user ? user.username : 'Not logged in'}
                </div>
                <div className="text-sm text-gray-600">
                    <strong>Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'None'}
                </div>
                <div className="text-sm text-gray-600">
                    <strong>Access Token:</strong>{' '}
                    {localStorage.getItem('accessToken') ? (
                        <span>Exists ({String(localStorage.getItem('accessToken')).slice(0, 8)}...)</span>
                    ) : (
                        <span>None</span>
                    )}
                </div>
                <div className="text-sm text-gray-600">
                    <strong>Refresh Token:</strong>{' '}
                    {localStorage.getItem('refreshToken') ? 'Exists' : 'None'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                    onClick={runApiConnectionTest}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                    Test API
                </button>
                <button
                    onClick={runLoginTest}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                    Test Login
                </button>
                <button
                    onClick={runRegisterTest}
                    className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                    Test Register
                </button>
                <button
                    onClick={runTokenTest}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                    Test Token
                </button>
                <button
                    onClick={runVerificationTest}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                >
                    Test Verify
                </button>
                <button
                    onClick={runFullTest}
                    className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                >
                    Run Full Test
                </button>
                {user && (
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 col-span-2"
                    >
                        Logout
                    </button>
                )}
            </div>

            <div className="border-t pt-2">
                <div className="text-sm font-medium text-gray-700 mb-1">Test Results:</div>
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                    {testResults.length === 0 ? (
                        <div className="text-gray-400">No tests run yet</div>
                    ) : (
                        testResults.map((result, index) => (
                            <div key={`result-${index}-${result.slice(0, 20)}`} className="mb-1">
                                {result}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
//             <div className="mb-3">
//                 <div className="text-sm text-gray-600">
//                     <strong>Current User:</strong> {user ? user.username : 'Not logged in'}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                     <strong>Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'None'}
//                 </div>
//             </div>

//             <div className="grid grid-cols-2 gap-2 mb-3">
//                 <button
//                     onClick={runApiConnectionTest}
//                     className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
//                 >
//                     Test API
//                 </button>
//                 <button
//                     onClick={runLoginTest}
//                     className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
//                 >
//                     Test Login
//                 </button>
//                 <button
//                     onClick={runRegisterTest}
//                     className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
//                 >
//                     Test Register
//                 </button>
//                 <button
//                     onClick={runTokenTest}
//                     className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
//                 >
//                     Test Token
//                 </button>
//                 <button
//                     onClick={runFullTest}
//                     className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 col-span-2"
//                 >
//                     Run Full Test
//                 </button>
//                 {user && (
//                     <button
//                         onClick={handleLogout}
//                         className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 col-span-2"
//                     >
//                         Logout
//                     </button>
//                 )}
//             </div>

//             <div className="border-t pt-2">
//                 <div className="text-sm font-medium text-gray-700 mb-1">Test Results:</div>
//                 <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
//                     {testResults.length === 0 ? (
//                         <div className="text-gray-400">No tests run yet</div>
//                     ) : (
//                         testResults.map((result, index) => (
//                             <div key={index} className="mb-1">
//                                 {result}
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

