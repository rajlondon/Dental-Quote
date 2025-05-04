#!/usr/bin/env node
/**
 * Refresh Special Offer Banner Images using OpenAI's DALL-E 3 model
 * 
 * This script generates 4 new natural-looking marketing images for the special offers
 * section of the homepage. It uses the existing OpenAI integration and image cache.
 */
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Define the special offers that need new images
const offers = [
  {
    id: 'ba3ab5d6-98ad-41e0-8828-4613e090e4db', // Make sure this matches your actual offer ID
    title: 'Free Consultation Package',
    promotion_level: 'featured',
    prompt: 'Create a completely natural-looking, photorealistic image of a modern dental consultation at a premium clinic. Show a dentist in professional attire discussing treatment options with a smiling patient using a tablet and dental models. Natural lighting through large windows, warm beige and blue color palette, with subtle dental equipment visible in background. The image should look like an editorial photograph for a luxury dental magazine, not AI-generated. 4K quality with realistic textures and accurate lighting.'
  },
  {
    id: '1e339878-78da-4f1f-b6c7-39c24f595d0c',
    title: 'Premium Hotel Deal',
    promotion_level: 'premium',
    prompt: 'Create a completely natural-looking, photorealistic image of a luxury hotel room in Istanbul with a stunning view of the Bosphorus. Show a spacious suite with a king-size bed draped in premium white linens, designer furniture in gold and blue tones, and floor-to-ceiling windows framing the iconic Istanbul skyline at golden hour. Include subtle details like a fruit basket, marble bathroom glimpse, and mood lighting. The image should look like a professional hotel marketing photograph shot with a 50mm lens, 4K quality with perfect exposure and depth of field, not AI-generated.'
  },
  {
    id: '00d74238-40b3-4514-8214-7360a113d1ce',
    title: 'Dental Implant + Crown Bundle',
    promotion_level: 'featured',
    prompt: 'Create a completely natural-looking, photorealistic image showing a modern dental clinic treatment room specialized for implant procedures. Show a pristine treatment chair with overhead lights, sterilized implant components arranged on a stainless steel tray, and a digital display showing a 3D implant model. Include subtle details like dental tools, a glass wall with natural light, and soft blue/white color scheme. The image should look like a professional marketing photograph shot with a Canon 5D, 4K quality with perfect lighting, not AI-generated.'
  },
  {
    id: '2caaa0b3-4af0-4c68-8768-18ef46e0717c',
    title: 'Luxury Airport Transfer',
    promotion_level: 'premium',
    prompt: 'Create a completely natural-looking, photorealistic image of a premium black Mercedes S-Class sedan parked outside Istanbul Airport\'s international terminal. Show a professional uniformed chauffeur in suit and tie holding a passenger door open with the modern glass/steel terminal architecture visible in the background. Early evening golden hour lighting with slight reflections on the polished black car. Include subtle details like a "VIP Transfer" sign and blurred travelers in background. The image should look like professional marketing content shot with a full frame camera for a luxury transportation service, not AI-generated.'
  }
];

async function generateImage(offer) {
  console.log(`Generating image for: ${offer.title}...`);
  
  try {
    // Prepare request body
    const requestBody = {
      offerId: offer.id,
      offerTitle: offer.title,
      offerType: offer.promotion_level,
      enableImageCache: true,
      customPrompt: offer.prompt, // Add custom prompt
      naturalStyle: true, // Signal that we want a natural-looking image
      timestamp: Date.now(),
      useFallback: true // Force fallback mode for testing
    };
    
    // Make request to our API - use the actual server URL from environment or default to localhost
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    console.log(`Making request to: ${serverUrl}/api/openai/special-offer-image`);
    
    // Get API key from environment or use our configured default
    const apiKey = process.env.API_KEY || 'mydentalfly-api-token-12345';
    
    const response = await fetch(`${serverUrl}/api/openai/special-offer-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey // Alternate auth method
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate image: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully generated image for "${offer.title}"`);
    console.log(`Image URL: ${data.data.url}`);
    
    if (data.data.cached) {
      console.log(`✅ Image is cached at: ${data.data.url}`);
    } else {
      console.log(`⚠️ Image is not cached, only available temporarily`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error generating image for ${offer.title}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting image generation for 4 special offers...');
  
  // Generate images sequentially to avoid rate limits
  for (const offer of offers) {
    console.log(`\nProcessing offer: ${offer.title}`);
    const result = await generateImage(offer);
    
    if (result) {
      console.log(`✅ Successfully processed "${offer.title}"`);
    } else {
      console.log(`❌ Failed to process "${offer.title}"`);
    }
    
    // Wait 15 seconds between image generations to avoid rate limits
    console.log('Waiting 15 seconds before next image generation...');
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  
  console.log('\n✅ All special offer images have been processed');
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});