/**
 * Simple test script for generating special offer images with the improved prompts
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get directory name (ESM replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL for API
const API_URL = 'http://localhost:5000';

// Development API key for authentication
const API_KEY = 'mydentalfly-api-token-12345';

// Test data for special offer images
const TEST_OFFERS = [
  {
    title: "Premium Dental Implant Package",
    offerType: "implant"
  },
  {
    title: "Luxury Hotel Stay & Dental Treatment",
    offerType: "hotel"
  },
  {
    title: "Free Dental Consultation",
    offerType: "consultation"
  },
  {
    title: "VIP Airport Transfer",
    offerType: "transfer"
  }
];

// Generate a test image
async function generateTestImage(title, offerType) {
  console.log(`\nGenerating test image for "${title}" (type: ${offerType})`);
  
  try {
    // Create request to the special-offer-image endpoint
    const response = await axios.post(`${API_URL}/api/openai/special-offer-image`, {
      offerId: `test-${Date.now()}`, // Create a temporary ID for testing
      offerTitle: title,
      offerType: offerType,
      naturalStyle: true // Use natural style for more photorealistic images
    });
    
    if (response.data && response.data.data && response.data.data.url) {
      const imageUrl = response.data.data.url;
      console.log(`✅ Successfully generated image URL: ${imageUrl}`);
      
      // Download the image for viewing
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        // Bypass caches to get fresh content
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Create test-images directory if it doesn't exist
      const outputDir = path.join(__dirname, '../test-images');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save the image to disk with a unique filename
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/g, '');
      const filename = `${sanitizedTitle}_${timestamp}.jpg`;
      const outputPath = path.join(outputDir, filename);
      
      fs.writeFileSync(outputPath, imageResponse.data);
      console.log(`📝 Saved image to ${outputPath}`);
      
      return {
        title,
        offerType,
        imageUrl,
        localPath: outputPath
      };
    } else {
      console.error('❌ No image URL in response');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error generating image:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Main test function
async function runTest() {
  console.log('=== Testing Special Offer Image Generation ===');
  console.log('This will test the enhanced prompts used in image generation');
  
  const results = [];
  
  // Generate images for each test offer
  for (const offer of TEST_OFFERS) {
    const result = await generateTestImage(offer.title, offer.offerType);
    if (result) {
      results.push(result);
    }
  }
  
  // Display summary
  console.log('\n=== Image Generation Results ===');
  console.log(`Total attempted: ${TEST_OFFERS.length}`);
  console.log(`Successfully generated: ${results.length}`);
  console.log(`Failed: ${TEST_OFFERS.length - results.length}`);
  
  if (results.length > 0) {
    console.log('\nGenerated Images:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title} - ${result.localPath}`);
    });
  }
  
  console.log('\nTest complete! Check the test-images directory for generated images.');
}

// Run the test
runTest();