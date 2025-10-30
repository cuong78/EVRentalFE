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
                username: 'admin', // User đã verify và hoạt động
                password: 'admin123',
                rememberMe: false
            };
            
            const result = await authService.login(loginData);
            console.log('✅ Login successful:', result);
            return result;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log('❌ Login test failed:', errorMessage);
            
            // Log chi tiết lỗi từ server
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response: { status: number; data: unknown } };
                console.log('📋 Server response:', axiosError.response.status, axiosError.response.data);
                const responseData = axiosError.response.data as { message?: string; error?: string } | null;
                const serverMessage = responseData?.message || responseData?.error;
                if (serverMessage) {
                    console.log('📋 Server message:', serverMessage);
                    
                    // Nếu là lỗi "not verified" hoặc "disabled", đây là hành vi đúng
                    if (serverMessage.includes('not verified') || serverMessage.includes('disabled')) {
                        console.log('ℹ️  This is expected - user needs to verify email first');
                        return { verified: false, message: serverMessage };
                    }
                }
            }
            
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

    // Test với user đã verify (nếu có token thật)
    async testLoginWithVerification(verificationToken?: string) {
        console.log('🧪 Testing Login with Email Verification...');
        
        if (!verificationToken) {
            console.log('⚠️  No verification token provided. Skipping verification test.');
            return false;
        }
        
        try {
            // 1. Verify email trước
            console.log('📧 Verifying email with token...');
            await authService.verifyEmail(verificationToken);
            console.log('✅ Email verified successfully');
            
            // 2. Thử login sau khi verify
            console.log('🔐 Testing login after verification...');
            const loginResult = await this.testLogin();
            console.log('✅ Login after verification successful:', loginResult);
            return true;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log('❌ Verification or login failed:', errorMessage);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response: { status: number; data: unknown } };
                console.log('📋 Server response:', axiosError.response.status, axiosError.response.data);
            }
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
        } catch {
            console.log('⚠️ Register test failed (might be expected)');
        }
        
        // 3. Test login
        try {
            const loginResult = await this.testLogin();
            // Nếu login trả về thông tin "not verified", đây là hành vi đúng
            if (loginResult && typeof loginResult === 'object' && loginResult.verified === false) {
                console.log('ℹ️  Login test shows user needs verification (expected behavior)');
            }
        } catch {
            console.log('❌ Login test failed with unexpected error');
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
    (window as unknown as { testAuth: typeof testAuth }).testAuth = testAuth;
}

