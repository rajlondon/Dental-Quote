/**
 * Test script to check user authentication credentials
 */

import axios from 'axios';

// Configuration
const baseUrl = 'http://localhost:5000';

// Try different password patterns
const passwords = [
  'password123',
  'Password123',
  'dentalfly',
  'Dentalfly123',
  'patient123',
  'Patient123',
  'password', 
  'Password',
  'Patient',
  'MyDentalFly123',
  'mydentalfly',
  '123456',
  'Patient@123'
];

async function testAuthentication() {
  console.log('🔒 Testing authentication for patient@mydentalfly.com with different passwords...');
  
  for (const password of passwords) {
    try {
      console.log(`Trying password: ${password}`);
      
      const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'patient@mydentalfly.com',
        password: password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (loginResponse.status === 200) {
        console.log(`✅ Authentication successful with password: ${password}`);
        return;
      }
    } catch (error) {
      console.log(`❌ Failed with password: ${password}`);
    }
  }
  
  console.log('❌ None of the tested passwords worked');
}

// Run the test
testAuthentication()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test script error:', err));