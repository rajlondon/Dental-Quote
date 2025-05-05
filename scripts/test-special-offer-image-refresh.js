/**
 * Test script for special offer image refresh functionality
 * 
 * This script tests the integration between our image caching system
 * and the special offers module to ensure OpenAI-generated images
 * are properly persisted.
 */
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const BASE_URL = 'http://localhost:5000';
const TEST_IMAGE_PATH = path.join(__dirname, '../public/default-offer.jpg');
const ADMIN_CREDENTIALS = {
  email: 'admin@mydentalfly.com',
  password: 'password123'
};

// Cookie jar to store session cookies
const cookieJar = {};

// Add cookie handling to axios
axios.interceptors.response.use(response => {
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    // Store cookies
    setCookieHeader.forEach(cookie => {
      const [cookiePart] = cookie.split(';');
      const [name, value] = cookiePart.split('=');
      cookieJar[name] = value;
    });
    console.log('Cookie received and stored');
  }
  return response;
});

// Add cookies to requests
axios.interceptors.request.use(config => {
  const cookieString = Object.entries(cookieJar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  
  if (cookieString) {
    config.headers.Cookie = cookieString;
  }
  return config;
});

// Utility to create authenticated client
async function createAuthenticatedClient() {
  // Create a client that will share our cookie jar
  const client = axios.create({
    withCredentials: true,
    baseURL: BASE_URL
  });
  
  try {
    console.log('🔑 Attempting to log in as admin...');
    // Log in as admin
    const response = await client.post('/api/auth/login', ADMIN_CREDENTIALS);
    console.log('✅ Successfully authenticated as admin');
    
    // Check if we're actually authenticated by requesting current user
    try {
      const userResponse = await client.get('/api/auth/user');
      console.log(`✅ Verified authentication, logged in as: ${userResponse.data.email}`);
    } catch (verifyError) {
      console.error('❌ Failed to verify authentication:', verifyError.message);
    }
    
    return client;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Utility to get special offers
async function getSpecialOffers(client) {
  try {
    const { data } = await client.get(`${BASE_URL}/api/special-offers/homepage`);
    console.log(`✅ Got ${data.length} special offers`);
    return data;
  } catch (error) {
    console.error('❌ Failed to get special offers:', error.message);
    throw error;
  }
}

// Test the image refresh functionality
async function testImageRefresh() {
  console.log('🔍 Testing special offer image refresh functionality...');
  
  try {
    // Create authenticated client
    const client = await createAuthenticatedClient();
    
    // Get the special offers
    const offers = await getSpecialOffers(client);
    
    if (offers.length === 0) {
      console.log('❌ No special offers found to test with');
      return;
    }
    
    // Get the first offer to test with
    const testOffer = offers[0];
    console.log(`🧪 Using test offer: ${testOffer.title} (ID: ${testOffer.id})`);
    console.log(`Original image URL: ${testOffer.banner_image}`);
    
    // 1. Test direct image URL update
    console.log('\n🔄 Testing direct imageUrl parameter...');
    try {
      const { data } = await client.post(`${BASE_URL}/api/special-offers/refresh-image/${testOffer.id}`, {
        imageUrl: `${BASE_URL}/default-offer.jpg?test=${Date.now()}`
      });
      
      console.log('✅ Image URL update successful');
      console.log(`New image URL: ${data.imageUrl}`);
      
      // Verify the image URL was updated
      if (data.imageUrl !== testOffer.banner_image) {
        console.log('✅ Image URL was changed as expected');
      } else {
        console.log('❌ Image URL was not changed!');
      }
    } catch (error) {
      console.error('❌ Failed to update image URL:', error.message);
    }
    
    // 2. Test OpenAI generation (if available)
    console.log('\n🔄 Testing OpenAI image generation...');
    try {
      const { data } = await client.post(`${BASE_URL}/api/special-offers/refresh-image/${testOffer.id}`, {
        useOpenAI: true,
        customPrompt: 'A professional dental clinic with modern equipment'
      });
      
      console.log('✅ OpenAI image generation successful');
      console.log(`New image URL: ${data.imageUrl}`);
      
      // Check if the URL contains our cached image path
      if (data.imageUrl.includes('/cached-images/')) {
        console.log('✅ Image was properly cached');
      } else {
        console.log('⚠️ Image might not be cached properly');
      }
    } catch (error) {
      console.error('❌ Failed to generate OpenAI image:', error.message);
      console.log('⚠️ This is expected if OpenAI API key is not configured');
    }
    
    console.log('\n✅ Tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImageRefresh();