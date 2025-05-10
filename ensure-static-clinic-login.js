/**
 * This script ensures that the clinic-login.html file is always
 * available at the right location for direct access.
 * 
 * It copies the file from client/public/ to client/dist/
 * where it can be served by the Express server.
 */

const fs = require('fs');
const path = require('path');

function copyClinicLoginFile() {
  try {
    // Source file in the public directory
    const sourceFile = path.join(__dirname, 'client', 'public', 'clinic-login.html');
    
    // Target files - both at the root and in assets directory
    const targetFile1 = path.join(__dirname, 'client', 'dist', 'clinic-login.html');
    const targetFile2 = path.join(__dirname, 'dist', 'clinic-login.html');
    const targetDir = path.dirname(targetFile1);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(path.dirname(targetFile1))) {
      fs.mkdirSync(path.dirname(targetFile1), { recursive: true });
    }
    
    if (!fs.existsSync(path.dirname(targetFile2))) {
      fs.mkdirSync(path.dirname(targetFile2), { recursive: true });
    }
    
    // Read the source file
    const fileContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Write to target locations
    fs.writeFileSync(targetFile1, fileContent, 'utf8');
    console.log(`Successfully copied clinic-login.html to ${targetFile1}`);
    
    fs.writeFileSync(targetFile2, fileContent, 'utf8');
    console.log(`Successfully copied clinic-login.html to ${targetFile2}`);
    
  } catch (error) {
    console.error('Error copying clinic-login.html:', error.message);
  }
}

// Execute the function
copyClinicLoginFile();