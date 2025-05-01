/**
 * Translation Extraction Script
 * 
 * This script extracts hardcoded English strings from React components
 * and generates translation keys and entries for them.
 * 
 * Usage: node scripts/extract-translations.js [component_path]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const defaultBasePath = './client/src/components';
const outputPath = './translation-entries.json';
const componentPath = process.argv[2] || defaultBasePath;

// Regular expressions for finding hardcoded strings in React components
const stringRegexes = [
  /"([^"\\]*(?:\\.[^"\\]*)*)"/g,    // Double quoted strings
  /'([^'\\]*(?:\\.[^'\\]*)*)'/g,    // Single quoted strings
  /`([^`\\]*(?:\\.[^`\\]*)*)`/g     // Template literals (simple ones)
];

// Ignore patterns - words that shouldn't be considered for translation
const ignorePatterns = [
  /^[0-9.]+$/, // Numbers
  /^(https?:\/\/|www\.|mailto:|tel:)/, // URLs, emails, phone numbers
  /^(flex-|md:|lg:|sm:|grid-|p-|m-|w-|h-|text-|bg-|border-|rounded-|shadow-|space-|gap-|items-|justify-|animate-|transition-|transform-|hover:|focus:|active:|max-|min-)/, // CSS classes
  /^[a-z0-9_]+$/i, // Variable names, class names, IDs
  /^\s*$/, // Empty strings
  /^(true|false|null|undefined)$/, // JavaScript literals
  /^[#{}()<>\[\].,;:?!&|=+\-*/%^]+$/ // Symbols
];

// Skip certain files
const skipFiles = [
  'node_modules',
  'test',
  'tests',
  'dist',
  'build',
  '.git',
  '.next',
  'i18n.js',
  'translation',
  'locale'
];

// Words that shouldn't be considered for translation
const skipWords = [
  'id', 'className', 'style', 'key', 'ref', 'type', 'name', 'value', 'onChange', 'onClick',
  'onSubmit', 'placeholder', 'src', 'alt', 'href', 'target', 'rel', 'aria-', 'data-', 'role',
  'hidden', 'disabled', 'required', 'autoComplete', 'autoFocus', 'maxLength', 'min', 'max',
  'pattern', 'size', 'step', 'rows', 'cols', 'checked', 'selected', 'multiple', 'accept',
  'acceptCharset', 'action', 'method', 'encType', 'noValidate', 'form', 'formAction', 'formMethod',
  'formEncType', 'formNoValidate', 'formTarget', 'inputMode', 'list', 'step', 'default'
];

// Function to check if a string should be ignored
function shouldIgnore(str) {
  if (str.length < 2) return true; // Skip single characters
  if (skipWords.includes(str)) return true;
  
  for (const pattern of ignorePatterns) {
    if (pattern.test(str)) return true;
  }
  
  return false;
}

// Function to generate translation key from string
function generateKey(str) {
  // Replace spaces with underscores and remove special characters
  let key = str.toLowerCase()
    .replace(/[^a-z0-9_\s]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 40); // Limit key length
  
  return key;
}

// Function to extract strings from file content
function extractStringsFromFile(filePath, fileContent) {
  const extractedStrings = new Set();
  
  // Process each regex pattern
  for (const regex of stringRegexes) {
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      const str = match[1].trim();
      if (!shouldIgnore(str)) {
        extractedStrings.add(str);
      }
    }
  }
  
  return [...extractedStrings];
}

// Function to process a component file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Skip if file should be ignored
  if (skipFiles.some(pattern => filePath.includes(pattern))) {
    console.log(`Skipping ${filePath}`);
    return [];
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const strings = extractStringsFromFile(filePath, fileContent);
    
    // Generate translation entries
    const componentName = path.basename(filePath, path.extname(filePath));
    const namespace = path.dirname(filePath).split(path.sep).slice(-2).join('.');
    
    return strings.map(str => {
      const key = `${namespace}.${generateKey(str)}`;
      return { key, en: str };
    });
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [];
  }
}

// Main function
async function main() {
  // Find all component files
  const files = glob.sync(`${componentPath}/**/*.{jsx,tsx}`, { nodir: true });
  console.log(`Found ${files.length} files to process`);
  
  // Process each file and collect translation entries
  const allEntries = {};
  
  for (const file of files) {
    const entries = processFile(file);
    
    // Add to translations map
    entries.forEach(entry => {
      allEntries[entry.key] = entry.en;
    });
  }
  
  // Save to output file
  const outputContent = JSON.stringify(allEntries, null, 2);
  fs.writeFileSync(outputPath, outputContent, 'utf8');
  
  console.log(`Extracted ${Object.keys(allEntries).length} strings to ${outputPath}`);
}

main().catch(console.error);