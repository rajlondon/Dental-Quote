/**
 * Test script for evaluating the improved special offer image generation
 * 
 * This script will generate new special offer images with our enhanced prompts
 * to compare against the previous AI-generated images.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Set global variables
const API_URL = 'http://localhost:5000';
let authToken = null;

// Special offer test cases with different types
const TEST_OFFERS = [
  {
    title: "Premium Dental Implant Package",
    type: "implant"
  },
  {
    title: "Luxury Hotel Stay & Dental Treatment",
    type: "hotel"
  },
  {
    title: "Free Consultation & Treatment Plan",
    type: "consultation"
  },
  {
    title: "VIP Airport Transfer & Accommodation",
    type: "transfer"
  }
];

// Create authenticated client with clinic credentials
async function createAuthenticatedClient() {
  try {
    // Log in as a clinic user
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'clinic@example.com',
      password: 'clinic123'
    });
    
    // Extract the authentication token
    if (loginResponse.data && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('✅ Authentication successful');
      
      // Return a configured axios instance
      return axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
    } else {
      // Cookie-based auth
      const cookieClient = axios.create({
        baseURL: API_URL,
        withCredentials: true
      });
      
      return cookieClient;
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
}

// Generate special offer images
async function generateSpecialOfferImages(client) {
  console.log('=== Generating Special Offer Images with Enhanced Prompts ===');
  
  const results = [];
  
  for (const offer of TEST_OFFERS) {
    try {
      console.log(`\nGenerating image for "${offer.title}" (type: ${offer.type})`);
      
      // Call the OpenAI special offer image generation endpoint
      const response = await client.post('/api/openai/generate-special-offer-image', {
        title: offer.title,
        offerType: offer.type,
        naturalStyle: true // Ensure we're using the natural style
      });
      
      if (response.data && response.data.imageUrl) {
        const imageUrl = response.data.imageUrl;
        console.log(`✅ Successfully generated image: ${imageUrl}`);
        
        // Download the image for viewing
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const outputDir = path.join(__dirname, '../test-images');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save the image to disk
        const sanitizedTitle = offer.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/g, '');
        const filename = `${sanitizedTitle}_${timestamp}.jpg`;
        const outputPath = path.join(outputDir, filename);
        
        fs.writeFileSync(outputPath, imageResponse.data);
        console.log(`📝 Saved image to ${outputPath}`);
        
        // Store the result
        results.push({
          title: offer.title,
          type: offer.type,
          imageUrl,
          localPath: outputPath
        });
      } else {
        console.error(`❌ Failed to generate image for "${offer.title}": No image URL in response`);
      }
    } catch (error) {
      console.error(`❌ Error generating image for "${offer.title}":`, error.message);
    }
  }
  
  return results;
}

// Main execution function
async function runTest() {
  console.log('=== Testing Improved Special Offer Image Generation ===');
  
  try {
    // Authentication
    const client = await createAuthenticatedClient();
    
    // Generate special offer images
    const results = await generateSpecialOfferImages(client);
    
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
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runTest();