/**
 * Force Download Special Offer Images Script
 * 
 * This script downloads high-quality images for the special offers carousel
 * from public URLs to ensure they're available locally for the application.
 */
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the target directory for downloaded images
const targetDir = path.join(__dirname, '..', 'public', 'images', 'offers');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Define image sources (high-quality stock images)
const imageSources = [
  {
    id: 'free-consultation',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    filename: 'free-consultation.jpg'
  },
  {
    id: 'dental-implant-crown-bundle',
    url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    filename: 'dental-implant-crown-bundle.jpg'
  },
  {
    id: 'luxury-airport-transfer',
    url: 'https://images.unsplash.com/photo-1513618827672-0d7f5cd7f40a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    filename: 'luxury-airport-transfer.jpg'
  },
  {
    id: 'premium-hotel-deal',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    filename: 'premium-hotel-deal.jpg'
  }
];

// Function to download an image
async function downloadImage(url, filepath) {
  try {
    console.log(`Downloading image from ${url}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    fs.writeFileSync(filepath, buffer);
    
    console.log(`Image saved successfully to ${filepath}`);
    return true;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('Starting download of special offer images...');
  
  const results = [];
  
  for (const source of imageSources) {
    const filepath = path.join(targetDir, source.filename);
    const success = await downloadImage(source.url, filepath);
    
    results.push({
      id: source.id,
      filename: source.filename,
      success
    });
  }
  
  console.log('\nDownload Summary:');
  console.table(results);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\nDownloaded ${successCount} of ${imageSources.length} images successfully.`);
}

main().catch(console.error);