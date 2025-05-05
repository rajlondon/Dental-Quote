import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Using the clinic credentials for authentication
const USERNAME = 'clinic@test.com';
const PASSWORD = 'clinicpass';

async function refreshWithAuth() {
  console.log('Starting authenticated refresh process...');
  
  try {
    // Step 1: Login to get authenticated session
    console.log('Logging in as clinic user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: USERNAME,
      password: PASSWORD
    }, {
      withCredentials: true
    });
    
    if (!loginResponse.data || !loginResponse.data.id) {
      throw new Error('Login failed, no user data returned');
    }
    
    console.log(`Login successful, user ID: ${loginResponse.data.id}`);
    
    // Get cookies from the login response
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies || cookies.length === 0) {
      throw new Error('No cookies returned from login');
    }
    
    // Step 2: Refresh the offer image for a single offer
    const offerId = 'ac36590b-b0dc-434e-ba74-d42ab2485e81'; // Free Consultation Package
    console.log(`Refreshing image for offer ID: ${offerId}`);
    
    const refreshResponse = await axios.post(`${BASE_URL}/api/special-offers/refresh-image/${offerId}`, {}, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Image refresh response:');
    console.log(JSON.stringify(refreshResponse.data, null, 2));
    
    // Step 3: Now try the batch refresh endpoint
    console.log('Refreshing all special offer images...');
    
    const batchResponse = await axios.post(`${BASE_URL}/api/special-offers/refresh-images`, {
      forceRegenerate: true,
      naturalStyle: true
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Batch refresh response:');
    console.log(JSON.stringify(batchResponse.data, null, 2));
    
    // Step 4: Logging out
    console.log('Logging out...');
    await axios.post(`${BASE_URL}/api/logout`, {}, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Process completed successfully');
  } catch (error) {
    console.error('Error during refresh process:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

refreshWithAuth();