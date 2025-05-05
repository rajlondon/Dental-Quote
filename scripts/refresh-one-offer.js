import axios from 'axios';

// First offer ID from our sample data in special-offers-routes-fixed.ts
const OFFER_ID = "ac36590b-b0dc-434e-ba74-d42ab2485e81";  // Free Consultation Package

async function refreshOneOffer() {
  console.log(`Refreshing offer image for ID: ${OFFER_ID}`);
  
  try {
    // Use the existing, proven refresh-image endpoint
    const response = await axios.post(`http://localhost:5000/api/special-offers/refresh-image/${OFFER_ID}`, {});
    
    console.log("Image refresh request completed");
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.data && response.data.success) {
      console.log(`✅ Successfully refreshed image for offer ${OFFER_ID}`);
      console.log(`New image URL: ${response.data.imageUrl}`);
    }
  } catch (error) {
    console.error("Error refreshing offer image:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

// Run the refresh function
refreshOneOffer();