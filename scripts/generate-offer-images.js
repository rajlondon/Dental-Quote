/**
 * Generate Special Offer Banner Images using OpenAI's DALL-E 3 model
 * 
 * This script generates custom banner images for special offers
 * and saves them to the public images directory
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 2,
});

// Handle ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'images', 'offers');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Define the special offers that need images
const specialOffers = [
  {
    id: 'free-consultation-package',
    title: 'Free Consultation Package',
    prompt: 'A luxurious dental clinic consultation room in Istanbul with modern dental equipment, a comfortable patient chair, and a view of the Bosphorus through large windows. Professional and welcoming atmosphere with subtle luxury elements.',
    filename: 'free-consultation-package.png'
  },
  {
    id: 'premium-hotel-deal',
    title: 'Premium Hotel Deal',
    prompt: 'A 5-star luxury hotel room in Istanbul with a king-size bed, elegant decor, and a balcony with a stunning view of the Bosphorus and Istanbul skyline. Soft lighting, premium bedding, and upscale amenities visible.',
    filename: 'premium-hotel-deal.png'
  },
  {
    id: 'dental-implant-crown-bundle',
    title: 'Dental Implant + Crown Bundle',
    prompt: 'Close-up of a perfect dental implant with crown in a professional dental setting. The image shows the high-quality materials and craftsmanship of the dental work. Clean, medical, and professional atmosphere.',
    filename: 'dental-implant-crown-bundle.png'
  },
  {
    id: 'luxury-airport-transfer',
    title: 'Luxury Airport Transfer',
    prompt: 'A luxury black Mercedes or BMW sedan parked outside Istanbul Airport with a professional chauffeur in a suit holding a sign. The car doors are open, showing the premium leather interior. Modern, sleek, and upscale.',
    filename: 'luxury-airport-transfer.png'
  }
];

/**
 * Generate and save an image using OpenAI's DALL-E 3 model
 * @param {Object} offer - The offer object containing prompt and filename
 */
async function generateImage(offer) {
  try {
    console.log(`Generating image for: ${offer.title}...`);
    
    // Complete prompt with additional quality requirements
    const fullPrompt = `${offer.prompt} Professional marketing photo, high-resolution, photorealistic, detailed, no text or watermarks, 16:9 aspect ratio, premium quality.`;
    
    // Log API key status (without revealing the key)
    console.log(`API Key status: ${process.env.OPENAI_API_KEY ? 'Available' : 'Missing'}`);
    console.log(`API Key length: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0}`);
    
    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard", // Changed from "hd" to "standard" which is more widely supported
      response_format: "url",
    });
    
    // Get the image URL
    const imageUrl = response.data[0].url;
    console.log(`Image URL for ${offer.title}: ${imageUrl}`);
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
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
    console.error(`Error generating image for ${offer.title}:`);
    if (error.error) {
      console.error('Error details:', {
        message: error.error.message,
        type: error.error.type,
        param: error.error.param,
        code: error.error.code
      });
    } else {
      console.error(error);
    }
    
    // This might be an issue with the API key
    if (error.status === 401) {
      console.error('Authentication error: Please check that your OpenAI API key is valid');
    } else if (error.status === 429) {
      console.error('Rate limit exceeded: Too many requests or exceeded your quota');
    }
    
    return null;
  }
}

/**
 * Main function to generate all images
 */
async function generateAllImages() {
  console.log('Starting image generation...');
  
  for (const offer of specialOffers) {
    try {
      const imagePath = await generateImage(offer);
      if (imagePath) {
        console.log(`Successfully generated image for: ${offer.title}`);
      } else {
        console.log(`Failed to generate image for: ${offer.title}`);
      }
    } catch (error) {
      console.error(`Error processing ${offer.title}:`, error);
    }
    
    // Add a delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('Image generation complete.');
}

// Run the main function
generateAllImages().catch(error => {
  console.error('An error occurred during image generation:', error);
});