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

// Load environment variables
dotenv.config();

// Define the special offers that need new images
const offers = [
  {
    id: 'ba3ab5d6-98ad-41e0-8828-4613e090e4db', // Make sure this matches your actual offer ID
    title: 'Free Consultation Package',
    promotion_level: 'featured',
    prompt: 'Create a completely natural-looking, photorealistic image of a modern dental consultation at a premium clinic. Show a dentist in professional attire discussing treatment options with a patient in a clean, well-designed consultation room with current dental technology visible. Natural lighting, soft colors, professional but warm atmosphere. No text overlays, watermarks, or artificial elements. The image should appear as a high-quality professional photograph, not AI-generated.'
  },
  {
    id: '1e339878-78da-4f1f-b6c7-39c24f595d0c',
    title: 'Premium Hotel Deal',
    promotion_level: 'premium',
    prompt: 'Create a completely natural-looking, photorealistic image of a luxury hotel room in Istanbul with a beautiful view of the Bosphorus. Show a spacious, elegantly decorated room with a king-size bed, modern amenities, and floor-to-ceiling windows revealing the iconic Istanbul skyline. Natural lighting, warm inviting tones, and attention to realistic details. No text overlays, watermarks, or artificial elements. The image should appear as a high-quality professional hotel photograph, not AI-generated.'
  },
  {
    id: '00d74238-40b3-4514-8214-7360a113d1ce',
    title: 'Dental Implant + Crown Bundle',
    promotion_level: 'featured',
    prompt: 'Create a completely natural-looking, photorealistic image showing a dental clinic treatment room with specialized implant equipment. Show an organized, clean space with modern dental technology, sterilized implant components on a tray, and tasteful, professional decor. Include subtle details like dental models showing implants and natural light from windows. No text overlays, watermarks, or artificial elements. The image should appear as a high-quality professional photograph taken for a dental clinic website, not AI-generated.'
  },
  {
    id: '2caaa0b3-4af0-4c68-8768-18ef46e0717c',
    title: 'Luxury Airport Transfer',
    promotion_level: 'premium',
    prompt: 'Create a completely natural-looking, photorealistic image of a premium black Mercedes sedan parked outside Istanbul Airport with a uniformed chauffeur holding a door open. Show the modern airport architecture in the background and capture the exclusive, VIP atmosphere of the scene. Natural lighting, realistic details, and professional composition. No text overlays, watermarks, or artificial elements. The image should appear as a high-quality professional transportation service photograph, not AI-generated.'
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
      timestamp: Date.now()
    };
    
    // Make request to our API
    const response = await fetch('http://localhost:5000/api/openai/special-offer-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'is_authenticated=true; user_role=admin; user_id=1' // Admin authentication
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