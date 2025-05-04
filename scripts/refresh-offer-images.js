/**
 * Refresh Special Offer Images Script
 * 
 * This script triggers image regeneration for special offers using OpenAI's DALL-E
 * It helps to create more professional and eye-catching images for the special offers
 * with consistent styling and quality.
 */

const axios = require('axios');
const readline = require('readline');

// The base URL for the API (use the actual deployed URL when running in production)
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Fixed offer IDs for testing (corresponds to the IDs in special-offers-routes-fixed.ts)
const OFFER_IDS = {
  'free_consultation': 'ac36590b-b0dc-434e-ba74-d42ab2485e81',
  'premium_hotel': '134cdb0f-e783-47f5-a502-70e3960f7246',
  'dental_implant': '3e6a315d-9d9f-4b56-97da-4b3d4b4b5367',
  'luxury_transfer': '72e65d76-4cd5-4fd2-9323-8c35f3a9b9f0',
  'teeth_whitening': 'a9f87e54-3c21-4f89-bc6d-1c2a1dfb76e9'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to refresh an image for a specific offer
async function refreshOfferImage(offerId, naturalStyle = true, customPrompt = '') {
  try {
    console.log(`Refreshing image for offer ID: ${offerId}`);
    
    // First, get the current offer details to use in the prompt
    const testResponse = await axios.get(`${BASE_URL}/api/special-offers/test-refresh/${offerId}`);
    console.log(`Current offer image: ${testResponse.data.currentImageUrl}`);
    
    // Then, trigger the image refresh
    const response = await axios.post(`${BASE_URL}/api/special-offers/refresh-image/${offerId}`, {
      naturalStyle,
      customPrompt
    });
    
    if (response.data.success) {
      console.log(`✅ Success! New image URL: ${response.data.imageUrl}`);
      console.log(`View the updated offer on the homepage or special offers section.`);
      return true;
    } else {
      console.error(`❌ Failed to refresh image: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error refreshing offer image:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Function to refresh all offer images
async function refreshAllOfferImages(naturalStyle = true) {
  console.log('Refreshing all special offer images:');
  let successCount = 0;
  
  for (const [name, id] of Object.entries(OFFER_IDS)) {
    console.log(`\n🔄 Processing "${name}" offer (ID: ${id})...`);
    const success = await refreshOfferImage(id, naturalStyle);
    if (success) successCount++;
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\n✅ Completed! Successfully refreshed ${successCount}/${Object.keys(OFFER_IDS).length} offer images.`);
}

// Function to refresh a specific offer image
async function refreshSpecificOfferImage() {
  console.log('Available offers:');
  Object.entries(OFFER_IDS).forEach(([name, id], index) => {
    console.log(`${index + 1}. ${name} (ID: ${id})`);
  });
  
  rl.question('\nEnter the number of the offer to refresh (or "all" for all offers): ', async (answer) => {
    if (answer.toLowerCase() === 'all') {
      rl.question('Use natural style images? (y/n, default: y): ', async (styleAnswer) => {
        const naturalStyle = styleAnswer.toLowerCase() !== 'n';
        await refreshAllOfferImages(naturalStyle);
        rl.close();
      });
    } else {
      const index = parseInt(answer) - 1;
      const offerEntries = Object.entries(OFFER_IDS);
      
      if (index >= 0 && index < offerEntries.length) {
        const [name, id] = offerEntries[index];
        
        rl.question('Use natural style images? (y/n, default: y): ', async (styleAnswer) => {
          const naturalStyle = styleAnswer.toLowerCase() !== 'n';
          
          rl.question('Enter custom prompt (optional): ', async (promptAnswer) => {
            console.log(`\n🔄 Processing "${name}" offer (ID: ${id})...`);
            await refreshOfferImage(id, naturalStyle, promptAnswer);
            rl.close();
          });
        });
      } else {
        console.error('❌ Invalid offer number. Please try again.');
        rl.close();
      }
    }
  });
}

// Start the script
console.log('🖼️ Special Offer Image Refresh Utility');
console.log('=======================================');
refreshSpecificOfferImage();