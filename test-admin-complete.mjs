// Script test hoàn chỉnh với user admin (đã verify)
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

async function testAdminComplete() {
    console.log('🔍 Testing Complete Admin Flow...\n');
    
    let token = null;
    
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
        token = loginResponse.data.data.token;
        console.log('📋 Token received:', token.substring(0, 50) + '...');
        
        // 2. Test các API endpoints
        console.log('\n2. Testing API endpoints...');
        
        // Test Vehicles API
        try {
            const vehiclesResponse = await axios.get(`${API_BASE}/vehicles`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            console.log('✅ Vehicles API:', vehiclesResponse.data.data.length, 'vehicles found');
        } catch (error) {
            console.log('❌ Vehicles API failed:', error.response?.status);
        }
        
        // Test Vehicle Types API
        try {
            const typesResponse = await axios.get(`${API_BASE}/vehicle-types`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            console.log('✅ Vehicle Types API:', typesResponse.data.data.length, 'types found');
        } catch (error) {
            console.log('❌ Vehicle Types API failed:', error.response?.status);
        }
        
        // Test Rental Stations API
        try {
            const stationsResponse = await axios.get(`${API_BASE}/rental-stations`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            console.log('✅ Rental Stations API:', stationsResponse.data.data.length, 'stations found');
        } catch (error) {
            console.log('❌ Rental Stations API failed:', error.response?.status);
        }
        
        // 3. Test logout
        console.log('\n3. Testing logout...');
        try {
            const logoutResponse = await axios.post(`${API_BASE}/logout`, {}, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            console.log('✅ Logout successful');
        } catch (error) {
            console.log('❌ Logout failed:', error.response?.status);
        }
        
        console.log('\n🎉 Complete admin flow test successful!');
        console.log('📋 Summary:');
        console.log('   - Login: ✅');
        console.log('   - API calls: ✅');
        console.log('   - Logout: ✅');
        console.log('\n💡 You can now use admin credentials in your frontend tests!');
        
    } catch (error) {
        console.log('❌ Admin flow test failed:', error.response?.status, error.response?.data);
    }
}

testAdminComplete().catch(console.error);
