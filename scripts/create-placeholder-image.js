/**
 * Script to create a placeholder test image for the special offers
 * This allows us to test the image caching and refresh functionality
 * without requiring admin authentication
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const BASE_URL = 'http://localhost:5000';
const OUTPUT_PATH = path.join(__dirname, '../public/test-placeholder.jpg');
const SIZE = 800;
const TEXT = 'Test Special Offer';
const BACKGROUND = 'blue';
const FOREGROUND = 'white';

// Create a placeholder image using a service
async function createPlaceholderImage() {
  console.log('🖼️ Creating placeholder image for testing...');
  
  try {
    // First try to use a placeholder image service
    const placeholderUrl = `https://via.placeholder.com/${SIZE}x${SIZE}/${BACKGROUND.replace('#', '')}/${FOREGROUND.replace('#', '')}?text=${encodeURIComponent(TEXT)}`;
    
    console.log(`🔄 Downloading placeholder image from: ${placeholderUrl}`);
    const response = await axios.get(placeholderUrl, { responseType: 'arraybuffer' });
    
    fs.writeFileSync(OUTPUT_PATH, response.data);
    console.log(`✅ Placeholder image saved to: ${OUTPUT_PATH}`);
    
    // Test using the image with the special offers API
    await testImageWithSpecialOffers();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create placeholder image:', error.message);
    return false;
  }
}

// Test the image with the special offers API
async function testImageWithSpecialOffers() {
  console.log('\n🧪 Testing special offers homepage API...');
  
  try {
    // Get the homepage special offers to see what's available
    const { data: offers } = await axios.get(`${BASE_URL}/api/special-offers/homepage`);
    console.log(`✅ Got ${offers.length} special offers from homepage API`);
    
    if (offers.length === 0) {
      console.log('❌ No special offers found to test with');
      return;
    }
    
    // Display the first offer details
    const testOffer = offers[0];
    console.log('\n📋 Sample special offer details:');
    console.log(`- ID: ${testOffer.id}`);
    console.log(`- Title: ${testOffer.title}`);
    console.log(`- Clinic ID: ${testOffer.clinic_id}`);
    console.log(`- Banner URL: ${testOffer.banner_image}`);
    
    // Check if the offer already has a cached image
    if (testOffer.banner_image && testOffer.banner_image.includes('/cached-images/')) {
      console.log('✅ Offer is already using a cached image');
    } else {
      console.log('⚠️ Offer is not using a cached image');
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Failed to test with special offers:', error.message);
  }
}

// Run the script
createPlaceholderImage();