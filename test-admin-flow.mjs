// Script test đầy đủ với user admin
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

async function testAdminFlow() {
    console.log('🔍 Testing Admin User Flow...\n');
    
    try {
        // 1. Login với admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${API_BASE}/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        console.log('✅ Login successful!');
        console.log('📋 Token:', loginResponse.data.data.token.substring(0, 50) + '...');
        console.log('📋 Roles:', loginResponse.data.data.roles);
        
        const token = loginResponse.data.data.token;
        
        // 2. Test API với token
        console.log('\n2. Testing API with token...');
        try {
            const vehiclesResponse = await axios.get(`${API_BASE}/vehicles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            console.log('✅ Vehicles API working:', vehiclesResponse.data);
        } catch (error) {
            console.log('⚠️  Vehicles API failed:', error.response?.status, error.response?.data);
        }
        
        // 3. Test logout
        console.log('\n3. Testing logout...');
        try {
            const logoutResponse = await axios.post(`${API_BASE}/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            console.log('✅ Logout successful:', logoutResponse.data);
        } catch (error) {
            console.log('⚠️  Logout failed:', error.response?.status, error.response?.data);
        }
        
        console.log('\n🎉 Admin flow test completed successfully!');
        
    } catch (error) {
        console.log('❌ Admin flow test failed:', error.response?.status, error.response?.data);
    }
}

testAdminFlow().catch(console.error);
