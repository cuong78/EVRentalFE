// Script để test với token thật từ email
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

async function testWithRealToken() {
    console.log('🔍 Testing with Real Verification Token...\n');
    
    // Thay đổi token này bằng token thật từ email
    const verificationToken = 'REPLACE_WITH_REAL_TOKEN_FROM_EMAIL';
    
    if (verificationToken === 'REPLACE_WITH_REAL_TOKEN_FROM_EMAIL') {
        console.log('⚠️  Please replace the token with a real one from your email');
        console.log('📧 Check email: dinhphong2728+02@gmail.com');
        console.log('🔗 Look for verification link or copy the token from the email');
        return;
    }
    
    try {
        // 1. Verify email
        console.log('1. Verifying email with token...');
        const verifyResponse = await axios.post(`${API_BASE}/verify`, null, {
            params: { token: verificationToken },
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log('✅ Email verified successfully:', verifyResponse.data);
        
        // 2. Test login sau khi verify
        console.log('\n2. Testing login after verification...');
        const loginResponse = await axios.post(`${API_BASE}/login`, {
            username: 'testuser1760458238413',
            password: 'password123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log('✅ Login successful:', loginResponse.data);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testWithRealToken().catch(console.error);
