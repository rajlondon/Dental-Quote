/**
 * Test script for promotional offer clinic filtering
 * This script demonstrates how to navigate directly to the results page
 * with a promotional code to filter the results to a specific clinic
 */
import express from 'express';
const app = express();
const port = 3001;

// A mock database of promotion codes to test with
const promoTokens = [
  {
    id: 'DENTSPA20',
    clinicId: 'dentspa',
    description: 'DentSpa 20% off special offer'
  },
  {
    id: 'BEYAZ250',
    clinicId: 'beyazada',
    description: 'Beyaz Ada £250 discount offer'
  },
  {
    id: 'MALTEPE15',
    clinicId: 'maltepe',
    description: 'Maltepe 15% discount + Spa package'
  }
];

// Create a simple Express web server to display the test links
app.get('/', (req, res) => {
  const mainUrl = process.env.REPLIT_URL || 'http://localhost:5000';
  
  let html = `
    <html>
      <head>
        <title>Promotional Code Test Links</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
          h1 { color: #2563eb; }
          .card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
          .link { display: block; margin: 10px 0; padding: 10px; background: #e0f2fe; text-decoration: none; color: #0369a1; border-radius: 5px; }
          .link:hover { background: #bae6fd; }
          .desc { color: #555; margin-bottom: 10px; }
          h2 { color: #0c4a6e; margin-top: 25px; }
        </style>
      </head>
      <body>
        <h1>Test Promotional Code Filtering</h1>
        <p>Click on any of the links below to test the filtering feature with different promotional codes:</p>
  `;
  
  // Create a test quote URL with treatments
  const baseUrl = `${mainUrl}/matched-clinics?source=promo_token`;
  const treatmentParams = '&treatmentItems=' + encodeURIComponent(JSON.stringify([
    { id: "dental_implant_standard", name: "Dental Implant", quantity: 2, priceGBP: 1800, subtotalGBP: 3600, category: "Implants" },
    { id: "dental_crown", name: "Dental Crown", quantity: 2, priceGBP: 600, subtotalGBP: 1200, category: "Cosmetic" },
    { id: "teeth_whitening", name: "Teeth Whitening", quantity: 1, priceGBP: 350, subtotalGBP: 350, category: "Cosmetic" }
  ]));
  
  // Generate a link for each promo code
  promoTokens.forEach(promo => {
    const promoLink = `${baseUrl}&clinicId=${promo.clinicId}&promoToken=${promo.id}${treatmentParams}`;
    
    html += `
      <div class="card">
        <h3>${promo.id}</h3>
        <div class="desc">${promo.description}</div>
        <div>Clinic ID: <strong>${promo.clinicId}</strong></div>
        <a class="link" href="${promoLink}" target="_blank">
          Test with this promo code →
        </a>
      </div>
    `;
  });
  
  // Add a control link without promo code
  html += `
    <h2>Control Test (No Promo)</h2>
    <div class="card">
      <h3>Standard Comparison View</h3>
      <div class="desc">Test the regular view with all clinics displayed</div>
      <a class="link" href="${baseUrl}${treatmentParams}" target="_blank">
        Test without promo code →
      </a>
    </div>
  `;
  
  html += `
      </body>
    </html>
  `;
  
  res.send(html);
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log('Open this URL to see the test links for promotional code filtering');
});