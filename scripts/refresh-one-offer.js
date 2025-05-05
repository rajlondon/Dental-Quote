import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Using the clinic credentials for authentication
const EMAIL = 'clinic@mydentalfly.com';
const PASSWORD = 'Clinic123!';

// The specific offer ID to refresh - can be changed to target a specific offer
const OFFER_ID = 'ac36590b-b0dc-434e-ba74-d42ab2485e81'; // Free Consultation Package

async function refreshOneOffer() {
  console.log(`Starting authenticated refresh process for offer: ${OFFER_ID}...`);
  
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
    
    // Step 2: Refresh the specific offer image
    console.log(`Refreshing image for offer ID: ${OFFER_ID}`);
    
    const refreshResponse = await axios.post(`${BASE_URL}/api/special-offers/refresh-image/${OFFER_ID}`, {
      forceRegenerate: true,     // Force regenerate the image even if it already exists
      naturalStyle: true,        // Use improved natural style prompts
      useOpenAI: true,           // Force using OpenAI for generation
      customPrompt: `Create a completely realistic photograph for a dental tourism marketing campaign featuring a free consultation package.
      
SUBJECT:
- A dentist in a professional white coat consulting with a patient in a modern office setting
- The dentist is showing dental x-rays or treatment plans on a tablet to the patient
- Both should have natural expressions in a consultation scenario, not looking at camera
- Office should have modern dental equipment visible but not dominating the scene

TECHNICAL ASPECTS:
- Use a documentary-style photography approach with natural, diffused lighting
- Include proper depth with 50mm lens perspective and f/4.0 aperture simulation
- Create realistic shadows and highlights that follow proper physics of light
- Add subtle imperfections like grain in shadows, minor asymmetries in composition

Avoid any elements that would make this look AI-generated - it should be indistinguishable from a professional photograph taken in a high-end dental clinic with real people.`
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    console.log('Image refresh response:');
    console.log(JSON.stringify(refreshResponse.data, null, 2));
    
    // Step 3: Logout when done
    console.log('Logging out...');
    await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
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

refreshOneOffer();