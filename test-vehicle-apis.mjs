// Script để test tất cả Vehicle APIs
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// Lấy token từ login
async function getAuthToken() {
    try {
        const response = await axios.post(`${API_BASE}/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        return response.data.data.token;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.status, error.response?.data);
        throw error;
    }
}

// Test function
async function testApi(name, apiCall) {
    try {
        console.log(`🧪 Testing ${name}...`);
        const result = await apiCall();
        console.log(`✅ ${name} successful:`, result.data?.length || result.data?.data?.length || 'Data received');
        return true;
    } catch (error) {
        console.log(`❌ ${name} failed:`, error.response?.status, error.response?.data?.message);
        return false;
    }
}

async function testAllVehicleApis() {
    console.log('🔍 Testing All Vehicle APIs...\n');
    
    let token;
    try {
        token = await getAuthToken();
        console.log('✅ Authentication successful\n');
    } catch (error) {
        console.log('❌ Cannot proceed without authentication');
        return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    const results = {};

    // Test Vehicle APIs
    console.log('🚗 VEHICLE APIs:');
    results.vehicles = await testApi('GET /api/vehicles', () => 
        axios.get(`${API_BASE}/vehicles`, { headers }));
    
    results.vehicleById = await testApi('GET /api/vehicles/1', () => 
        axios.get(`${API_BASE}/vehicles/1`, { headers }));
    
    results.availableVehicles = await testApi('GET /api/vehicles/available', () => 
        axios.get(`${API_BASE}/vehicles/available`, { headers }));
    
    results.vehiclesByType = await testApi('GET /api/vehicles/type/1', () => 
        axios.get(`${API_BASE}/vehicles/type/1`, { headers }));
    
    results.vehiclesByStation = await testApi('GET /api/vehicles/station/1', () => 
        axios.get(`${API_BASE}/vehicles/station/1`, { headers }));

    // Test Vehicle Type APIs
    console.log('\n🏷️  VEHICLE TYPE APIs:');
    results.vehicleTypes = await testApi('GET /api/vehicle-types', () => 
        axios.get(`${API_BASE}/vehicle-types`, { headers }));
    
    results.vehicleTypeById = await testApi('GET /api/vehicle-types/1', () => 
        axios.get(`${API_BASE}/vehicle-types/1`, { headers }));
    
    results.typesByStation = await testApi('GET /api/vehicle-types/by-station/1', () => 
        axios.get(`${API_BASE}/vehicle-types/by-station/1`, { headers }));

    // Test Rental Station APIs
    console.log('\n🏢 RENTAL STATION APIs:');
    results.rentalStations = await testApi('GET /api/rental-stations', () => 
        axios.get(`${API_BASE}/rental-stations`, { headers }));
    
    results.rentalStationById = await testApi('GET /api/rental-stations/1', () => 
        axios.get(`${API_BASE}/rental-stations/1`, { headers }));
    
    results.stationsWithoutAdmin = await testApi('GET /api/rental-stations/without-admin', () => 
        axios.get(`${API_BASE}/rental-stations/without-admin`, { headers }));
    
    results.stationsByCity = await testApi('GET /api/rental-stations/city/Ho Chi Minh', () => 
        axios.get(`${API_BASE}/rental-stations/city/Ho%20Chi%20Minh`, { headers }));

    // Summary
    console.log('\n📊 SUMMARY:');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${failedTests}/${totalTests}`);
    
    if (failedTests === 0) {
        console.log('\n🎉 All Vehicle APIs are working perfectly!');
    } else {
        console.log('\n⚠️  Some APIs failed. Check the errors above.');
    }
}

testAllVehicleApis().catch(console.error);
