import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for quotes
const quotes = new Map<string, any>();

// Debug endpoint to save quote data
router.post('/api/standalone-quote/save', (req, res) => {
  try {
    console.log('Received quote save request with data:', JSON.stringify(req.body, null, 2));
    
    // Generate a unique ID for the quote
    const quoteId = uuidv4();
    
    // Store the quote with timestamp
    const storedQuote = {
      id: quoteId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    quotes.set(quoteId, storedQuote);
    
    console.log(`Quote saved with ID: ${quoteId}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      id: quoteId,
      message: 'Quote saved successfully'
    });
  } catch (error) {
    console.error('Error saving quote:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to save quote: ${error.message}`
    });
  }
});

// Debug endpoint to email quote
router.post('/api/standalone-quote/email', (req, res) => {
  try {
    const { quoteId, email } = req.body;
    
    console.log(`Email request received for quote ${quoteId} to ${email}`);
    
    // Check if quote exists
    if (!quotes.has(quoteId)) {
      console.log(`Quote ${quoteId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // In a production environment, this would send an actual email
    console.log(`Would send email to ${email} with quote ${quoteId}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: `Email would be sent to ${email} with quote ${quoteId}`
    });
  } catch (error) {
    console.error('Error emailing quote:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to email quote: ${error.message}`
    });
  }
});

// Debug endpoint to retrieve a saved quote
router.get('/api/standalone-quote/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if quote exists
    if (!quotes.has(id)) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // Return the quote
    return res.status(200).json({
      success: true,
      quote: quotes.get(id)
    });
  } catch (error) {
    console.error('Error retrieving quote:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve quote: ${error.message}`
    });
  }
});

export default router;