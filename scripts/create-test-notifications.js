/**
 * Script to generate test notifications for the patient portal
 * Run with: node scripts/create-test-notifications.js
 */

// This script imports the ES module from the TypeScript file
// and executes it directly to create test notifications

require('dotenv').config();
require('ts-node').register({ transpileOnly: true });

// Import the function from the TypeScript file
const { generateTestNotifications } = require('../server/utils/generate-test-notifications');

async function main() {
  try {
    console.log('Starting test notification generation...');
    const count = await generateTestNotifications();
    console.log(`Created ${count} test notifications for the patient portal.`);
    console.log('✓ Done! Log in to the patient portal to see the notifications.');
    
    // Exit the process when done
    process.exit(0);
  } catch (error) {
    console.error('Failed to create test notifications:', error);
    process.exit(1);
  }
}

main();