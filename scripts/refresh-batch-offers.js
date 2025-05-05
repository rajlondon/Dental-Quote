import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Using the clinic credentials for authentication
const EMAIL = 'clinic@mydentalfly.com';
const PASSWORD = 'Clinic123!';

// Configuration options for image refresh
const CONFIG = {
  forceRegenerate: true,  // Force regenerate all images even if they already exist
  naturalStyle: true,     // Use improved natural style prompts for better results
  batchSize: 1,           // Process one offer at a time (increase if server can handle more)
  delayBetweenBatches: 30000, // 30 second delay between batches to avoid API rate limits
};

async function refreshBatchOffers() {
  console.log('Starting authenticated batch refresh process...');
  
  try {
    // Step 1: Login to get authenticated session
    console.log('Logging in as clinic user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    }, {
      withCredentials: true
    });
    
    if (!loginResponse.data || !loginResponse.data.success || !loginResponse.data.user) {
      throw new Error('Login failed, no user data returned');
    }
    
    console.log(`Login successful, user ID: ${loginResponse.data.user.id}`);
    
    // Get cookies from the login response
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies || cookies.length === 0) {
      throw new Error('No cookies returned from login');
    }
    
    // Step 2: Get all special offers first
    console.log('Fetching all special offers...');
    const offersResponse = await axios.get(`${BASE_URL}/api/special-offers`, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    const offers = offersResponse.data;
    if (!offers || !offers.length) {
      console.log('No offers found to refresh.');
      return;
    }
    
    console.log(`Found ${offers.length} offers to process.`);
    
    // Step 3: Process offers in batches
    for (let i = 0; i < offers.length; i += CONFIG.batchSize) {
      const batch = offers.slice(i, i + CONFIG.batchSize);
      console.log(`Processing batch ${Math.floor(i / CONFIG.batchSize) + 1} of ${Math.ceil(offers.length / CONFIG.batchSize)}`);
      
      for (const offer of batch) {
        console.log(`Refreshing image for offer: ${offer.title} (${offer.id})`);
        
        try {
          const refreshResponse = await axios.post(`${BASE_URL}/api/special-offers/refresh-image/${offer.id}`, {
            forceRegenerate: CONFIG.forceRegenerate,
            naturalStyle: CONFIG.naturalStyle
          }, {
            headers: {
              Cookie: cookies.join('; ')
            }
          });
          
          console.log(`✅ Successfully refreshed image for offer: ${offer.title}`);
          console.log(`New image URL: ${refreshResponse.data.imageUrl}`);
        } catch (error) {
          console.error(`❌ Error refreshing image for offer ${offer.id}:`, error.message);
          if (error.response) {
            console.error(`Status: ${error.response.status}, Error data:`, error.response.data);
          }
          // Continue with next offer even if this one fails
        }
      }
      
      // If not the last batch, wait before processing the next batch
      if (i + CONFIG.batchSize < offers.length) {
        console.log(`Waiting ${CONFIG.delayBetweenBatches / 1000} seconds before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
      }
    }
    
    // Step 4: Logout when done
    console.log('All batches processed. Logging out...');
    await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Batch refresh process completed successfully.');
  } catch (error) {
    console.error('Error during batch refresh process:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

refreshBatchOffers();