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
  selectedClinicIndex?: number;
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

export interface NotificationData {
  quoteData: QuoteData;
  isCalculationOnly: boolean;
}

// Send quote email with PDF attachment
// Function to send email notification when a quote is calculated
export async function sendEmailNotification(notificationData: NotificationData): Promise<boolean> {
  try {
    if (!isMailjetConfigured()) {
      console.warn('Mailjet is not fully configured - email functionality will be limited');
      if (process.env.NODE_ENV === 'production') {
        console.log('Skipping email in production due to missing configuration');
        return false;
      }
    }

    const { quoteData, isCalculationOnly } = notificationData;
    const senderEmail = process.env.MAILJET_SENDER_EMAIL || 'info@istanbuldentalsmile.co.uk';
    // Hardcoding the correct email address to solve the issue
    const recipientEmail = 'rajsingh140186@googlemail.com';

    console.log(`[Notification] Using sender email: ${senderEmail}`);
    console.log(`[Notification] Using recipient email: ${recipientEmail}`);

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

    // Create message object for admin notification
    const adminMessage = {
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
      Subject: `${isCalculationOnly ? 'New Quote Calculation' : 'New Quote Downloaded'}: ${quoteData.patientName || 'Unnamed Patient'} - ${totalPriceFormatted}`,
      HTMLPart: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #00688B; color: white; padding: 15px; text-align: center;">
            <h1 style="margin: 0;">${isCalculationOnly ? 'New Quote Calculation' : 'New Quote Downloaded'}</h1>
            <p style="margin: 5px 0 0 0;">Istanbul Dental Smile</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px;">
            <h2 style="color: #007B9E; margin-top: 0;">Quote Details</h2>
            <p>A customer has ${isCalculationOnly ? 'calculated a dental treatment quote' : 'downloaded a dental treatment quote PDF'} through the website. Details are below:</p>

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
              ${quoteData.selectedClinicIndex !== undefined && quoteData.clinics && quoteData.clinics.length > quoteData.selectedClinicIndex ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Selected Clinic:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #007B9E;"><strong>${quoteData.clinics[quoteData.selectedClinicIndex].name}</strong></td>
              </tr>
              ` : ''}
              ${isCalculationOnly ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Quote Status:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #B2904F;"><strong>Calculated but not yet downloaded</strong></td>
              </tr>
              ` : ''}
            </table>

            <h3 style="color: #007B9E;">Treatments Requested</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
              ${treatmentsList}
            </div>

            ${isCalculationOnly ? `
            <div style="background-color: #B2904F; color: white; padding: 10px; text-align: center; border-radius: 5px; margin-bottom: 20px;">
              <strong>Early Notification!</strong> This customer has calculated a quote but hasn't downloaded it yet - an opportunity for proactive outreach!
            </div>
            ` : `
            <p style="margin-bottom: 8px;">The complete quote PDF is attached to this email.</p>
            `}

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
      `
    };

    // Send the admin email notification
    console.log(`Sending calculation notification to admin email: ${recipientEmail}`);
    console.log(`Patient information: Name: ${quoteData.patientName || 'unnamed'}, Email: ${quoteData.patientEmail || 'no email provided'}`);

    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [adminMessage]
    });

    console.log(`Quote calculation notification sent successfully for ${quoteData.patientName || 'unnamed patient'}`);
    return true;
  } catch (error: any) {
    console.error('Error sending quote calculation notification with Mailjet:', error);

    // Log more details about the error to help diagnose issues
    if (error.response) {
      console.error('Mailjet API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    return false;
  }
}

export async function sendQuoteEmail(emailData: EmailData): Promise<boolean> {
  // We declare return type as Promise<boolean> and ensure all code paths return a boolean
  try {
    if (!isMailjetConfigured()) {
      console.warn('Mailjet is not fully configured - email functionality will be limited');
      if (process.env.NODE_ENV === 'production') {
        console.log('Skipping email in production due to missing configuration');
        return false;
      }
    }

    const { pdfBuffer, quoteData, filename } = emailData;
    const senderEmail = process.env.MAILJET_SENDER_EMAIL || 'info@istanbuldentalsmile.co.uk';
    // Hardcoding the correct email address to solve the issue
    const recipientEmail = 'rajsingh140186@googlemail.com';

    console.log(`Using sender email: ${senderEmail}`);
    console.log(`Using recipient email: ${recipientEmail}`);

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

    // Build treatment list for internal email
    const treatmentsList = quoteData.items.map((item: { 
      treatment: string; 
      quantity: number; 
      priceGBP: number; 
    }) => {
      return `${item.treatment} x${item.quantity} - £${item.priceGBP}`;
    }).join('<br>');

    // Create a more detailed treatment list for patient email
    const patientTreatmentsList = quoteData.items.map((item: { 
      treatment: string; 
      quantity: number; 
      priceGBP: number;
      guarantee: string;
    }) => {
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.treatment}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">£${item.priceGBP.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.guarantee || 'Standard'}</td>
        </tr>
      `;
    }).join('');

    // Create admin message object
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
              ${quoteData.selectedClinicIndex !== undefined && quoteData.clinics && quoteData.clinics.length > quoteData.selectedClinicIndex ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Selected Clinic:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #007B9E;"><strong>${quoteData.clinics[quoteData.selectedClinicIndex].name}</strong></td>
              </tr>
              ` : ''}
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

    // Re-enabling server-side Mailjet emails for customers as they look better
    console.log('Processing patient email:', quoteData.patientEmail || 'none');
    if (quoteData.patientEmail && quoteData.patientEmail.includes('@')) {
      console.log('Valid patient email found, creating customer quote email with Mailjet');
      const patientMessage = {
        From: {
          Email: senderEmail,
          Name: "Istanbul Dental Smile"
        },
        To: [
          {
            Email: quoteData.patientEmail,
            Name: quoteData.patientName || 'Valued Customer'
          }
        ],
        Subject: `Your Dental Treatment Quote from Istanbul Dental Smile`,
        HTMLPart: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #00688B; color: white; padding: 15px; text-align: center;">
              <h1 style="margin: 0;">Your Dental Treatment Quote</h1>
              <p style="margin: 5px 0 0 0;">Thank you for choosing Istanbul Dental Smile</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px;">
              <h2 style="color: #007B9E; margin-top: 0;">Hello ${quoteData.patientName || 'there'},</h2>
              <p>Thank you for your interest in dental treatment with Istanbul Dental Smile. We have prepared a detailed quote based on your requirements.</p>

              <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
                <h3 style="color: #007B9E; margin-top: 0;">Your Selected Treatments</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                  <thead>
                    <tr style="background-color: #f2f2f2;">
                      <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Treatment</th>
                      <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                      <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
                      <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: left;">Guarantee</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${patientTreatmentsList}
                    <tr style="background-color: #f9f9f9; font-weight: bold;">
                      <td style="padding: 8px; border-top: 2px solid #ddd;" colspan="2">Total</td>
                      <td style="padding: 8px; border-top: 2px solid #ddd; text-align: right; color: #007B9E;">${totalPriceFormatted}</td>
                      <td style="padding: 8px; border-top: 2px solid #ddd;"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              ${quoteData.selectedClinicIndex !== undefined && quoteData.clinics && quoteData.clinics.length > quoteData.selectedClinicIndex ? `
              <div style="background-color: #e6f4f7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #007B9E;">
                <h3 style="color: #007B9E; margin-top: 0;">Your Selected Clinic</h3>
                <p style="font-weight: bold; margin-bottom: 5px;">${quoteData.clinics[quoteData.selectedClinicIndex].name}</p>
                <p style="margin-top: 0;">Based on your preferences, we've included information about this clinic in your detailed quote. Your PDF quote shows pricing, extras, and guarantees offered by this clinic.</p>
              </div>
              ` : ''}

              <div style="background-color: #f0f8fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #007B9E; margin-top: 0;">What's Next?</h3>
                <p>Our dental tourism consultant will contact you within 24 hours to discuss your quote and answer any questions you may have.</p>
                <p>We've attached a comprehensive PDF quote to this email that includes more details about:</p>
                <ul>
                  <li>Price comparisons with UK clinics</li>
                  <li>Our partner clinics in Istanbul</li>
                  <li>Treatment process and timelines</li>
                  <li>Accommodation and travel options</li>
                </ul>
              </div>

              <div style="background-color: #B2904F; color: white; padding: 10px; text-align: center; border-radius: 5px;">
                <p style="margin: 5px 0;"><strong>Have Questions?</strong> Reply to this email or call/WhatsApp us at +447572445856</p>
              </div>
            </div>

            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>Istanbul Dental Smile | Your UK-Based Dental Tourism Specialists</p>
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

      // Send separate emails to admin and patient
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [message, patientMessage]
      });
    } else {
      // No valid email address found, only send admin notification
      console.log('No valid customer email found, sending admin notification only');
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [message]
      });
    }

    console.log(`Quote email sent successfully for: ${quoteData.patientName || 'Customer'} to ${quoteData.patientEmail || 'no email'}`);
    return true;
  } catch (error: any) {
    console.error('Error sending quote email with Mailjet:', error);
    // Log more details about the error to help diagnose issues
    if (error.response) {
      console.error('Mailjet API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    // Even if sending to the patient fails, try to send at least to admin as a fallback
    try {
      // Destructure emailData to use in the fallback message
      const { quoteData, filename, pdfBuffer } = emailData;

      // Create a simplified message for the fallback attempt
      const fallbackMessage = {
        From: {
          Email: process.env.MAILJET_SENDER_EMAIL || 'info@istanbuldentalsmile.co.uk',
          Name: "Istanbul Dental Smile"
        },
        To: [
          {
            Email: 'rajsingh140186@googlemail.com',
            Name: "Raj Singh"
          }
        ],
        Subject: `FALLBACK: Quote Generated: ${quoteData.patientName || 'Unnamed Patient'}`,
        HTMLPart: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p>This is a fallback notification. The original email attempt failed.</p>
            <p>Check the server logs for more information.</p>
            <p>Patient: ${quoteData.patientName || 'Unnamed'}</p>
            <p>Email: ${quoteData.patientEmail || 'None provided'}</p>
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

      console.log('Attempting fallback: Sending admin notification only after failure');
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [fallbackMessage]
      });
      console.log('Fallback admin notification sent successfully');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }

    return false;
  }
}