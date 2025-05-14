import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for validation
const quoteIdSchema = z.number().or(z.string().transform(val => parseInt(val, 10)));
const emailSchema = z.object({
  email: z.string().email().optional()
});

// Get quote by ID
router.get('/:id', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const quote = await storage.getQuote(quoteId);
    
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    
    res.json({ success: true, quote });
  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(400).json({ success: false, message: 'Invalid quote ID' });
  }
});

// Create a new quote
router.post('/', async (req, res) => {
  try {
    const quote = await storage.createQuote(req.body);
    res.status(201).json({ success: true, quote });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ success: false, message: 'Failed to create quote' });
  }
});

// Update a quote
router.patch('/:id', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const updatedQuote = await storage.updateQuote(quoteId, req.body);
    
    if (!updatedQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    
    res.json({ success: true, quote: updatedQuote });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
});

// Delete a quote
router.delete('/:id', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const success = await storage.deleteQuote(quoteId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    
    res.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(400).json({ success: false, message: 'Invalid quote ID' });
  }
});

// Apply a promo code to a quote
router.post('/:id/apply-promo', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const { promoCode } = req.body;
    
    if (!promoCode) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }
    
    const updatedQuote = await storage.applyPromoCode(quoteId, promoCode);
    
    if (!updatedQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found or invalid promo code' });
    }
    
    res.json({ success: true, quote: updatedQuote });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
});

// Remove a promo code from a quote
router.post('/:id/remove-promo', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const updatedQuote = await storage.removePromoCode(quoteId);
    
    if (!updatedQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    
    res.json({ success: true, quote: updatedQuote });
  } catch (error) {
    console.error('Error removing promo code:', error);
    res.status(400).json({ success: false, message: 'Invalid quote ID' });
  }
});

// Apply a special offer to a quote
router.post('/:id/apply-offer', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const { offerId } = req.body;
    
    if (!offerId) {
      return res.status(400).json({ success: false, message: 'Offer ID is required' });
    }
    
    const updatedQuote = await storage.applySpecialOffer(quoteId, offerId);
    
    if (!updatedQuote) {
      return res.status(404).json({ success: false, message: 'Quote not found or invalid offer ID' });
    }
    
    res.json({ success: true, quote: updatedQuote });
  } catch (error) {
    console.error('Error applying special offer:', error);
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
});

// Send quote confirmation email
router.post('/:id/send-confirmation', async (req, res) => {
  try {
    const quoteId = quoteIdSchema.parse(req.params.id);
    const { email } = emailSchema.parse(req.body);
    
    // Get the quote
    const quote = await storage.getQuote(quoteId);
    
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    
    // Determine recipient email, either from request or from user if authenticated
    const recipientEmail = email || (req.user?.email) || null;
    
    if (!recipientEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required. Either provide it in the request or log in.' 
      });
    }

    // For this implementation, we'll mock sending an email
    // In a real implementation, we would use mailjet or another email service
    console.log(`[MOCK] Sending quote confirmation email to ${recipientEmail} for quote ${quoteId}`);
    
    // Log email content for debugging
    console.log(`[MOCK] Email subject: Your MyDentalFly Quote #${quoteId}`);
    console.log(`[MOCK] Email contains quote details for ${quote.id}`);
    
    // Update quote to mark as emailed (mock)
    await storage.updateQuote(quoteId, { emailSent: true });
    
    res.json({ 
      success: true, 
      message: 'Quote confirmation email sent successfully',
      recipientEmail
    });
  } catch (error) {
    console.error('Error sending quote confirmation email:', error);
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
});

// Helper function to generate HTML email content
function generateQuoteEmailHtml(quote: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your MyDentalFly Quote</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 200px; }
        h1 { color: #4361ee; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://mydentalfly.com/logo.png" alt="MyDentalFly Logo" class="logo">
          <h1>Your Dental Quote</h1>
        </div>
        
        <div class="section">
          <p>Thank you for choosing MyDentalFly for your dental needs. Below is a summary of your quote:</p>
        </div>
        
        <div class="section">
          <h2>Quote Summary</h2>
          <table>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
            ${quote.treatments?.map((treatment: any) => `
              <tr>
                <td>${treatment.name}</td>
                <td>${treatment.description}</td>
                <td>$${treatment.price.toFixed(2)}</td>
              </tr>
            `).join('') || ''}
            
            ${quote.packages?.map((pkg: any) => `
              <tr>
                <td>${pkg.name}</td>
                <td>${pkg.description}</td>
                <td>$${pkg.price.toFixed(2)}</td>
              </tr>
            `).join('') || ''}
            
            ${quote.addons?.map((addon: any) => `
              <tr>
                <td>${addon.name}</td>
                <td>${addon.description}</td>
                <td>$${addon.price.toFixed(2)}</td>
              </tr>
            `).join('') || ''}
            
            <tr>
              <td colspan="2">Subtotal</td>
              <td>$${quote.subtotal.toFixed(2)}</td>
            </tr>
            
            ${quote.discount > 0 ? `
              <tr>
                <td colspan="2">Discount</td>
                <td>-$${quote.discount.toFixed(2)}</td>
              </tr>
            ` : ''}
            
            <tr class="total-row">
              <td colspan="2">Total</td>
              <td>$${quote.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        ${quote.promoCode ? `
          <div class="section">
            <p>Promo Code Applied: <strong>${quote.promoCode}</strong></p>
          </div>
        ` : ''}
        
        <div class="section">
          <p>This quote is valid for 30 days. To proceed with your treatment or if you have any questions, please contact us.</p>
          <p>You can view your quote online at: <a href="https://mydentalfly.com/quotes/${quote.id}">https://mydentalfly.com/quotes/${quote.id}</a></p>
        </div>
        
        <div class="footer">
          <p>MyDentalFly - Your Gateway to Premium Dental Care</p>
          <p>© ${new Date().getFullYear()} MyDentalFly. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to generate plain text email content
function generateQuoteEmailText(quote: any): string {
  let text = `
YOUR MYDENTALFLY QUOTE

Thank you for choosing MyDentalFly for your dental needs. Below is a summary of your quote:

QUOTE SUMMARY:
`;

  // Add treatments
  if (quote.treatments && quote.treatments.length > 0) {
    text += `\nTREATMENTS:\n`;
    quote.treatments.forEach((treatment: any) => {
      text += `${treatment.name} - $${treatment.price.toFixed(2)}\n`;
    });
  }

  // Add packages
  if (quote.packages && quote.packages.length > 0) {
    text += `\nPACKAGES:\n`;
    quote.packages.forEach((pkg: any) => {
      text += `${pkg.name} - $${pkg.price.toFixed(2)}\n`;
    });
  }

  // Add addons
  if (quote.addons && quote.addons.length > 0) {
    text += `\nADD-ONS:\n`;
    quote.addons.forEach((addon: any) => {
      text += `${addon.name} - $${addon.price.toFixed(2)}\n`;
    });
  }

  // Add summary
  text += `
Subtotal: $${quote.subtotal.toFixed(2)}`;

  if (quote.discount > 0) {
    text += `
Discount: -$${quote.discount.toFixed(2)}`;
  }

  text += `
TOTAL: $${quote.total.toFixed(2)}

`;

  // Add promo code if applicable
  if (quote.promoCode) {
    text += `Promo Code Applied: ${quote.promoCode}\n\n`;
  }

  // Add footer
  text += `
This quote is valid for 30 days. To proceed with your treatment or if you have any questions, please contact us.

You can view your quote online at: https://mydentalfly.com/quotes/${quote.id}

MyDentalFly - Your Gateway to Premium Dental Care
© ${new Date().getFullYear()} MyDentalFly. All rights reserved.
`;

  return text;
}

export default router;