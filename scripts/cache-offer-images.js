import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

/**
 * Script to ensure all special offer images are cached
 * This helps prevent issues with temporary OpenAI URLs expiring
 */
async function cacheOfferImages() {
  try {
    console.log('🔄 Starting Special Offer Image Cache Process');
    
    // Step 1: Login as a clinic user to get authenticated
    console.log('Logging in as clinic user...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'clinic@mydentalfly.com',
      password: 'Clinic123!'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    console.log(`Login successful, user ID: ${loginResponse.data.user.id}`);
    
    // Extract cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'];
    
    // Step 2: Get all offers
    console.log('Fetching all special offers...');
    
    const offersResponse = await axios.get(
      `${BASE_URL}/api/special-offers/all`,
      { headers: { Cookie: cookies.join('; ') } }
    );
    
    if (!offersResponse.data.success) {
      throw new Error('Failed to fetch offers');
    }
    
    const offers = offersResponse.data.offers || [];
    console.log(`Found ${offers.length} special offers to process`);
    
    // Step 3: Process each offer to cache its image
    let successCount = 0;
    let failureCount = 0;
    
    for (const offer of offers) {
      if (offer.banner_image) {
        console.log(`Processing offer ${offer.id}: ${offer.title}`);
        console.log(`Image URL: ${offer.banner_image}`);
        
        try {
          // Call the image cache endpoint to cache this image
          const cacheResponse = await axios.post(
            `${BASE_URL}/api/image-cache/cache`,
            { imageUrl: offer.banner_image, force: true },
            { headers: { Cookie: cookies.join('; ') } }
          );
          
          if (cacheResponse.data.success) {
            console.log(`✅ Successfully cached image: ${cacheResponse.data.cachedUrl}`);
            successCount++;
            
            // Now call the refresh endpoint to update the offer with the versioned URL
            const refreshResponse = await axios.post(
              `${BASE_URL}/api/special-offers/refresh-image`,
              { 
                offerId: offer.id,
                imageUrl: cacheResponse.data.cachedUrl
              },
              { headers: { Cookie: cookies.join('; ') } }
            );
            
            if (refreshResponse.data.success) {
              console.log(`✅ Updated offer with cached image URL`);
            } else {
              console.error(`❌ Failed to update offer with cached image`);
            }
          } else {
            console.error(`❌ Failed to cache image: ${cacheResponse.data.message}`);
            failureCount++;
          }
        } catch (error) {
          console.error(`Error processing offer ${offer.id}:`, error.message);
          failureCount++;
        }
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.warn(`⚠️ Offer ${offer.id} has no banner image to cache`);
      }
    }
    
    // Step 4: Logout
    console.log('Logging out...');
    await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: { Cookie: cookies.join('; ') }
    });
    
    // Print summary
    console.log('\n📊 Cache Process Summary:');
    console.log(`Total offers processed: ${offers.length}`);
    console.log(`Successfully cached: ${successCount}`);
    console.log(`Failed to cache: ${failureCount}`);
    console.log('Process completed');
    
  } catch (error) {
    console.error('❌ Error during offer image caching:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

// Run the caching function
cacheOfferImages();