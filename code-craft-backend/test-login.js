// Quick test script to check if backend is working
const axios = require('axios');

async function testBackend() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('Testing backend connection...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test register
    console.log('\n2. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123'
    };
    
    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, testUser);
      console.log('✅ Registration successful:', {
        user: registerResponse.data.user.email,
        hasToken: !!registerResponse.data.token
      });
      
      // Test login with the same user
      console.log('\n3. Testing login...');
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', {
        user: loginResponse.data.user.email,
        hasToken: !!loginResponse.data.token
      });
      
      // Test /auth/me endpoint
      console.log('\n4. Testing /auth/me endpoint...');
      const meResponse = await axios.get(`${baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ Auth/me successful:', meResponse.data.user.email);
      
    } catch (authError) {
      console.error('❌ Auth error:', authError.response?.data || authError.message);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('Make sure the backend is running on port 3001');
  }
}

testBackend();