import express from 'express';
import { storage } from '../storage';
import fs from 'fs';
import path from 'path';
import pdf from 'html-pdf-node';

// Create a router for our enhanced quote details with promo code handling
const quoteDetailsRouter = express.Router();

/**
 * Get specific quote details including promo codes
 * This route fetches a quote with complete promo code information
 */
quoteDetailsRouter.get('/patient/quotes/:id', async (req, res) => {
  try {
    const quoteId = req.params.id;
    
    // Get the quote from storage or mock data for testing
    const quote = await getMockQuoteWithPromo(quoteId);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    return res.json({
      success: true,
      quote
    });
  } catch (error) {
    console.error('Error fetching quote details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quote details'
    });
  }
});

/**
 * Download quote as PDF
 */
quoteDetailsRouter.get('/quotes/:id/pdf', async (req, res) => {
  try {
    const quoteId = req.params.id;
    
    // Get the quote from storage
    const quote = await getMockQuoteWithPromo(quoteId);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // Generate PDF from HTML template
    const htmlContent = generateQuoteHtml(quote);
    
    const options = { 
      format: 'A4',
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    };
    
    const file = { content: htmlContent };
    
    const pdfBuffer = await pdf.generatePdf(file, options);
    
    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${quoteId}.pdf"`);
    
    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating quote PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quote PDF'
    });
  }
});

/**
 * Get mock quote with promo code data for testing
 */
async function getMockQuoteWithPromo(quoteId: string) {
  // In a real app, this would fetch from the database
  const mockQuotes = [
    {
      id: 'quote-1',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      patientName: 'John Smith',
      patientEmail: 'john.smith@example.com',
      patientPhone: '+1 555-123-4567',
      totalAmount: 2850,
      discountAmount: 570,  // 20% off
      promoCode: 'SUMMER20',
      promoDescription: 'Summer Special: 20% discount on all treatments',
      clinicId: 'clinic-1',
      clinicName: 'Istanbul Dental Excellence',
      treatments: [
        {
          id: 'treatment-1',
          name: 'Dental Implant',
          price: 1200,
          quantity: 2,
          description: 'Premium titanium dental implant with abutment'
        },
        {
          id: 'treatment-2',
          name: 'Porcelain Crown',
          price: 450,
          quantity: 1,
          description: 'High-quality porcelain crown'
        }
      ],
      notes: 'Patient prefers to schedule the procedure in August.'
    },
    {
      id: 'quote-2',
      status: 'accepted',
      createdAt: new Date().toISOString(),
      patientName: 'Emma Johnson',
      patientEmail: 'emma.johnson@example.com',
      patientPhone: '+1 555-987-6543',
      totalAmount: 1995,
      discountAmount: 599,  // Special package deal
      promoCode: 'IMPLANTCROWN30',
      promoDescription: 'Premium Implant Package: 30% off implant and crown combo',
      clinicId: 'clinic-2',
      clinicName: 'Maltepe Dental Center',
      treatments: [
        {
          id: 'treatment-3',
          name: 'Dental Implant',
          price: 1200,
          quantity: 1,
          description: 'Premium titanium dental implant with abutment'
        },
        {
          id: 'treatment-4',
          name: 'Porcelain Crown',
          price: 450,
          quantity: 1,
          description: 'High-quality porcelain crown'
        },
        {
          id: 'treatment-5',
          name: 'Panoramic X-Ray',
          price: 95,
          quantity: 1,
          description: 'Full mouth panoramic x-ray'
        }
      ],
      packageDetails: {
        id: 'pkg-001',
        name: 'Premium Implant Package',
        price: 1995,
        description: 'Complete implant treatment package including surgery, crown, and all necessary scans'
      },
      additionalServices: [
        {
          id: 'service-1',
          name: 'Airport Transfer',
          price: 0,
          description: 'Complimentary airport pickup and drop-off'
        }
      ],
      notes: 'Patient has requested information about hotel accommodations near the clinic.'
    },
    {
      id: 'quote-3',
      status: 'draft',
      createdAt: new Date().toISOString(),
      patientName: 'Robert Williams',
      patientEmail: 'robert.williams@example.com',
      patientPhone: '+1 555-456-7890',
      totalAmount: 3275,
      discountAmount: 0,
      clinicId: 'clinic-3',
      clinicName: 'DentSpa Istanbul',
      treatments: [
        {
          id: 'treatment-6',
          name: 'Full Dental Checkup',
          price: 125,
          quantity: 1,
          description: 'Comprehensive dental examination'
        },
        {
          id: 'treatment-7',
          name: 'Professional Cleaning',
          price: 150,
          quantity: 1,
          description: 'Deep cleaning and plaque removal'
        },
        {
          id: 'treatment-8',
          name: 'Dental Veneers',
          price: 600,
          quantity: 5,
          description: 'Porcelain veneers for front teeth'
        }
      ],
      notes: 'Patient is interested in whitening options as well.'
    }
  ];

  return mockQuotes.find(quote => quote.id === quoteId);
}

/**
 * Generate HTML for quote PDF
 */
function generateQuoteHtml(quote: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dental Treatment Quote</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin-bottom: 5px; }
        .info-section { margin-bottom: 20px; }
        .info-container { display: flex; justify-content: space-between; }
        .info-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; width: 30%; }
        h2 { color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8fafc; }
        .total-row { font-weight: bold; }
        .discount { color: #16a34a; }
        .promo-box { background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MyDentalFly</h1>
        <p>Your Dental Tourism Partner</p>
      </div>
      
      <h2>Treatment Quote #${quote.id}</h2>
      
      <div class="info-container">
        <div class="info-box">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${quote.patientName}</p>
          <p><strong>Email:</strong> ${quote.patientEmail}</p>
          <p><strong>Phone:</strong> ${quote.patientPhone}</p>
        </div>
        
        <div class="info-box">
          <h3>Clinic Information</h3>
          <p><strong>Name:</strong> ${quote.clinicName || 'Not assigned'}</p>
          <p><strong>ID:</strong> ${quote.clinicId || 'Not assigned'}</p>
        </div>
        
        <div class="info-box">
          <h3>Quote Details</h3>
          <p><strong>Date:</strong> ${new Date(quote.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</p>
        </div>
      </div>
      
      ${quote.promoCode ? `
        <div class="promo-box">
          <h3>Promotion Applied</h3>
          <p><strong>Code:</strong> ${quote.promoCode}</p>
          <p><strong>Description:</strong> ${quote.promoDescription || 'Special discount'}</p>
          <p><strong>You Save:</strong> $${quote.discountAmount.toFixed(2)}</p>
        </div>
      ` : ''}
      
      <h3>Selected Treatments</h3>
      <table>
        <thead>
          <tr>
            <th>Treatment</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${quote.treatments.map(treatment => `
            <tr>
              <td>${treatment.name}</td>
              <td>${treatment.description || ''}</td>
              <td>${treatment.quantity}</td>
              <td>$${treatment.price.toFixed(2)}</td>
              <td>$${(treatment.price * treatment.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
          
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">Subtotal:</td>
            <td>$${(quote.totalAmount + (quote.discountAmount || 0)).toFixed(2)}</td>
          </tr>
          
          ${quote.discountAmount ? `
            <tr class="discount">
              <td colspan="4" style="text-align: right;">Discount:</td>
              <td>-$${quote.discountAmount.toFixed(2)}</td>
            </tr>
          ` : ''}
          
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">Total:</td>
            <td>$${quote.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      ${quote.notes ? `
        <h3>Notes</h3>
        <p>${quote.notes}</p>
      ` : ''}
      
      <div class="footer">
        <p>This quote is valid for 30 days from the issue date.</p>
        <p>MyDentalFly - Connecting patients with quality dental care worldwide</p>
      </div>
    </body>
    </html>
  `;
}

export default quoteDetailsRouter;