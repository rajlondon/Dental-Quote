/**
 * Translation Generator Script
 * 
 * This script generates translation files for a new language based on an existing language.
 * It can also update existing translation files with new keys from a reference language.
 * 
 * Usage: node scripts/generate-translations.js [source-locale] [target-locale]
 * Example: node scripts/generate-translations.js en tr
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = './public/locales';
const SOURCE_LOCALE = process.argv[2] || 'en';
const TARGET_LOCALE = process.argv[3] || 'tr';

// Helper function to read translation file
function readTranslationFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    return {};
  } catch (error) {
    console.error(`Error reading translation file ${filePath}:`, error);
    return {};
  }
}

// Helper function to write translation file
function writeTranslationFile(filePath, data) {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Translation file written to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error writing translation file ${filePath}:`, error);
    return false;
  }
}

// Helper function to merge objects (deep)
function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      // Only add keys that don't already exist in target
      if (!(key in target)) {
        output[key] = source[key];
      }
    }
  }
  
  return output;
}

// Helper function to create a placeholder value
function createPlaceholder(value) {
  // For simple values, just return them with a placeholder indicator
  return `[NEEDS TRANSLATION] ${value}`;
}

// Helper function to generate translation entries from source, preserving existing translations
function generateTranslations(source, existing = {}) {
  const result = { ...existing };
  
  // Process each key in the source
  for (const key in source) {
    if (source[key] instanceof Object) {
      // For nested objects, recursively generate translations
      result[key] = generateTranslations(
        source[key], 
        existing[key] instanceof Object ? existing[key] : {}
      );
    } else {
      // For simple values, only add if they don't exist
      if (!(key in result)) {
        result[key] = createPlaceholder(source[key]);
      }
    }
  }
  
  return result;
}

// Main function
async function main() {
  console.log(`Generating translations from ${SOURCE_LOCALE} to ${TARGET_LOCALE}`);
  
  // Check if source locale exists
  const sourceDir = path.join(LOCALES_DIR, SOURCE_LOCALE);
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source locale directory ${sourceDir} does not exist`);
    return;
  }
  
  // Read source translation file
  const sourceFile = path.join(sourceDir, 'translation.json');
  const sourceTranslations = readTranslationFile(sourceFile);
  
  // Read target translation file if it exists
  const targetDir = path.join(LOCALES_DIR, TARGET_LOCALE);
  const targetFile = path.join(targetDir, 'translation.json');
  const existingTranslations = readTranslationFile(targetFile);
  
  // Generate new translations
  const newTranslations = generateTranslations(sourceTranslations, existingTranslations);
  
  // Write the target translation file
  writeTranslationFile(targetFile, newTranslations);
  
  // Count new entries
  let newCount = 0;
  function countNewEntries(source, target, path = '') {
    for (const key in source) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (source[key] instanceof Object) {
        // For nested objects, recursively count
        countNewEntries(
          source[key], 
          target[key] instanceof Object ? target[key] : {},
          currentPath
        );
      } else {
        // For simple values, check if they were added
        if (target[key] && target[key].startsWith('[NEEDS TRANSLATION]')) {
          newCount++;
          console.log(`New key: ${currentPath}`);
        }
      }
    }
  }
  
  countNewEntries(newTranslations, existingTranslations);
  console.log(`Added ${newCount} new entries to ${TARGET_LOCALE} translations`);
}

main().catch(console.error);