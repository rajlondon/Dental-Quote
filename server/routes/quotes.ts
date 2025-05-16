import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage for quotes since this is a demo
const quotes = new Map<string, any>();

// Schema for quote data validation
const QuoteDataSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(['treatment', 'package']),
      id: z.string(),
      name: z.string(),
      price: z.number(),
      description: z.string().optional(),
      quantity: z.number().optional(),
    })
  ).optional(),
  promoCode: z.string().nullable().optional(),
  promoDiscount: z.number().optional(),
  appliedOffer: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number(),
  }).nullable().optional(),
  total: z.number(),
  subtotal: z.number(),
  savings: z.number(),
});

// Save quote endpoint
router.post('/save', async (req: Request, res: Response) => {
  try {
    const quoteData = req.body;
    
    // Validate the quote data
    const validationResult = QuoteDataSchema.safeParse(quoteData);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid quote data', 
        errors: validationResult.error.errors 
      });
    }
    
    // Generate a unique ID for the quote
    const quoteId = uuidv4();
    
    // Store the quote with timestamp
    const storedQuote = {
      id: quoteId,
      ...quoteData,
      createdAt: new Date().toISOString(),
      userId: req.user?.id || null,
    };
    
    quotes.set(quoteId, storedQuote);
    
    console.log(`Quote saved with ID: ${quoteId}`);
    
    // Return the quote ID
    return res.status(201).json({ 
      success: true, 
      id: quoteId, 
      message: 'Quote saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving quote:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to save quote: ${error.message}` 
    });
  }
});

// Get quote by ID endpoint
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the quote exists
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
  } catch (error: any) {
    console.error('Error retrieving quote:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to retrieve quote: ${error.message}` 
    });
  }
});

// Email quote endpoint
router.post('/email', async (req: Request, res: Response) => {
  try {
    const { quoteId, email } = req.body;
    
    // Validate the request
    if (!quoteId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quote ID and email are required' 
      });
    }
    
    // Check if the quote exists
    if (!quotes.has(quoteId)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quote not found' 
      });
    }
    
    // In a real application, you would send an email here
    console.log(`Email request received for quote ${quoteId} to ${email}`);
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Quote email request received' 
    });
  } catch (error: any) {
    console.error('Error emailing quote:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to email quote: ${error.message}` 
    });
  }
});

export default router;