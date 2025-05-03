/**
 * Simple DALL-E API Test Script
 * 
 * Tests connection specifically to OpenAI's DALL-E image generation API
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get output directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'images', 'test');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Initialize OpenAI with verbose logging
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

console.log('Testing DALL-E API...');
console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
console.log('API Key last 4 chars:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.slice(-4) : 'N/A');

async function testDallE() {
  try {
    console.log('Sending request to DALL-E API...');
    console.log('Prompt: "A simple blue square on a white background"');
    
    const response = await openai.images.generate({
      model: "dall-e-2", // Using DALL-E 2 which is more widely available
      prompt: "A simple blue square on a white background",
      n: 1,
      size: "1024x1024",
      response_format: "url"
    });
    
    console.log('Response received!');
    console.log('Image URL:', response.data[0].url);
    
    // Download the image
    console.log('Downloading image...');
    const imageResponse = await fetch(response.data[0].url);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Save the image
    const outputPath = path.join(outputDir, 'test-image.png');
    fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
    console.log('Image saved to:', outputPath);
    
    console.log('DALL-E test completed successfully!');
  } catch (error) {
    console.error('Error testing DALL-E:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.error) {
      console.error('OpenAI error details:', {
        message: error.error.message,
        type: error.error.type,
        param: error.error.param,
        code: error.error.code
      });
    }
  }
}

testDallE();