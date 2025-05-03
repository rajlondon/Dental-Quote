/**
 * Simple OpenAI API Test Script
 * 
 * Tests connection to OpenAI API and generates a simple text completion
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log API key status
console.log(`API Key status: ${process.env.OPENAI_API_KEY ? 'Available' : 'Missing'}`);
console.log(`API Key length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}`);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 1,
});

async function testConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    // First test a simple text completion
    console.log('Testing text completion API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello, what's the current date?" }],
      max_tokens: 100,
    });
    
    console.log('Text API response:', completion.choices[0].message);
    console.log('Text API connection successful!');
    
    // Then test the image generation API
    console.log('Testing image generation API...');
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A simple blue circle on a white background.",
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });
    
    console.log('Image URL:', imageResponse.data[0].url);
    console.log('Image generation API connection successful!');
    
    console.log('OpenAI API connection fully verified!');
  } catch (error) {
    console.error('Error testing OpenAI API:');
    
    if (error.error) {
      console.error('Error details:', {
        message: error.error.message,
        type: error.error.type,
        param: error.error.param,
        code: error.error.code
      });
    } else {
      console.error(error);
    }
    
    if (error.status === 401) {
      console.error('Authentication error: Please check that your OpenAI API key is valid');
    } else if (error.status === 429) {
      console.error('Rate limit exceeded: Too many requests or exceeded your quota');
    }
  }
}

// Run the test
testConnection().catch(error => {
  console.error('Unexpected error:', error);
});