/**
 * Download Free Special Offer Images
 * 
 * This script downloads free high-resolution images from Unsplash
 * for use in the special offers carousel.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handle ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'images', 'offers');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Define the special offers and their image sources
const specialOffers = [
  {
    id: 'free-consultation-package',
    title: 'Free Consultation Package',
    imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1024&auto=format&fit=crop',
    filename: 'free-consultation-package.jpg'
  },
  {
    id: 'premium-hotel-deal',
    title: 'Premium Hotel Deal',
    imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1024&auto=format&fit=crop',
    filename: 'premium-hotel-deal.jpg'
  },
  {
    id: 'dental-implant-crown-bundle',
    title: 'Dental Implant + Crown Bundle',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1024&auto=format&fit=crop',
    filename: 'dental-implant-crown-bundle.jpg'
  },
  {
    id: 'luxury-airport-transfer',
    title: 'Luxury Airport Transfer',
    imageUrl: 'https://images.unsplash.com/photo-1627726277388-81b3083f861a?q=80&w=1024&auto=format&fit=crop',
    filename: 'luxury-airport-transfer.jpg'
  }
];

/**
 * Download and save an image from a URL
 * @param {Object} offer - The offer object containing image URL and filename
 */
async function downloadImage(offer) {
  try {
    console.log(`Downloading image for: ${offer.title}...`);
    
    // Download the image
    const imageResponse = await fetch(offer.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download the image: ${imageResponse.statusText}`);
    }
    
    // Convert the image to a buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Save the image to the output directory
    const outputPath = path.join(outputDir, offer.filename);
    fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
    
    console.log(`Image saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error downloading image for ${offer.title}:`, error);
    return null;
  }
}

/**
 * Download all offer images
 */
async function downloadAllImages() {
  console.log('Starting image downloads...');
  
  for (const offer of specialOffers) {
    try {
      const imagePath = await downloadImage(offer);
      if (imagePath) {
        console.log(`Successfully downloaded image for: ${offer.title}`);
      } else {
        console.log(`Failed to download image for: ${offer.title}`);
      }
    } catch (error) {
      console.error(`Error processing ${offer.title}:`, error);
    }
  }
  
  console.log('Image downloads complete.');
}

// Run the main function
downloadAllImages().catch(error => {
  console.error('An error occurred during image downloads:', error);
});