import express from 'express';
import { generatePdf } from 'html-pdf-node';
import { readFileSync } from 'fs';
import path from 'path';

const quoteDetailsRouter = express.Router();

// Sample data for demo purposes
const sampleQuotes = [
  {
    id: "quote-123",
    status: "submitted",
    createdAt: "2025-05-10T12:30:00Z",
    patientName: "John Smith",
    patientEmail: "john@example.com",
    patientPhone: "+44 7123 456789",
    clinicId: "clinic-001",
    clinicName: "DentSpa Istanbul",
    totalAmount: 1750,
    discountAmount: 175,
    promoCode: "WELCOME10",
    promoDescription: "10% off your first treatment",
    treatments: [
      {
        id: "tr-001",
        name: "Dental Implant",
        price: 650,
        quantity: 2,
        description: "Premium quality implant with lifetime guarantee"
      },
      {
        id: "tr-002",
        name: "Porcelain Crown",
        price: 300,
        quantity: 1,
        description: "Natural-looking porcelain crown"
      },
      {
        id: "tr-003",
        name: "Teeth Whitening",
        price: 200,
        quantity: 1,
        description: "Professional grade whitening treatment"
      }
    ],
    packageDetails: {
      id: "pkg-001",
      name: "Premium Implant Package",
      price: 1500,
      description: "Complete implant package with crown and whitening"
    },
    notes: "Patient prefers morning appointments. Requires special care for sensitive gums."
  },
  {
    id: "quote-456",
    status: "accepted",
    createdAt: "2025-05-08T10:15:00Z",
    patientName: "Sarah Wilson",
    patientEmail: "sarah@example.com",
    patientPhone: "+44 7234 567890",
    clinicId: "clinic-002",
    clinicName: "Istanbul Dental Center",
    totalAmount: 2500,
    discountAmount: 500,
    promoCode: "SUMMER20",
    promoDescription: "20% off summer special",
    treatments: [
      {
        id: "tr-004",
        name: "Full Mouth Reconstruction",
        price: 2500,
        quantity: 1,
        description: "Comprehensive reconstruction for optimal oral health"
      }
    ]
  },
  {
    id: "quote-789",
    status: "draft",
    createdAt: "2025-05-15T15:45:00Z",
    patientName: "Emma Johnson",
    patientEmail: "emma@example.com",
    patientPhone: "+44 7345 678901",
    clinicId: "clinic-003",
    clinicName: "Maltepe Dental Clinic",
    totalAmount: 900,
    discountAmount: 0,
    treatments: [
      {
        id: "tr-005",
        name: "Porcelain Veneers",
        price: 450,
        quantity: 2,
        description: "Premium porcelain veneers for front teeth"
      }
    ]
  }
];

// GET a specific quote by ID
quoteDetailsRouter.get('/api/patient/quotes/:id', (req, res) => {
  const quoteId = req.params.id;
  const quote = sampleQuotes.find(q => q.id === quoteId);
  
  if (!quote) {
    return res.status(404).json({
      success: false,
      message: "Quote not found"
    });
  }
  
  return res.json({
    success: true,
    quote
  });
});

// GET all quotes for display in the patient portal
quoteDetailsRouter.get('/api/patient/quotes', (req, res) => {
  return res.json({
    success: true,
    quotes: sampleQuotes
  });
});

// For backward compatibility with existing endpoints
quoteDetailsRouter.get('/api/quotes/:id', (req, res) => {
  const quoteId = req.params.id;
  const quote = sampleQuotes.find(q => q.id === quoteId);
  
  if (!quote) {
    return res.status(404).json({
      success: false,
      message: "Quote not found"
    });
  }
  
  return res.json({
    success: true,
    quote
  });
});

// Generate a PDF for the quote
quoteDetailsRouter.get('/api/quotes/:id/pdf', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const quote = sampleQuotes.find(q => q.id === quoteId);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found"
      });
    }
    
    // Simple HTML template for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dental Treatment Quote</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-width: 200px; margin-bottom: 10px; }
          h1 { color: #2563eb; margin-bottom: 5px; }
          .quote-info { margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .section-title { border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f3f4f6; }
          .price { text-align: right; }
          .total { font-weight: bold; }
          .promo-box { background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dental Treatment Quote</h1>
          <p>Quote #${quote.id} - ${new Date(quote.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div class="quote-info">
          <div class="section">
            <h2 class="section-title">Patient Information</h2>
            <p><strong>Name:</strong> ${quote.patientName}</p>
            <p><strong>Email:</strong> ${quote.patientEmail}</p>
            <p><strong>Phone:</strong> ${quote.patientPhone}</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Clinic Information</h2>
            <p><strong>Clinic:</strong> ${quote.clinicName}</p>
          </div>
          
          ${quote.promoCode ? `
          <div class="promo-box">
            <h3>Promotion Applied: ${quote.promoCode}</h3>
            <p>${quote.promoDescription || ''}</p>
            <p><strong>Discount Amount:</strong> £${quote.discountAmount.toFixed(2)}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <h2 class="section-title">Treatment Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Treatment</th>
                  <th>Quantity</th>
                  <th class="price">Price</th>
                </tr>
              </thead>
              <tbody>
                ${quote.treatments.map(treatment => `
                <tr>
                  <td>
                    <strong>${treatment.name}</strong>
                    ${treatment.description ? `<br><span style="font-size: 12px;">${treatment.description}</span>` : ''}
                  </td>
                  <td>${treatment.quantity}</td>
                  <td class="price">£${treatment.price.toFixed(2)}</td>
                </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="total">Total</td>
                  <td class="price total">£${quote.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          ${quote.notes ? `
          <div class="section">
            <h2 class="section-title">Additional Notes</h2>
            <p>${quote.notes}</p>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>This quote is valid for 30 days from the date of issue.</p>
          <p>MyDentalFly - Your Trusted Dental Tourism Partner</p>
        </div>
      </body>
      </html>
    `;
    
    // Generate PDF from HTML
    const options = { format: 'A4' };
    const file = { content: htmlContent };
    
    const pdfBuffer = await generatePdf(file, options);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${quoteId}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF"
    });
  }
});

export default quoteDetailsRouter;