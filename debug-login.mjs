// Script debug để kiểm tra chi tiết lỗi login
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

async function debugLogin() {
    console.log('🔍 Debug Login Test...');
    
    try {
        const response = await axios.post(`${API_BASE}/login`, {
            username: 'user123',
            password: 'user123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        console.log('✅ Login successful:', response.data);
    } catch (error) {
        console.log('❌ Login failed:');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);
        console.log('Message:', error.response?.data?.message);
        console.log('Error:', error.response?.data?.error);
        
        if (error.response?.data?.message?.includes('not verified')) {
            console.log('ℹ️  This is expected - user needs email verification');
        }
    }
}

debugLogin().catch(console.error);
