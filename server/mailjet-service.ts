import MailJet from 'node-mailjet';

// Define or import the QuoteData interface
export interface QuoteData {
  items: Array<{
    treatment: string;
    priceGBP: number;
    priceUSD: number;
    quantity: number;
    subtotalGBP: number;
    subtotalUSD: number;
    guarantee: string;
  }>;
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: Array<{
    name: string;
    priceGBP: number;
    extras?: string;
    location?: string;
    guarantee?: string;
    rating?: string;
  }>;
  hasXrays?: boolean;
  xrayCount?: number;
}

// Initialize Mailjet client
const mailjet = MailJet.apiConnect(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_SECRET_KEY || ''
);

// Function to check if Mailjet is configured
export function isMailjetConfigured(): boolean {
  return !!(
    process.env.MAILJET_API_KEY &&
    process.env.MAILJET_SECRET_KEY &&
    process.env.MAILJET_SENDER_EMAIL &&
    process.env.MAILJET_RECIPIENT_EMAIL
  );
}

// Interface for email data
export interface EmailData {
  pdfBuffer: Buffer;
  quoteData: QuoteData;
  filename: string;
}

// Send quote email with PDF attachment
export async function sendQuoteEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!isMailjetConfigured()) {
      console.error('Mailjet is not configured. Check environment variables.');
      return false;
    }

    const { pdfBuffer, quoteData, filename } = emailData;
    const senderEmail = process.env.MAILJET_SENDER_EMAIL || '';
    const recipientEmail = process.env.MAILJET_RECIPIENT_EMAIL || '';
    
    // Format date
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate total price
    const totalPrice = quoteData.totalGBP;
    const totalPriceFormatted = new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(totalPrice);

    // Build treatment list
    const treatmentsList = quoteData.items.map((item: { 
      treatment: string; 
      quantity: number; 
      priceGBP: number; 
    }) => {
      return `${item.treatment} x${item.quantity} - £${item.priceGBP}`;
    }).join('<br>');

    // Create message object
    const message = {
      From: {
        Email: senderEmail,
        Name: "Istanbul Dental Smile"
      },
      To: [
        {
          Email: recipientEmail,
          Name: "Raj Singh"
        }
      ],
      Subject: `New Quote Generated: ${quoteData.patientName || 'Unnamed Patient'} - ${totalPriceFormatted}`,
      HTMLPart: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00688B; color: white; padding: 15px; text-align: center;">
            <h1 style="margin: 0;">New Quote Generated</h1>
            <p style="margin: 5px 0 0 0;">Istanbul Dental Smile</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px;">
            <h2 style="color: #007B9E; margin-top: 0;">Quote Details</h2>
            <p>A new dental treatment quote has been generated through the website. Details are below:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 40%;"><strong>Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Patient Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quoteData.patientName || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quoteData.patientEmail || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quoteData.patientPhone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Travel Month:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quoteData.travelMonth || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Departure City:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quoteData.departureCity || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Quote Value:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #007B9E;">${totalPriceFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>X-rays Uploaded:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quoteData.hasXrays ? `Yes (${quoteData.xrayCount} files)` : 'No'}</td>
              </tr>
            </table>
            
            <h3 style="color: #007B9E;">Treatments Requested</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
              ${treatmentsList}
            </div>
            
            <p style="margin-bottom: 8px;">The complete quote PDF is attached to this email.</p>
            <p style="margin-bottom: 20px;">Please contact the patient as soon as possible to follow up on this quote.</p>
            
            <div style="background-color: #B2904F; color: white; padding: 10px; text-align: center; border-radius: 5px;">
              <strong>Next Steps:</strong> Send WhatsApp follow-up or call the patient within 24 hours.
            </div>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated notification from the Istanbul Dental Smile website.</p>
            <p style="margin-bottom: 0;">istanbuldentalsmile.co.uk | info@istanbuldentalsmile.co.uk</p>
          </div>
        </div>
      `,
      Attachments: [
        {
          ContentType: 'application/pdf',
          Filename: filename,
          Base64Content: pdfBuffer.toString('base64')
        }
      ]
    };

    // Send the email using Mailjet
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [message]
    });

    console.log(`Quote email sent successfully for ${quoteData.patientName || 'unnamed patient'}`);
    return true;
  } catch (error) {
    console.error('Error sending quote email with Mailjet:', error);
    return false;
  }
}