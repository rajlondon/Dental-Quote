import { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as htmlPdf from 'html-pdf-node';

// Define the TreatmentItem interface on the server side
interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee?: string;
  clinicVariant?: {
    name: string;
    description: string;
    priceGBP: number;
  };
}

interface GenerateQuoteRequest {
  clinicId: string;
  clinicName: string;
  treatments: TreatmentItem[];
  totalPrice: number;
  patientDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

interface BookConsultationRequest {
  clinicId: string;
  patientDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export function registerClinicRoutes(app: Express): void {
  // Generate a clinic-specific quote PDF
  app.post('/api/generate-clinic-quote', async (req: Request, res: Response) => {
    try {
      const { clinicId, clinicName, treatments, totalPrice, patientDetails } = req.body as GenerateQuoteRequest;
      
      if (!clinicId || !clinicName || !treatments || !patientDetails) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Generate a simple HTML template for the quote
      const quoteHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Dental Treatment Quote - ${clinicName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              color: #333; 
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 10px; 
              border-bottom: 2px solid #0077cc; 
            }
            .clinic-name { 
              font-size: 26px; 
              color: #0077cc; 
              margin-bottom: 10px;
              font-weight: bold;
            }
            .patient-info { 
              margin-bottom: 20px; 
              padding: 15px; 
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border-bottom: 1px solid #ddd; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #ddd;
            }
            .notes {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
              font-size: 14px;
            }
            .logo {
              max-width: 200px;
              margin-bottom: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 14px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://www.mydentalfly.com/logo.png" alt="MyDentalFly Logo" class="logo" />
              <div class="clinic-name">${clinicName}</div>
              <div>Treatment Quote</div>
              <div>Generated on ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="patient-info">
              <h3>Patient Information</h3>
              <p><strong>Name:</strong> ${patientDetails.name}</p>
              <p><strong>Email:</strong> ${patientDetails.email}</p>
              <p><strong>Phone:</strong> ${patientDetails.phone}</p>
            </div>
            
            <h3>Recommended Treatments</h3>
            <table>
              <thead>
                <tr>
                  <th>Treatment</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price (£)</th>
                  <th>Subtotal (£)</th>
                </tr>
              </thead>
              <tbody>
                ${treatments.map(t => `
                  <tr>
                    <td>${t.clinicVariant?.name || t.name}</td>
                    <td>${t.clinicVariant?.description || 'Standard treatment'}</td>
                    <td>${t.quantity}</td>
                    <td>£${((t.clinicVariant?.priceGBP || t.priceGBP) || 0).toFixed(2)}</td>
                    <td>£${((t.clinicVariant?.priceGBP || t.priceGBP) * t.quantity || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4">Total</td>
                  <td>£${totalPrice.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="notes">
              <h3>Important Notes</h3>
              <ul>
                <li>This quote is valid for 30 days from the date of issue.</li>
                <li>A £200 deposit is required to secure your appointment, which will be deducted from your final treatment cost.</li>
                <li>The deposit is fully refundable if canceled 14+ days before your appointment.</li>
                <li>Prices may be subject to change after clinical examination.</li>
                <li>This quote doesn't include accommodation or travel arrangements.</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>MyDentalFly.com | UK: +44 7572 445856 | Turkey: +90 552 622 1123</p>
              <p>Email: info@mydentalfly.com | Website: www.mydentalfly.com</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Options for PDF generation
      const options = {
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      };
      
      // Generate PDF
      const file = { content: quoteHtml };
      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save PDF to file
      const filename = `${clinicId}_quote_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, pdfBuffer);
      
      // Send success response with PDF URL
      res.status(200).json({
        success: true,
        filename,
        url: `/api/quotes/${filename}`
      });
    } catch (error) {
      console.error('Error generating quote PDF:', error);
      res.status(500).json({ error: 'Failed to generate quote PDF' });
    }
  });
  
  // Endpoint to serve PDF files
  app.get('/api/quotes/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
      res.contentType('application/pdf');
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'PDF not found' });
    }
  });
  
  // Book a consultation with a clinic
  app.post('/api/book-consultation', (req: Request, res: Response) => {
    try {
      const { clinicId, patientDetails } = req.body as BookConsultationRequest;
      
      if (!clinicId || !patientDetails) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // In a real app, this would create a consultation record in the database
      // and potentially integrate with a calendar service
      
      // Mock consultation details
      const consultationDate = new Date();
      consultationDate.setDate(consultationDate.getDate() + 2); // 2 days from now
      
      // Format to a readable date/time string
      const formattedDateTime = consultationDate.toLocaleString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const consultation = {
        consultationId: `consult_${Date.now()}`,
        clinicId,
        patientName: patientDetails.name,
        dateTime: formattedDateTime,
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      };
      
      res.status(200).json({
        success: true,
        consultation
      });
    } catch (error) {
      console.error('Error booking consultation:', error);
      res.status(500).json({ error: 'Failed to book consultation' });
    }
  });
}