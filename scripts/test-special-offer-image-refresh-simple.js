/**
 * Simplified test for special offer image refresh functionality
 * This script doesn't require authentication, but only tests the 
 * publicly available endpoints and frontend image caching functions.
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const BASE_URL = 'http://localhost:5000';
const CACHE_DIR = path.join(__dirname, '../public/cached-images');
const TEST_IMAGE_PATH = path.join(__dirname, '../public/test-placeholder.jpg');

// Create the cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  console.log(`Creating cache directory: ${CACHE_DIR}`);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Check if test image exists, if not, warn the user
if (!fs.existsSync(TEST_IMAGE_PATH)) {
  console.log(`⚠️ Test image not found at: ${TEST_IMAGE_PATH}`);
  console.log('Please run scripts/create-placeholder-image.js first');
  process.exit(1);
}

// Utility to get special offers
async function getSpecialOffers() {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/special-offers/homepage`);
    console.log(`✅ Got ${data.length} special offers`);
    return data;
  } catch (error) {
    console.error('❌ Failed to get special offers:', error.message);
    throw error;
  }
}

// Utility to manually cache an image
async function manuallyTestImageCaching() {
  console.log('\n🔍 Testing manual image caching functionality...');
  
  try {
    // Generate a unique filename
    const uniqueId = uuidv4();
    const cachedFilename = `${uniqueId}.jpg`;
    const cachedPath = path.join(CACHE_DIR, cachedFilename);
    
    // Copy our test image to the cache directory
    fs.copyFileSync(TEST_IMAGE_PATH, cachedPath);
    console.log(`✅ Test image copied to cache: ${cachedPath}`);
    
    // Verify that the cached URL would be accessible
    const cachedUrl = `${BASE_URL}/cached-images/${cachedFilename}`;
    console.log(`✅ Image should be accessible at: ${cachedUrl}`);
    
    // Make a GET request to verify the image is accessible
    try {
      const response = await axios.get(cachedUrl, { responseType: 'arraybuffer' });
      console.log(`✅ Successfully accessed cached image: HTTP ${response.status}`);
      console.log(`   Image size: ${response.data.length} bytes`);
    } catch (error) {
      console.error(`❌ Failed to access cached image: ${error.message}`);
    }
    
    return {
      cachedFilename,
      cachedUrl
    };
  } catch (error) {
    console.error('❌ Failed in manual caching test:', error.message);
    return null;
  }
}

// Test the cached image routes and services
async function testImageCache() {
  console.log('🔍 Testing image cache functionality...');
  
  try {
    // Get the special offers to see what's available
    const offers = await getSpecialOffers();
    
    if (offers.length === 0) {
      console.log('❌ No special offers found to test with');
      // Still continue with manual testing
    } else {
      // Check if any offers use cached images
      const cachedOffers = offers.filter(
        offer => offer.banner_image && offer.banner_image.includes('/cached-images/')
      );
      
      console.log(`Found ${cachedOffers.length} offers with cached images`);
      
      if (cachedOffers.length > 0) {
        const sampleOffer = cachedOffers[0];
        console.log(`\n📋 Sample offer with cached image:`);
        console.log(`- Title: ${sampleOffer.title}`);
        console.log(`- Cached URL: ${sampleOffer.banner_image}`);
        
        // Check if the image is accessible
        try {
          const response = await axios.head(sampleOffer.banner_image);
          console.log(`✅ Cached image is accessible: HTTP ${response.status}`);
        } catch (error) {
          console.error(`❌ Failed to access cached image: ${error.message}`);
        }
      }
    }
    
    // Run manual caching test
    const manualResult = await manuallyTestImageCaching();
    
    if (manualResult) {
      console.log('\n✅ Manual image caching test completed successfully');
      console.log(`ℹ️ Cached URL: ${manualResult.cachedUrl}`);
    }
    
    console.log('\n✅ All tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImageCache();