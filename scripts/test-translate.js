/**
 * Test Translation Script
 * 
 * This script tests translating a small sample of JSON data using Gemini API
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

// Sample translation data
const sampleData = {
  "common.welcome": "Welcome to MyDentalFly",
  "common.login": "Login",
  "common.signup": "Sign Up",
  "clinic.treatment_plans.title": "Treatment Plans",
  "clinic.treatment_plans.description": "Manage treatment plans for your patients"
};

// Target language codes
const targetLanguages = ['de', 'ar', 'tr'];

// Language display names
const languageNames = {
  en: 'English',
  de: 'German',
  ar: 'Arabic',
  tr: 'Turkish',
};

async function translateWithGemini(text, sourceLang, targetLang) {
  console.log(`\nTranslating to ${languageNames[targetLang]}...`);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Translate the following JSON keys from ${languageNames[sourceLang]} to ${languageNames[targetLang]}. 
Only translate the values, not the keys. Return the result as a valid JSON object.
For dental and medical terms, use professional terminology.
For Arabic, ensure proper RTL formatting.

${JSON.stringify(text, null, 2)}`;
    
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    console.log('Received response from Gemini API.');
    
    // Extract JSON from the response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                     content.match(/```\n([\s\S]*?)\n```/);
    
    let parsedJson;
    if (jsonMatch && jsonMatch[1]) {
      parsedJson = JSON.parse(jsonMatch[1]);
    } else {
      // Try to parse the entire content as JSON
      parsedJson = JSON.parse(content);
    }
    
    console.log('Translated content:');
    console.log(JSON.stringify(parsedJson, null, 2));
    
    return parsedJson;
  } catch (error) {
    console.error(`Error with Gemini translation: ${error.message}`);
    if (error.message.includes('JSON')) {
      console.log('Raw response:', content);
    }
    return null;
  }
}

async function main() {
  console.log('🌍 Translation Test');
  console.log('=================');
  
  // Translate to each target language
  for (const lang of targetLanguages) {
    try {
      await translateWithGemini(sampleData, 'en', lang);
    } catch (error) {
      console.error(`Error translating to ${languageNames[lang]}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Test completed');
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});