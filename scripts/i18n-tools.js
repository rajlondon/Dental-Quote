/**
 * i18n Tools Runner
 * 
 * This script provides a unified interface to run various i18n tools:
 * - Extract translations from components
 * - Find missing translations
 * - Generate translations for new languages
 * - Apply translations from external sources
 * 
 * Usage: node scripts/i18n-tools.js [command] [options]
 * Commands:
 *   extract    - Extract translations from components
 *   missing    - Find missing translations
 *   generate   - Generate translations for a new language
 *   help       - Show help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMMANDS = {
  EXTRACT: 'extract',
  MISSING: 'missing',
  GENERATE: 'generate',
  HELP: 'help'
};

// Get command and options
const [, , command = COMMANDS.HELP, ...options] = process.argv;

// Show help
function showHelp() {
  console.log('i18n Tools Runner');
  console.log('');
  console.log('Usage: node scripts/i18n-tools.js [command] [options]');
  console.log('');
  console.log('Commands:');
  console.log('  extract [component_path]        - Extract translations from components');
  console.log('                                     Default: ./client/src/components');
  console.log('  missing                         - Find missing translations');
  console.log('  generate [source_locale] [target_locale]');
  console.log('                                   - Generate translations for a new language');
  console.log('                                     Default: en to tr');
  console.log('  help                            - Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/i18n-tools.js extract ./client/src/pages');
  console.log('  node scripts/i18n-tools.js missing');
  console.log('  node scripts/i18n-tools.js generate en de');
}

// Run a script with options
function runScript(scriptPath, args = []) {
  const scriptName = path.basename(scriptPath);
  console.log(`Running ${scriptName} with args: ${args.join(' ')}`);
  
  try {
    const command = `node ${scriptPath} ${args.join(' ')}`;
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error running ${scriptName}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  switch (command.toLowerCase()) {
    case COMMANDS.EXTRACT:
      const componentPath = options[0] || './client/src/components';
      const extractScriptPath = path.join(__dirname, 'extract-translations.js');
      
      if (!fs.existsSync(extractScriptPath)) {
        console.error(`Extract script not found: ${extractScriptPath}`);
        break;
      }
      
      runScript(extractScriptPath, [componentPath]);
      break;
      
    case COMMANDS.MISSING:
      const missingScriptPath = path.join(__dirname, 'find-missing-translations.js');
      
      if (!fs.existsSync(missingScriptPath)) {
        console.error(`Missing translations script not found: ${missingScriptPath}`);
        break;
      }
      
      runScript(missingScriptPath);
      break;
      
    case COMMANDS.GENERATE:
      const sourceLocale = options[0] || 'en';
      const targetLocale = options[1] || 'tr';
      const generateScriptPath = path.join(__dirname, 'generate-translations.js');
      
      if (!fs.existsSync(generateScriptPath)) {
        console.error(`Generate translations script not found: ${generateScriptPath}`);
        break;
      }
      
      runScript(generateScriptPath, [sourceLocale, targetLocale]);
      break;
      
    case COMMANDS.HELP:
    default:
      showHelp();
      break;
  }
}

main().catch(console.error);