/**
 * Manual Translation Helper
 * 
 * This script:
 * 1. Identifies missing translations in target languages
 * 2. Exports them to CSV files for manual translation
 * 3. Provides a function to import completed translations back
 * 
 * Usage: 
 * - Export: node scripts/manual-translate.js export
 * - Import: node scripts/manual-translate.js import <language-code>
 */

import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';

// Target languages
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

// Get export file path
const getExportFilePath = (lang) => path.join(process.cwd(), `translation-export-${lang}.csv`);

// Load translations from a locale file
const loadTranslations = (lang) => {
  try {
    return JSON.parse(fs.readFileSync(getLocaleFilePath(lang), 'utf8'));
  } catch (error) {
    console.log(`No existing translations found for ${getLanguageName(lang)}, creating new file.`);
    return {};
  }
};

// Save translations to a locale file
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

// Flatten nested objects with dot notation
const flattenTranslations = (obj, prefix = '') => {
  let result = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recursive call for nested objects
      const flattened = flattenTranslations(obj[key], newKey);
      result = { ...result, ...flattened };
    } else {
      // Leaf node (actual translation string)
      result[newKey] = obj[key];
    }
  }
  
  return result;
};

// Unflatten dot notation back to nested objects
const unflattenTranslations = (flatObj) => {
  const result = {};
  
  for (const key in flatObj) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (!current[part]) {
        current[part] = {};
      }
      
      current = current[part];
    }
    
    // Set the value at the leaf
    current[parts[parts.length - 1]] = flatObj[key];
  }
  
  return result;
};

// Export translations to CSV for manual translation
const exportTranslations = () => {
  console.log('🌍 Manual Translation Export');
  console.log('---------------------------');
  
  // Load source translations
  console.log(`Loading source translations from ${getLanguageName(sourceLanguage)}...`);
  const sourceTranslations = loadTranslations(sourceLanguage);
  
  // Flatten nested objects for CSV export
  const flattenedSourceTranslations = flattenTranslations(sourceTranslations);
  const translationKeys = Object.keys(flattenedSourceTranslations);
  
  console.log(`Found ${translationKeys.length} translatable strings in source language.`);
  
  // Process each target language
  for (const lang of targetLanguages) {
    console.log(`\n📝 Processing translations for ${getLanguageName(lang)}...`);
    
    // Load existing translations
    const existingTranslations = loadTranslations(lang);
    const flattenedExistingTranslations = flattenTranslations(existingTranslations);
    
    console.log(`  Found ${Object.keys(flattenedExistingTranslations).length} existing translations.`);
    
    // Find missing translations
    const missingTranslations = {};
    for (const key in flattenedSourceTranslations) {
      if (!flattenedExistingTranslations[key]) {
        missingTranslations[key] = flattenedSourceTranslations[key];
      }
    }
    
    if (Object.keys(missingTranslations).length === 0) {
      console.log(`  ✓ No missing translations for ${getLanguageName(lang)}.`);
      continue;
    }
    
    console.log(`  Found ${Object.keys(missingTranslations).length} missing translations.`);
    
    // Create CSV content
    let csvContent = 'key,source,translation\n';
    for (const key in missingTranslations) {
      // Skip non-string values (like objects without leaf nodes)
      if (typeof missingTranslations[key] !== 'string' && typeof missingTranslations[key] !== 'number') {
        continue;
      }
      
      // Escape quotes in the source text
      const escapedSource = String(missingTranslations[key]).replace(/"/g, '""');
      csvContent += `"${key}","${escapedSource}",""\n`;
    }
    
    // Write CSV file
    try {
      fs.writeFileSync(getExportFilePath(lang), csvContent, 'utf8');
      console.log(`  ✓ Exported missing translations to ${getExportFilePath(lang)}`);
    } catch (error) {
      console.error(`  ✗ Error exporting translations: ${error.message}`);
    }
  }
  
  console.log('\n✅ Export completed. Fill in the "translation" column and then import the completed file.');
  console.log('   To import: node scripts/manual-translate.js import <language-code>');
};

// Parse a CSV line, handling quoted values correctly
const parseCSVLine = (line) => {
  const values = [];
  let inQuotes = false;
  let currentValue = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Check if this is an escaped quote (followed by another quote)
      if (i + 1 < line.length && line[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue);
  
  return values;
};

// Import translations from CSV
const importTranslations = async (lang) => {
  if (!targetLanguages.includes(lang)) {
    console.error(`Error: Invalid language code. Available languages: ${targetLanguages.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`🌍 Importing translations for ${getLanguageName(lang)}`);
  console.log('---------------------------');
  
  const csvPath = getExportFilePath(lang);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: Translation file not found: ${csvPath}`);
    console.log(`Run 'node scripts/manual-translate.js export' first to generate the file.`);
    process.exit(1);
  }
  
  // Load existing translations
  const existingTranslations = loadTranslations(lang);
  const flattenedExistingTranslations = flattenTranslations(existingTranslations);
  console.log(`Loaded ${Object.keys(flattenedExistingTranslations).length} existing translations.`);
  
  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header row
  lines.shift();
  
  // Parse CSV and update translations
  const updatedFlatTranslations = { ...flattenedExistingTranslations };
  let importCount = 0;
  
  for (const line of lines) {
    const values = parseCSVLine(line);
    
    // We expect key, source, translation
    if (values.length >= 3) {
      const [key, , translation] = values;
      
      // Only add non-empty translations
      if (key && translation) {
        updatedFlatTranslations[key] = translation;
        importCount++;
      }
    }
  }
  
  if (importCount === 0) {
    console.log('No translations found in the import file or all translations are empty.');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Do you want to continue anyway? (y/n): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Import cancelled.');
      process.exit(0);
    }
  }
  
  // Unflatten the translations back to nested objects
  const updatedTranslations = unflattenTranslations(updatedFlatTranslations);
  
  // Save updated translations
  saveTranslations(lang, updatedTranslations);
  
  console.log(`✅ Imported ${importCount} translations for ${getLanguageName(lang)}.`);
  
  // Calculate translation completion percentage
  const sourceTranslations = loadTranslations(sourceLanguage);
  const flattenedSourceTranslations = flattenTranslations(sourceTranslations);
  
  const completionPercentage = 
    (Object.keys(updatedFlatTranslations).length / Object.keys(flattenedSourceTranslations).length) * 100;
  
  console.log(`  → ${getLanguageName(lang)} translations: ${completionPercentage.toFixed(1)}% complete`);
};

// Main function
async function main() {
  const command = process.argv[2] || 'export';
  
  if (command === 'export') {
    exportTranslations();
  } else if (command === 'import') {
    const lang = process.argv[3];
    
    if (!lang) {
      console.error('Error: Language code required for import.');
      console.log('Usage: node scripts/manual-translate.js import <language-code>');
      console.log(`Available languages: ${targetLanguages.join(', ')}`);
      process.exit(1);
    }
    
    await importTranslations(lang);
  } else {
    console.error(`Error: Unknown command '${command}'`);
    console.log('Available commands: export, import');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});