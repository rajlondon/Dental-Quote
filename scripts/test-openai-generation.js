/**
 * Simple test script for direct OpenAI image generation
 * 
 * This script tests the direct image generation without trying to update special offers
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

// Script configuration
const USE_FALLBACK = false; // Set to true to use fallback images instead of OpenAI

// Test prompts for image generation
const TEST_PROMPTS = [
  {
    title: "Premium Dental Implant Package",
    prompt: "Create a high-quality photograph of a dental implant next to a crown on a clean white surface with professional lighting"
  }
];

// Generate a test image using direct API endpoint
async function generateTestImage(title, prompt) {
  console.log(`\nGenerating test image for "${title}"`);
  console.log(`Prompt: ${prompt.substring(0, 60)}...`);
  
  try {
    // Create request to the generate-image endpoint with API key authentication
    const response = await axios.post(`${API_URL}/api/openai/generate-image`, {
      prompt: prompt,
      size: "1024x1024"
    }, {
      headers: {
        'x-api-key': API_KEY
      }
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
        prompt,
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

// Check if OpenAI is properly configured
async function checkOpenAIConfiguration() {
  try {
    console.log('Checking OpenAI API configuration...');
    const response = await axios.get(`${API_URL}/api/openai/status`);
    
    if (response.data && response.data.configured) {
      console.log('✅ OpenAI API is properly configured and ready to use');
      return true;
    } else {
      console.error('❌ OpenAI API is not configured. Please set OPENAI_API_KEY environment variable.');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check OpenAI configuration:', error.message);
    return false;
  }
}

// Main test function
async function runTest() {
  console.log('=== Testing OpenAI Direct Image Generation ===');
  console.log('This will test direct OpenAI image generation with prompts');
  
  // Check if OpenAI is configured
  const isConfigured = await checkOpenAIConfiguration();
  if (!isConfigured) {
    console.error('Cannot continue without OpenAI configuration.');
    return;
  }
  
  const results = [];
  
  // Generate images for each test prompt
  for (const test of TEST_PROMPTS) {
    const result = await generateTestImage(test.title, test.prompt);
    if (result) {
      results.push(result);
    }
  }
  
  // Display summary
  console.log('\n=== Image Generation Results ===');
  console.log(`Total attempted: ${TEST_PROMPTS.length}`);
  console.log(`Successfully generated: ${results.length}`);
  console.log(`Failed: ${TEST_PROMPTS.length - results.length}`);
  
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