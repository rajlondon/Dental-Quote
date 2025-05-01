/**
 * Gemini API Test Script
 * This script tests the Gemini API connection and identifies available models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables.');
  process.exit(1);
}

// Initialize the API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// List of model names to try
const modelNames = [
  'gemini-pro',
  'gemini-1.0-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
];

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}`);
  
  try {
    // Try to create the model
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Test with a simple prompt
    const prompt = "Translate 'Hello, how are you?' to German.";
    console.log(`Sending prompt: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Response:');
    console.log(text);
    
    return true;
  } catch (error) {
    console.error(`❌ Error with model ${modelName}:`);
    console.error(`   ${error.message}`);
    return false;
  }
}

async function listModels() {
  console.log("Attempting to list available models...");
  
  try {
    // This is a common endpoint for listing models, but it may vary
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models?key=' + GEMINI_API_KEY
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log("\nAvailable models:");
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log("No models found or unexpected response format.");
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

async function main() {
  console.log('🤖 Gemini API Test');
  console.log('=================');
  console.log(`API Key: ${GEMINI_API_KEY.substring(0, 4)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);
  
  let successfulModel = null;
  
  // Try each model
  for (const modelName of modelNames) {
    const success = await testModel(modelName);
    if (success) {
      successfulModel = modelName;
      break;
    }
  }
  
  // Try to list available models
  await listModels();
  
  if (successfulModel) {
    console.log(`\n✅ Successfully connected to Gemini API using model: ${successfulModel}`);
    console.log('You can use this model in your translation script.');
  } else {
    console.log('\n❌ Could not connect to Gemini API with any of the tested models.');
    console.log('Please check your API key and ensure you have access to Gemini.');
  }
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});