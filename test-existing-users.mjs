// Script để test với các user có thể đã tồn tại
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const testUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'user123' },
    { username: 'testuser', password: 'testuser123' },
    { username: 'customer', password: 'customer123' },
    { username: 'testuser1760458238413', password: 'password123' } // User mới vừa tạo
];

async function testExistingUsers() {
    console.log('🔍 Testing Existing Users...\n');
    
    for (const user of testUsers) {
        console.log(`Testing user: ${user.username}`);
        try {
            const response = await axios.post(`${API_BASE}/login`, {
                username: user.username,
                password: user.password
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            
            console.log(`✅ Login successful for ${user.username}:`, response.data);
            console.log('🎉 Found working user!');
            return user;
            
        } catch (error) {
            if (error.response) {
                const message = error.response.data?.message || 'Unknown error';
                console.log(`❌ ${user.username}: ${error.response.status} - ${message}`);
                
                // Nếu là "disabled" hoặc "not verified", user tồn tại nhưng chưa verify
                if (message.includes('disabled') || message.includes('not verified')) {
                    console.log(`   → User ${user.username} exists but needs verification`);
                }
            } else {
                console.log(`❌ ${user.username}: ${error.message}`);
            }
        }
        console.log('');
    }
    
    console.log('⚠️  No working users found. All users need email verification.');
    return null;
}

testExistingUsers().catch(console.error);
