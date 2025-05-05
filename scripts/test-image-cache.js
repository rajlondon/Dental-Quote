// Script to test the image caching functionality
import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';
const TEST_IMAGE_URL = 'https://placehold.co/600x400/png';

async function testImageCache() {
  try {
    console.log('Testing image cache functionality...');
    
    // Step 1: Login as a clinic user
    console.log('Logging in as clinic user...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'clinic@mydentalfly.com',
      password: 'Clinic123!'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    console.log(`Login successful, user ID: ${loginResponse.data.user.id}`);
    
    // Extract cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'];
    
    // Step 2: Fetch cached image URL
    console.log(`Testing image cache for URL: ${TEST_IMAGE_URL}`);
    
    const cacheResponse = await axios.post(
      `${BASE_URL}/api/image-cache/cache`,
      { imageUrl: TEST_IMAGE_URL, force: true },
      { headers: { Cookie: cookies.join('; ') } }
    );
    
    console.log('Cache response:');
    console.log(JSON.stringify(cacheResponse.data, null, 2));
    
    if (cacheResponse.data.success && cacheResponse.data.cachedUrl) {
      console.log(`Successfully cached image to: ${cacheResponse.data.cachedUrl}`);
      
      // Step 3: Verify the cached image exists
      const fullPath = `/home/runner/workspace/public${cacheResponse.data.cachedUrl}`;
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Cached file exists at: ${fullPath}`);
        
        // Check file size
        const stats = fs.statSync(fullPath);
        console.log(`Cached file size: ${(stats.size / 1024).toFixed(2)} KB`);
      } else {
        console.error(`❌ Cached file does not exist at: ${fullPath}`);
      }
    } else {
      console.error('Failed to cache the image');
    }
    
    // Step 3: Logout
    console.log('Logging out...');
    await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: { Cookie: cookies.join('; ') }
    });
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during test:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

testImageCache();