/**
 * Offer Content Generation Script for Special Offers
 * This script uses the Gemini API to generate premium descriptions for special offers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Ensure the images directory exists
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Function to generate rich descriptions using Gemini Pro
const generateOfferDescription = async (offerTitle, shortDescription) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    });
    
    const prompt = `
Create an engaging and premium-sounding description for a dental tourism special offer.

Offer Title: "${offerTitle}"
Short Description: "${shortDescription}"

Requirements:
1. Write in a professional yet approachable tone
2. Emphasize value and premium quality
3. Keep it under 200 words
4. Include benefits for international patients
5. Maintain a trustworthy medical tone without being overly clinical
6. Focus on the premium aspects of the service
7. Do not include any pricing information

Return only the description text without any additional commentary.
`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating description:', error);
    return shortDescription; // Fallback to the original short description
  }
};

// The offers we need to update with premium content
const offers = [
  {
    id: 'free-consultation',
    title: 'Free Consultation Package',
    description: 'Dental consultation with expert dentists in a modern clinic setting',
    imagePath: '/images/clinics/dentgroup.jpg' // We'll keep using the existing image
  },
  {
    id: 'dental-implant-crown-bundle',
    title: 'Dental Implant + Crown Bundle',
    description: 'Premium dental implant with crown procedure in a state-of-the-art clinic',
    imagePath: '/images/treatments/illustrations/dental-implants1.png' // We'll use an existing dental implant image
  },
  {
    id: 'luxury-airport-transfer',
    title: 'Luxury Airport Transfer',
    description: 'Complimentary luxury car transfer from airport to your hotel and clinic',
    imagePath: '/images/offers/luxury-airport-transfer.jpg' // We'll specify a path but update the PremiumOffersCarousel to handle missing images
  }
];

// Update the special offers data with premium descriptions
const updateOfferDescriptions = async () => {
  console.log('Starting to generate premium descriptions for special offers...');
  
  // Create an updated array of offers with enhanced descriptions
  const updatedOffers = [];
  
  for (const offer of offers) {
    console.log(`Generating premium description for "${offer.title}"...`);
    
    // Generate an enhanced, premium-sounding description
    const enhancedDescription = await generateOfferDescription(offer.title, offer.description);
    
    // Add to the updated offers list
    updatedOffers.push({
      ...offer,
      description: enhancedDescription
    });
    
    console.log(`Generated premium description for "${offer.title}"`);
  }
  
  // Updated special offers data to inject into the component
  const jsonContent = JSON.stringify(updatedOffers, null, 2);
  
  console.log('\nUpdated offer descriptions:');
  console.log(jsonContent);
  
  // Now let's update the carousel component to use these descriptions
  const carouselPath = path.join(__dirname, '..', 'client', 'src', 'components', 'PremiumOffersCarousel.tsx');
  
  if (fs.existsSync(carouselPath)) {
    // Read the current file
    console.log(`\nUpdating carousel component at ${carouselPath}`);
    let carouselContent = fs.readFileSync(carouselPath, 'utf8');
    
    // Find the sample offers array
    const sampleOffersMatch = carouselContent.match(/const sampleOffers: SpecialOffer\[\] = \[\s*{[\s\S]*?\n\s*}\n\s*\];/);
    
    if (sampleOffersMatch) {
      // Generate new sampleOffers content
      let newOffersContent = 'const sampleOffers: SpecialOffer[] = [\n';
      
      // Add each offer with proper formatting
      updatedOffers.forEach((offer, index) => {
        newOffersContent += `  {\n`;
        newOffersContent += `    id: "${offer.id}",\n`;
        newOffersContent += `    clinic_id: "${index + 1}",\n`;
        newOffersContent += `    title: "${offer.title}",\n`;
        newOffersContent += `    description: "${offer.description.replace(/"/g, '\\"').replace(/\n/g, ' ')}",\n`;
        newOffersContent += `    discount_type: "${index === 0 ? 'percentage' : 'fixed'}",\n`;
        newOffersContent += `    discount_value: ${index === 0 ? 100 : 20 * (index + 1)},\n`;
        newOffersContent += `    applicable_treatments: ${index === 0 ? '["Dental Implants", "Veneers", "Full Mouth Reconstruction"]' : '["All Treatments"]'},\n`;
        newOffersContent += `    start_date: new Date().toISOString(),\n`;
        newOffersContent += `    end_date: new Date(new Date().setMonth(new Date().getMonth() + ${index + 2})).toISOString(),\n`;
        newOffersContent += `    promo_code: "${offer.id.toUpperCase()}${index + 100}",\n`;
        newOffersContent += `    terms_conditions: "Terms and conditions apply. Please contact our team for details.",\n`;
        newOffersContent += `    banner_image: "${offer.imagePath}",\n`;
        newOffersContent += `    is_active: true,\n`;
        newOffersContent += `    admin_approved: true,\n`;
        newOffersContent += `    commission_percentage: ${20 - (index * 2)},\n`;
        newOffersContent += `    promotion_level: "${index === 0 ? 'premium' : index === 1 ? 'featured' : 'standard'}",\n`;
        newOffersContent += `    homepage_display: true,\n`;
        newOffersContent += `    created_at: new Date().toISOString(),\n`;
        newOffersContent += `    updated_at: new Date().toISOString(),\n`;
        newOffersContent += `    admin_reviewed_at: new Date().toISOString()\n`;
        newOffersContent += `  }${index < updatedOffers.length - 1 ? ',' : ''}\n`;
      });
      
      newOffersContent += '];';
      
      // Replace the old content with the new one
      const updatedCarouselContent = carouselContent.replace(sampleOffersMatch[0], newOffersContent);
      
      // Write back to the file
      fs.writeFileSync(carouselPath, updatedCarouselContent, 'utf8');
      console.log('Successfully updated carousel component with premium offer descriptions!');
    } else {
      console.log('Could not find sample offers in carousel component');
    }
  } else {
    console.log(`Could not find carousel component at ${carouselPath}`);
  }
  
  console.log('Premium description generation complete!');
};

// Run the main function
updateOfferDescriptions()
  .then(() => console.log('All done!'))
  .catch(err => console.error('Error:', err));