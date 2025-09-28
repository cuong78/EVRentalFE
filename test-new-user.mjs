// Sử dụng fetch có sẵn trong Node.js 18+

// Thông tin user mới (thay đổi để không trùng)
const newUser = {
    username: `testuser${Date.now()}`, // Tạo username unique
    email: "dinhphong2728+02@gmail.com", // Thay bằng email thật của bạn
    phone: `0123456${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, // Tạo phone unique
    password: "password123",
    confirmPassword: "password123"
};

const API_BASE = 'http://localhost:8080/api';

console.log('🔍 Testing New User Registration...');
console.log('📧 Using email:', newUser.email);
console.log('📱 Using phone:', newUser.phone);
console.log('👤 Using username:', newUser.username);
console.log('');

async function testNewUserFlow() {
    try {
        // 1. Test Register với user mới
        console.log('1. Testing Register with new user...');
        const registerResponse = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        });

        const registerResult = await registerResponse.json();
        
        if (registerResponse.ok) {
            console.log('✅ Register successful!');
            console.log('📧 Check your email for verification code');
            console.log('📋 Response:', registerResult);
        } else {
            console.log('❌ Register failed:', registerResponse.status, registerResult);
            return;
        }

        console.log('');
        console.log('2. Testing Login (should fail - not verified)...');
        
        // 2. Test Login (sẽ fail vì chưa verify)
        const loginResponse = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: newUser.username,
                password: newUser.password
            })
        });

        const loginResult = await loginResponse.json();
        
        if (loginResponse.status === 400 && loginResult.message.includes('not verified')) {
            console.log('✅ Login correctly failed - account not verified');
            console.log('📋 Response:', loginResult.message);
        } else {
            console.log('⚠️  Unexpected login response:', loginResponse.status, loginResult);
        }

        console.log('');
        console.log('📧 Next Steps:');
        console.log('1. Check your email:', newUser.email);
        console.log('2. Look for verification email from EVRental');
        console.log('3. Copy the verification code/token');
        console.log('4. Use the verification code to verify your account');
        console.log('5. Then try login again');
        
        console.log('');
        console.log('🧪 To verify manually, you can:');
        console.log('- Check email inbox');
        console.log('- Look for verification link or code');
        console.log('- Use the verification endpoint with the code');
        
        console.log('');
        console.log('🌐 Or test via Frontend: http://localhost:3000');
        console.log('   - Register with the same credentials');
        console.log('   - Check email for verification');
        console.log('   - Complete verification flow');

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Chạy test
testNewUserFlow();
