/**
 * Create a placeholder image for testing
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a basic SVG image
const svgContent = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e0f2ff"/>
  <text x="50%" y="50%" font-family="Arial" font-size="40" text-anchor="middle" fill="#3366cc">
    Default Offer Image
  </text>
  <text x="50%" y="60%" font-family="Arial" font-size="24" text-anchor="middle" fill="#555">
    Test Placeholder (${new Date().toISOString().split('T')[0]})
  </text>
</svg>
`;

// Create the output file path
const outputPath = path.join(__dirname, '../public/default-offer.jpg');
const svgOutputPath = path.join(__dirname, '../public/default-offer.svg');

// Save the SVG file
fs.writeFileSync(svgOutputPath, svgContent, 'utf8');
console.log(`Created SVG placeholder at: ${svgOutputPath}`);

// For JPG (just copy the SVG for now since we don't have image conversion libraries)
fs.copyFileSync(svgOutputPath, outputPath);
console.log(`Created placeholder image at: ${outputPath}`);