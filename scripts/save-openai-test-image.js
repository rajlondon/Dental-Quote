/**
 * Simple script to test OpenAI image generation with prompt enhancements
 * 
 * This script saves the resulting image directly to test-images/
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_KEY = 'mydentalfly-api-token-12345';
const API_URL = 'http://localhost:5000';

// Test prompt using photography techniques similar to real special offer generation
const TEST_PROMPT = "Create a high-quality Shutterstock-style photograph of a modern dental implant next to a crown on a clean white surface with professional studio lighting, shallow depth of field, and soft shadows";

// Test function that directly saves the image
async function saveImageFromPrompt(prompt) {
  console.log('=== OpenAI Image Generation Test ===');
  console.log(`Prompt: ${prompt}`);
  
  try {
    // 1. Generate the image using our API
    console.log('Sending image generation request...');
    const response = await axios.post(`${API_URL}/api/openai/generate-image`, {
      prompt,
      size: "1024x1024"
    }, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    
    if (response.data?.success && response.data?.data?.url) {
      const imageUrl = response.data.data.url;
      console.log('✅ Successfully generated image!');
      console.log(`Image URL: ${imageUrl}`);
      
      // 2. Download the image
      console.log('Downloading image...');
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // 3. Create output directory if needed
      const outputDir = path.join(__dirname, '../test-images');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 4. Save image to disk with timestamp to make it unique
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/g, '');
      const outputPath = path.join(outputDir, `test_image_${timestamp}.jpg`);
      
      fs.writeFileSync(outputPath, imageResponse.data);
      console.log(`✅ Image saved to: ${outputPath}`);
      
      return outputPath;
    } else {
      console.error('❌ Error: API did not return a valid image URL');
      return null;
    }
  } catch (error) {
    console.error('❌ Error generating or saving image:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Run the test
saveImageFromPrompt(TEST_PROMPT)
  .then(imagePath => {
    if (imagePath) {
      console.log('\n==== Success ====');
      console.log('Test completed successfully. Check the image at:');
      console.log(imagePath);
    } else {
      console.log('\n==== Failed ====');
      console.log('Test failed to generate/save the image.');
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
  });