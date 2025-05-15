/**
 * Advanced API test script to verify login endpoint and cookie handling
 */
import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

// Create a custom axios instance with cookie jar
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Storage for cookies
let cookieJar = '';

// Add interceptors to manage cookies
axiosInstance.interceptors.response.use(response => {
  // Extract Set-Cookie headers
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    console.log('Received cookies:', setCookieHeader);
    // Store the cookies
    cookieJar = setCookieHeader.join('; ');
    // Save cookies to file for inspection
    fs.writeFileSync('cookies.txt', cookieJar);
    console.log('Cookies saved to cookies.txt');
  }
  return response;
});

axiosInstance.interceptors.request.use(config => {
  // Attach cookies to each request if available
  if (cookieJar) {
    console.log('Sending cookies with request:', cookieJar);
    config.headers.Cookie = cookieJar;
  }
  return config;
});

async function testApiLogin() {
  console.log('=== TESTING API LOGIN WITH EXPLICIT COOKIE HANDLING ===');
  
  // Test with what we know are the correct credentials
  const credentials = {
    email: 'clinic@mydentalfly.com',
    password: 'clinic123',
    role: 'clinic_staff'
  };
  
  try {
    console.log('Making direct API call with credentials:', credentials);
    
    const response = await axiosInstance.post('/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login API response status:', response.status);
    console.log('Login API response data:', response.data);
    
    if (response.data.success) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('User data:', response.data.user);
      
      // Now test the get user endpoint to verify the session
      console.log('\nNow testing session persistence with /api/auth/user...');
      
      try {
        // Short delay to ensure cookies are processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userResponse = await axiosInstance.get('/api/auth/user');
        
        console.log('User API response status:', userResponse.status);
        console.log('User API response data:', userResponse.data);
        
        if (userResponse.data.success) {
          console.log('✅ SESSION VERIFIED!');
        } else {
          console.log('❌ SESSION VERIFICATION FAILED!');
        }
        
        // Now test another protected endpoint
        console.log('\nTesting clinic-status endpoint...');
        const clinicResponse = await axiosInstance.get('/api/clinic-status');
        console.log('Clinic status response:', clinicResponse.data);
      } catch (userError) {
        console.error('Error verifying session:', userError.message);
        if (userError.response) {
          console.error('Error response status:', userError.response.status);
          console.error('Error details:', userError.response.data);
        }
      }
    } else {
      console.log('❌ LOGIN FAILED!');
    }
  } catch (error) {
    console.error('API test error:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
testApiLogin().catch(console.error);