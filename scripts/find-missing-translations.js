/**
 * Missing Translations Finder
 * 
 * This script scans your translation files and compares keys between languages,
 * identifying which keys exist in one language but are missing in others.
 * 
 * Usage: node scripts/find-missing-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = './public/locales';
const OUTPUT_FILE = './missing-translations.json';

// Helper function to read translation file
function readTranslationFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading translation file ${filePath}:`, error);
    return {};
  }
}

// Helper function to get all keys from an object (including nested keys)
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively get keys from nested object
      keys = [...keys, ...getAllKeys(obj[key], currentKey)];
    } else {
      keys.push(currentKey);
    }
  }
  
  return keys;
}

// Helper function to check if a key exists in an object (including nested keys)
function hasKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return false;
    }
    if (!(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

// Main function
async function main() {
  // Get all locale directories
  const locales = fs.readdirSync(LOCALES_DIR)
    .filter(file => fs.statSync(path.join(LOCALES_DIR, file)).isDirectory());
  
  console.log(`Found ${locales.length} locales: ${locales.join(', ')}`);
  
  // Read all translation files
  const translations = {};
  
  for (const locale of locales) {
    const translationFile = path.join(LOCALES_DIR, locale, 'translation.json');
    if (fs.existsSync(translationFile)) {
      translations[locale] = readTranslationFile(translationFile);
    } else {
      console.warn(`Translation file for locale ${locale} not found`);
      translations[locale] = {};
    }
  }
  
  // Get all keys for each locale
  const keys = {};
  for (const locale in translations) {
    keys[locale] = getAllKeys(translations[locale]);
    console.log(`Locale ${locale} has ${keys[locale].length} keys`);
  }
  
  // Find all unique keys across all locales
  const allKeys = new Set();
  for (const locale in keys) {
    keys[locale].forEach(key => allKeys.add(key));
  }
  
  console.log(`Found ${allKeys.size} unique keys across all locales`);
  
  // Find missing keys for each locale
  const missingKeys = {};
  
  for (const locale in translations) {
    missingKeys[locale] = [];
    
    for (const key of allKeys) {
      if (!hasKey(translations[locale], key)) {
        missingKeys[locale].push(key);
      }
    }
    
    console.log(`Locale ${locale} is missing ${missingKeys[locale].length} keys`);
  }
  
  // Create a detailed report with suggestions
  const report = {
    summary: {
      totalUniqueKeys: allKeys.size,
      locales: {},
    },
    missingByLocale: missingKeys,
    suggestions: {}
  };
  
  // Add locale summaries
  for (const locale in translations) {
    report.summary.locales[locale] = {
      totalKeys: keys[locale].length,
      missingKeys: missingKeys[locale].length,
      completionPercentage: Math.round((keys[locale].length / allKeys.size) * 100)
    };
  }
  
  // Generate suggestions for missing keys
  for (const locale in missingKeys) {
    report.suggestions[locale] = {};
    
    for (const key of missingKeys[locale]) {
      // Find this key in other locales to suggest a translation
      const suggestedLocale = Object.keys(translations)
        .find(otherLocale => otherLocale !== locale && hasKey(translations[otherLocale], key));
      
      if (suggestedLocale) {
        // Get the value from the other locale
        const parts = key.split('.');
        let value = translations[suggestedLocale];
        for (const part of parts) {
          value = value[part];
        }
        
        report.suggestions[locale][key] = {
          referenceLocale: suggestedLocale,
          referenceValue: value
        };
      }
    }
  }
  
  // Save the report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Report saved to ${OUTPUT_FILE}`);
  
  // Generate a simplified console output for quick review
  console.log('\n--- Missing Translations Summary ---');
  for (const locale in report.summary.locales) {
    const { totalKeys, missingKeys, completionPercentage } = report.summary.locales[locale];
    console.log(`${locale}: ${completionPercentage}% complete (${missingKeys} missing)`);
  }
}

main().catch(console.error);