import { Router, Request, Response } from 'express';
import express from 'express';
import { db } from '../../../../db';
import * as schema from "@shared/schema";
import { eq, and, isNotNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Simple middleware for requiring authentication
const isAuthenticated = (req: Request, res: Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

// Shorthand variables for schema tables
const { quotes, quoteLines, specialOffers, notifications } = schema;

// Error handler helper function
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation schema for the request
const createQuoteFromPromoSchema = z.object({
  token: z.string().min(3).max(100),
  visitorEmail: z.string().email().optional(),
});

export const fromPromoRouter = Router();

// Create a quote from a promo token
fromPromoRouter.post('/', catchAsync(async (req: Request, res: Response) => {
  // Validate request data
  const validation = createQuoteFromPromoSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
      errors: validation.error.format(),
    });
  }

  const { token, visitorEmail } = validation.data;

  // First, check if the token exists in the special_offers table
  const [specialOffer] = await db
    .select()
    .from(specialOffers)
    .where(eq(specialOffers.promoToken, token));

  if (!specialOffer) {
    return res.status(404).json({
      success: false,
      message: 'Promotion token not found',
    });
  }

  try {
    // Create a new quote with the promotion token
    const quoteId = uuidv4();
    const timestamp = new Date();
    
    // Insert the quote
    await db.insert(quotes).values({
      id: quoteId,
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
      totalGBP: 0, // Will be calculated later when treatments are added
      totalUSD: 0, // Will be calculated later when treatments are added
      clinicId: specialOffer.clinicId, // Associate with the clinic from the special offer
      patientEmail: visitorEmail || null, // Store the visitor email if provided
      promoToken: token, // Store the promo token used
    });

    // For initial implementation, just create an empty quote
    // Later versions will add default treatments based on the promo type

    // Create a notification about the quote creation if email is provided
    if (visitorEmail) {
      await db.insert(notifications).values({
        id: uuidv4(),
        type: 'quote_created',
        recipientEmail: visitorEmail,
        subject: 'Your Special Offer Quote',
        content: `Your quote has been created with promotion "${specialOffer.title}". You can view it in the patient portal.`,
        status: 'pending',
        createdAt: timestamp,
        metadata: JSON.stringify({
          quoteId,
          promoToken: token,
          offerTitle: specialOffer.title,
        }),
      });
    }

    // Return the quote ID
    return res.status(201).json({
      success: true,
      quoteId,
      message: 'Quote created successfully',
      clinicId: specialOffer.clinicId,
      offerTitle: specialOffer.title,
    });
  } catch (error) {
    console.error('Error creating quote from promo token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create quote from promo token',
    });
  }
}));

// Get quotes created with a specific promo token - admin or clinic only
fromPromoRouter.get('/by-token/:token', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  
  if (!user || (user.role !== 'admin' && user.role !== 'clinic')) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  const { token } = req.params;

  // Get all quotes created with this token
  const quotesWithToken = await db
    .select()
    .from(quotes)
    .where(eq(quotes.promoToken, token))
    .orderBy(quotes.createdAt);

  return res.status(200).json({
    success: true,
    quotes: quotesWithToken,
  });
}));

// Get all quotes created with any promo token - admin only
fromPromoRouter.get('/all', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access',
    });
  }

  // Get all quotes with promo tokens
  const quotesWithTokens = await db
    .select()
    .from(quotes)
    .where(
      and(
        isNotNull(quotes.promoToken) // Only get quotes with non-null promo tokens
      )
    )
    .orderBy(quotes.createdAt);

  return res.status(200).json({
    success: true,
    quotes: quotesWithTokens,
  });
}));

export default fromPromoRouter;