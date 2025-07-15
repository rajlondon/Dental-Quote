
const axios = require('axios');

async function debugPatientAccount() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('=== DEBUGGING PATIENT ACCOUNT ===');
    
    // 1. Check all users
    console.log('\n1. Checking all users...');
    try {
      const usersResponse = await axios.get(`${baseUrl}/api/auth/debug-users`);
      console.log('Users in database:', JSON.stringify(usersResponse.data, null, 2));
    } catch (error) {
      console.error('Failed to get users:', error.response?.data || error.message);
    }
    
    // 2. Create/verify test patient
    console.log('\n2. Creating/verifying test patient...');
    try {
      const createResponse = await axios.post(`${baseUrl}/api/auth/create-test-patient`);
      console.log('Test patient result:', JSON.stringify(createResponse.data, null, 2));
    } catch (error) {
      console.error('Failed to create test patient:', error.response?.data || error.message);
    }
    
    // 3. Test login
    console.log('\n3. Testing login...');
    try {
      const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'patient@mydentalfly.co.uk',
        password: 'Patient123!'
      }, {
        withCredentials: true
      });
      console.log('Login result:', JSON.stringify(loginResponse.data, null, 2));
      
      // Get cookies for session test
      const cookies = loginResponse.headers['set-cookie'];
      console.log('Login cookies:', cookies);
      
      // 4. Test session
      if (cookies) {
        console.log('\n4. Testing session...');
        const sessionResponse = await axios.get(`${baseUrl}/api/auth/user`, {
          headers: { Cookie: cookies },
          withCredentials: true
        });
        console.log('Session result:', JSON.stringify(sessionResponse.data, null, 2));
      }
      
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Debug script error:', error.message);
  }
}

debugPatientAccount();
