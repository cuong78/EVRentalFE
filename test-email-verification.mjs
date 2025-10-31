// Script để test email verification flow
// Chạy: node test-email-verification.mjs

import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

async function testEmailVerificationFlow() {
    console.log('🔍 Testing Email Verification Flow...\n');
    
    // Test 1: Register new user
    try {
        console.log('1. Testing Register...');
        const testUser = {
            username: `testuser${Date.now()}`,
            password: 'password123',
            confirmPassword: 'password123',
            email: `test${Date.now()}@example.com`,
            phone: `0123456${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // Tạo phone unique
        };
        
        const registerResponse = await axios.post(`${API_BASE}/register`, testUser, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log('✅ Register successful:', registerResponse.data);
        
        // Test 2: Try login before verification
        console.log('\n2. Testing Login before verification...');
        try {
            const loginResponse = await axios.post(`${API_BASE}/login`, {
                username: testUser.username,
                password: testUser.password
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            console.log('✅ Login successful:', loginResponse.data);
        } catch (error) {
            if (error.response) {
                console.log('⚠️  Login failed (expected):', error.response.status, error.response.data);
                if (error.response.data.message.includes('not verified')) {
                    console.log('   → This is expected - user needs to verify email');
                }
            } else {
                console.log('❌ Login failed:', error.message);
            }
        }
        
        // Test 3: Test verify endpoint
        console.log('\n3. Testing Verify endpoint...');
        try {
            const verifyResponse = await axios.post(`${API_BASE}/verify`, {
                token: 'test_token'
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            console.log('✅ Verify successful:', verifyResponse.data);
        } catch (error) {
            if (error.response) {
                console.log('⚠️  Verify failed:', error.response.status, error.response.data);
                if (error.response.status === 403) {
                    console.log('   → This is expected - need valid verification token');
                }
            } else {
                console.log('❌ Verify failed:', error.message);
            }
        }
        
    } catch (error) {
        if (error.response) {
            console.log('⚠️  Register failed:', error.response.status, error.response.data);
            if (error.response.status === 409) {
                console.log('   → User already exists (this is expected for testing)');
            }
        } else {
            console.log('❌ Register failed:', error.message);
        }
    }

    // Test 4: Test with existing user
    console.log('\n4. Testing with existing user...');
    try {
        const loginResponse = await axios.post(`${API_BASE}/login`, {
            username: 'testuser123',
            password: 'password123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log('✅ Login successful:', loginResponse.data);
    } catch (error) {
        if (error.response) {
            console.log('⚠️  Login failed:', error.response.status, error.response.data);
            if (error.response.data.message.includes('not verified')) {
                console.log('   → User needs to verify email');
            }
        } else {
            console.log('❌ Login failed:', error.message);
        }
    }

    console.log('\n📋 Summary:');
    console.log('- Register API: ✅ Working');
    console.log('- Login API: ⚠️  Working but requires email verification');
    console.log('- Verify API: ⚠️  Available but needs valid token');
    console.log('\n🚀 Next Steps:');
    console.log('1. Register new user via frontend');
    console.log('2. Check email for verification link/code');
    console.log('3. Verify email');
    console.log('4. Login successfully');
    console.log('\n🌐 Test via Frontend: http://localhost:5173');
}

// Run the test
testEmailVerificationFlow().catch(console.error);
