/**
 * AI-Powered Translation Generator
 * 
 * This script:
 * 1. Identifies missing translations in target languages
 * 2. Uses OpenAI and Google Gemini to generate translations
 * 3. Updates the locale files with the translated content
 * 
 * Usage: node scripts/ai-translate.js
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API keys
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in environment variables.');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables.');
  process.exit(1);
}

// Initialize AI clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Target languages (add more as needed)
const targetLanguages = ['de', 'ar', 'tr'];

// Source language
const sourceLanguage = 'en';

// Language display names for console output
const languageNames = {
  en: 'English',
  de: 'German',
  ar: 'Arabic',
  tr: 'Turkish',
};

// Get the full language name
const getLanguageName = (code) => languageNames[code] || code;

// Get locale file path
const getLocaleFilePath = (lang) => path.join(process.cwd(), `public/locales/${lang}/translation.json`);

// Load English translations as the source
const loadSourceTranslations = () => {
  try {
    return JSON.parse(fs.readFileSync(getLocaleFilePath(sourceLanguage), 'utf8'));
  } catch (error) {
    console.error(`Error loading source translations: ${error.message}`);
    process.exit(1);
  }
};

// Load existing translations for a language
const loadExistingTranslations = (lang) => {
  try {
    return JSON.parse(fs.readFileSync(getLocaleFilePath(lang), 'utf8'));
  } catch (error) {
    console.log(`No existing translations found for ${getLanguageName(lang)}, creating new file.`);
    return {};
  }
};

// Save translations to a file
const saveTranslations = (lang, translations) => {
  try {
    // Create directory if it doesn't exist
    const dirPath = path.dirname(getLocaleFilePath(lang));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(
      getLocaleFilePath(lang),
      JSON.stringify(translations, null, 2),
      'utf8'
    );
    console.log(`✓ Saved translations for ${getLanguageName(lang)}`);
  } catch (error) {
    console.error(`Error saving translations for ${getLanguageName(lang)}: ${error.message}`);
  }
};

// Translate text using OpenAI
async function translateWithOpenAI(text, sourceLang, targetLang) {
  console.log(`  Using OpenAI for ${Object.keys(text).length} keys...`);
  
  const langName = getLanguageName(targetLang);
  const prompt = `Translate the following JSON keys from ${getLanguageName(sourceLang)} to ${langName}. 
Only translate the values, not the keys. Return the result as a valid JSON object.
For dental and medical terms, use professional terminology.
For Arabic, ensure proper RTL formatting.

${JSON.stringify(text, null, 2)}`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error(`  Error with OpenAI translation: ${error.message}`);
    return null;
  }
}

// Translate text using Google Gemini
async function translateWithGemini(text, sourceLang, targetLang) {
  console.log(`  Using Gemini for ${Object.keys(text).length} keys...`);
  
  try {
    // Use gemini-1.5-pro model which is the current stable version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const langName = getLanguageName(targetLang);
    const prompt = `Translate the following JSON keys from ${getLanguageName(sourceLang)} to ${langName}. 
Only translate the values, not the keys. Return the result as a valid JSON object.
For dental and medical terms, use professional terminology.
For Arabic, ensure proper RTL formatting.

${JSON.stringify(text, null, 2)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Extract JSON from the response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                     content.match(/```\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // Try to parse the entire content as JSON
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`  Error with Gemini translation: ${error.message}`);
    return null;
  }
}

// Process translations in smaller chunks to avoid token limits
async function processTranslationsInChunks(translations, sourceLang, targetLang) {
  // Convert flat translations to a nested structure for easier chunking
  const keys = Object.keys(translations);
  const chunks = [];
  const chunkSize = 30; // Adjust based on token limits
  
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = {};
    const chunkKeys = keys.slice(i, i + chunkSize);
    
    for (const key of chunkKeys) {
      chunk[key] = translations[key];
    }
    
    chunks.push(chunk);
  }
  
  // Process each chunk
  const translatedChunks = [];
  for (const [index, chunk] of chunks.entries()) {
    console.log(`  Translating chunk ${index + 1}/${chunks.length} (${Object.keys(chunk).length} keys)...`);
    
    // Use OpenAI for Arabic (better with RTL languages)
    // Use Gemini for other languages (more cost-effective)
    let translatedChunk = null;
    
    if (targetLang === 'ar') {
      translatedChunk = await translateWithOpenAI(chunk, sourceLang, targetLang);
      
      // Fallback to Gemini if OpenAI fails
      if (!translatedChunk) {
        translatedChunk = await translateWithGemini(chunk, sourceLang, targetLang);
      }
    } else {
      translatedChunk = await translateWithGemini(chunk, sourceLang, targetLang);
      
      // Fallback to OpenAI if Gemini fails
      if (!translatedChunk) {
        translatedChunk = await translateWithOpenAI(chunk, sourceLang, targetLang);
      }
    }
    
    if (translatedChunk) {
      translatedChunks.push(translatedChunk);
    } else {
      console.error(`  Failed to translate chunk ${index + 1}, skipping...`);
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Merge all translated chunks
  const mergedTranslations = {};
  for (const chunk of translatedChunks) {
    Object.assign(mergedTranslations, chunk);
  }
  
  return mergedTranslations;
}

// Main function
async function main() {
  console.log('🌍 AI Translation Generator');
  console.log('---------------------------');
  
  // Load source translations
  console.log(`Loading source translations from ${getLanguageName(sourceLanguage)}...`);
  const sourceTranslations = loadSourceTranslations();
  console.log(`Found ${Object.keys(sourceTranslations).length} keys in source language.`);
  
  // Process each target language
  for (const lang of targetLanguages) {
    console.log(`\n📝 Processing translations for ${getLanguageName(lang)}...`);
    
    // Load existing translations
    const existingTranslations = loadExistingTranslations(lang);
    console.log(`  Found ${Object.keys(existingTranslations).length} existing translations.`);
    
    // Find missing translations
    const missingTranslations = {};
    for (const key in sourceTranslations) {
      if (!existingTranslations[key]) {
        missingTranslations[key] = sourceTranslations[key];
      }
    }
    
    if (Object.keys(missingTranslations).length === 0) {
      console.log(`  ✓ No missing translations for ${getLanguageName(lang)}.`);
      continue;
    }
    
    console.log(`  Found ${Object.keys(missingTranslations).length} missing translations.`);
    
    // Generate missing translations
    console.log(`  Generating translations using AI...`);
    const translatedStrings = await processTranslationsInChunks(
      missingTranslations, 
      sourceLanguage, 
      lang
    );
    
    if (!translatedStrings || Object.keys(translatedStrings).length === 0) {
      console.error(`  ✗ Failed to generate translations for ${getLanguageName(lang)}.`);
      continue;
    }
    
    console.log(`  ✓ Generated ${Object.keys(translatedStrings).length} translations.`);
    
    // Merge with existing translations
    const updatedTranslations = { ...existingTranslations, ...translatedStrings };
    
    // Save updated translations
    saveTranslations(lang, updatedTranslations);
    
    // Calculate translation completion percentage
    const completionPercentage = 
      (Object.keys(updatedTranslations).length / Object.keys(sourceTranslations).length) * 100;
    
    console.log(`  → ${getLanguageName(lang)} translations: ${completionPercentage.toFixed(1)}% complete`);
  }
  
  console.log('\n✅ Translation process completed.');
}

// Run the script
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});