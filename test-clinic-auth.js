/**
 * Test script to verify clinic user credentials
 */
import axios from 'axios';

// List of potential clinic emails to test
const emails = [
  'clinic@mydentalfly.com',
  'clinic@test.com', 
  'clinic_staff@mydentalfly.com',
  'clinic_staff@test.com'
];

// List of potential passwords to test
const passwords = [
  'clinic123',
  'clinic_staff123',
  'password123',
  'test123'
];

async function testClinicAuthentication() {
  console.log('=== TESTING CLINIC AUTHENTICATION ===');
  
  const baseUrl = 'http://localhost:5000';
  
  for (const email of emails) {
    for (const password of passwords) {
      try {
        console.log(`Trying email: ${email} with password: ${password}`);
        
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
          email,
          password,
          role: 'clinic_staff'
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200 && response.data.success) {
          console.log(`✅ SUCCESS! Valid credentials found:`);
          console.log(`Email: ${email}`);
          console.log(`Password: ${password}`);
          console.log('User data:', response.data.user);
          return { email, password, userData: response.data.user };
        }
      } catch (error) {
        console.log(`❌ Failed with email: ${email}, password: ${password}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Message: ${error.response.data.message || 'Unknown error'}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
      }
    }
  }
  
  console.log('❌ No valid credentials found');
  return null;
}

// Function to test specific credentials
async function testSpecificCredentials(email, password) {
  console.log(`=== TESTING SPECIFIC CREDENTIALS ===`);
  console.log(`Email: ${email}, Password: ${password}`);
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const response = await axios.post(`${baseUrl}/api/auth/login`, {
      email,
      password,
      role: 'clinic_staff'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ SUCCESS! Credentials are valid`);
      console.log('User data:', response.data.user);
      return { email, password, userData: response.data.user };
    }
  } catch (error) {
    console.log(`❌ Failed with these credentials`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('❌ These credentials are not valid');
  return null;
}

// Run the tests
async function runTests() {
  // First try brute force testing
  const validCredentials = await testClinicAuthentication();
  
  if (!validCredentials) {
    // If brute force testing didn't work, try specific combinations
    console.log('\nTrying specific credentials combinations:');
    
    await testSpecificCredentials('clinic@mydentalfly.com', 'clinic123');
    await testSpecificCredentials('clinic_staff@test.com', 'clinic123');
    await testSpecificCredentials('clinic@test.com', 'clinic123');
  }
}

runTests().catch(console.error);