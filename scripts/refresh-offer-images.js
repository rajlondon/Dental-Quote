import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';

// Refresh all special offer images by calling the API to regenerate them
async function refreshOfferImages() {
  console.log("Starting to refresh all special offer images...");
  
  try {
    // Call the API endpoint to trigger image regeneration
    // The endpoint is defined as '/refresh-images' in the router, which becomes '/api/special-offers/refresh-images'
    const response = await axios.post("http://localhost:5000/api/special-offers/refresh-images", {
      forceRegenerate: true,
      naturalStyle: true
    });
    
    console.log("Image refresh request completed");
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.data && response.data.refreshedOffers) {
      console.log(`Successfully refreshed ${response.data.refreshedOffers.length} offer images`);
      
      // Display each refreshed offer
      response.data.refreshedOffers.forEach(offer => {
        console.log(`- Offer: ${offer.title} (ID: ${offer.id}) - New image URL: ${offer.image_url}`);
      });
    }
  } catch (error) {
    console.error("Error refreshing offer images:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

// Run the refresh function
refreshOfferImages();
