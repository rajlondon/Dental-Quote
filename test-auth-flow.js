/**
 * Test script to verify improved authentication flow
 * Tests login, session persistence, and logout functionality
 */

const axios = require('axios');
const tough = require('tough-cookie');
const { CookieJar } = tough;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const jar = new CookieJar();

const BASE_URL = 'http://localhost:5000';
const CLINIC_TEST_USER = { email: 'clinic@example.com', password: 'clinic123' };
const ADMIN_TEST_USER = { email: 'admin@example.com', password: 'admin123' };
const PATIENT_TEST_USER = { email: 'patient@example.com', password: 'patient123' };

// Setup axios with cookie jar support to maintain session
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
});

axiosCookieJarSupport(api);
api.defaults.jar = jar;

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message, error) {
  console.error(`❌ ${message}`);
  if (error) {
    console.error('  Details:', error.response?.data || error.message || error);
  }
}

async function testLogin(user) {
  try {
    const response = await api.post('/api/auth/login', user);
    logSuccess(`Login successful for ${user.email}`);
    console.log('  User role:', response.data.user.role);
    console.log('  Session cookies:', await getCookies());
    return response.data.user;
  } catch (error) {
    logError(`Login failed for ${user.email}`, error);
    throw error;
  }
}

async function testAuthStatus() {
  try {
    const response = await api.get('/api/auth/status');
    logSuccess('Auth status check successful');
    console.log('  Auth status:', response.data);
    return response.data;
  } catch (error) {
    logError('Auth status check failed', error);
    throw error;
  }
}

async function testGetUser() {
  try {
    const response = await api.get('/api/auth/user');
    logSuccess('Get user successful');
    console.log('  User:', response.data.user);
    return response.data.user;
  } catch (error) {
    logError('Get user failed', error);
    throw error;
  }
}

async function testLogout() {
  try {
    const response = await api.post('/api/auth/logout');
    logSuccess('Logout successful');
    console.log('  Logout response:', response.data);
    console.log('  Remaining cookies after logout:', await getCookies());
    return response.data;
  } catch (error) {
    logError('Logout failed', error);
    throw error;
  }
}

async function getCookies() {
  return new Promise((resolve, reject) => {
    jar.getCookies(BASE_URL, (err, cookies) => {
      if (err) reject(err);
      else resolve(cookies.map(c => ({ name: c.key, value: c.value, domain: c.domain, path: c.path })));
    });
  });
}

async function runAuthFlowTest() {
  console.log('=== TESTING AUTH FLOW ===');
  console.log('Starting auth flow test...');
  
  try {
    // Test initial status (should be unauthenticated)
    console.log('\n1. Checking initial auth status (should be unauthenticated)');
    const initialStatus = await testAuthStatus();
    
    // Test login
    console.log('\n2. Testing login with clinic user');
    const user = await testLogin(CLINIC_TEST_USER);
    
    // Test auth status after login
    console.log('\n3. Checking auth status after login (should be authenticated)');
    const statusAfterLogin = await testAuthStatus();
    
    // Test user endpoint
    console.log('\n4. Testing user endpoint');
    const userInfo = await testGetUser();
    
    // Verify authentication persists across requests
    console.log('\n5. Making another request to verify session persistence');
    const userInfo2 = await testGetUser();
    
    // Test logout
    console.log('\n6. Testing logout');
    await testLogout();
    
    // Test auth status after logout
    console.log('\n7. Checking auth status after logout (should be unauthenticated)');
    const statusAfterLogout = await testAuthStatus();
    
    console.log('\n=== AUTH FLOW TEST COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n=== AUTH FLOW TEST FAILED ===');
    console.error('Error:', error.message);
  }
}

// Run the test
runAuthFlowTest();