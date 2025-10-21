// Utility để test authentication flow
// Import và sử dụng trong component để debug

import { authService } from '../service/authService';
import { tokenManager } from './token-manager';

export const testAuth = {
    // Test login với user mẫu
    async testLogin() {
        console.log('🧪 Testing Login...');
        try {
            const loginData = {
                username: 'user123',
                password: 'user123',
                rememberMe: false
            };
            
            const result = await authService.login(loginData);
            console.log('✅ Login successful:', result);
            return result;
        } catch (error) {
            console.log('❌ Login failed:', error);
            throw error;
        }
    },

    // Test register với user mẫu
    async testRegister() {
        console.log('🧪 Testing Register...');
        try {
            const registerData = {
                username: `testuser${Date.now()}`,
                password: 'password123',
                confirmPassword: 'password123',
                email: `test${Date.now()}@example.com`,
                phone: `0123456${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // Tạo phone unique
            };
            
            const result = await authService.register(registerData);
            console.log('✅ Register successful:', result);
            return result;
        } catch (error) {
            console.log('❌ Register failed:', error);
            throw error;
        }
    },

    // Test token management
    testTokenManager() {
        console.log('🧪 Testing Token Manager...');
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        
        // Test decode
        const decoded = tokenManager.decodeToken(testToken);
        console.log('✅ Token decoded:', decoded);
        
        // Test expiration
        const isExpired = tokenManager.isTokenExpired(testToken);
        console.log('✅ Token expired:', isExpired);
        
        // Test current token
        const currentToken = tokenManager.getToken();
        console.log('✅ Current token:', currentToken ? 'Exists' : 'None');
    },

    // Test API connection
    async testApiConnection() {
        console.log('🧪 Testing API Connection...');
        try {
            // Test với register endpoint (đơn giản hơn)
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `testuser${Date.now()}`,
                    password: 'password123',
                    confirmPassword: 'password123',
                    email: `test${Date.now()}@example.com`,
                    phone: `0123456${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // Tạo phone unique
                })
            });
            
            // Nếu có response (dù là 409 conflict), nghĩa là backend đang chạy
            if (response.status === 200 || response.status === 409) {
                console.log('✅ API Connection successful');
                return true;
            } else {
                console.log('❌ API Connection failed:', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ API Connection failed:', error);
            return false;
        }
    },

    // Test toàn bộ authentication flow
    async testFullAuthFlow() {
        console.log('🧪 Testing Full Authentication Flow...');
        
        // 1. Test API connection
        const apiConnected = await this.testApiConnection();
        if (!apiConnected) {
            console.log('❌ Cannot proceed - API not connected');
            return false;
        }
        
        // 2. Test register
        try {
            await this.testRegister();
        } catch (error) {
            console.log('⚠️ Register test failed (might be expected)');
        }
        
        // 3. Test login
        try {
            await this.testLogin();
        } catch (error) {
            console.log('❌ Login test failed');
            return false;
        }
        
        // 4. Test token manager
        this.testTokenManager();
        
        console.log('✅ Full authentication flow test completed');
        return true;
    }
};

// Export để sử dụng trong console browser
if (typeof window !== 'undefined') {
    (window as any).testAuth = testAuth;
}

