import express, { Request, Response } from 'express';
import { 
  generateImage, 
  generateDentalTreatmentImage, 
  generateSpecialOfferImage,
  isOpenAIConfigured 
} from '../services/openai-service';
import { storage } from '../storage';
import multer from 'multer';
import { isAuthenticated, ensureRole } from '../middleware/auth';
import { upload } from '../file-upload';
import { catchAsync, AppError } from '../middleware/error-handler';
import { getWebSocketService } from '../services/websocketService';

const router = express.Router();

// Get reference to the existing WebSocket service to emit updates
// This doesn't create a new WebSocket server, just gets a reference to the existing one

/**
 * Check if OpenAI API is configured
 * GET /api/openai/status
 */
router.get('/status', (req: Request, res: Response) => {
  const configured = isOpenAIConfigured();
  
  res.json({
    success: true,
    configured,
    message: configured 
      ? 'OpenAI API is properly configured' 
      : 'OpenAI API is not configured. Set the OPENAI_API_KEY environment variable.'
  });
});

/**
 * Generate an image using DALL-E
 * POST /api/openai/generate-image
 */
router.post('/generate-image', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { prompt, size } = req.body;
  
  if (!prompt) {
    throw new AppError('Prompt is required', 400);
  }
  
  if (!isOpenAIConfigured()) {
    throw new AppError('OpenAI API is not configured', 503);
  }
  
  const result = await generateImage(prompt, size);
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * Generate a special offer image and save it to S3
 * POST /api/openai/special-offer-image
 */
router.post('/special-offer-image', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { offerId, offerTitle, offerType } = req.body;
  
  if (!offerId || !offerTitle) {
    throw new AppError('Offer ID and title are required', 400);
  }
  
  if (!isOpenAIConfigured()) {
    throw new AppError('OpenAI API is not configured', 503);
  }
  
  try {
    // Generate image using OpenAI
    console.log(`Generating special offer image for: ${offerTitle} (type: ${offerType || 'premium'})`);
    const result = await generateSpecialOfferImage(offerTitle, offerType);
    
    if (!result.url) {
      throw new AppError('Failed to generate image URL', 500);
    }
    
    // Save the image URL to the database
    const updateResult = await storage.updateSpecialOfferImage(offerId, result.url);
    
    if (!updateResult) {
      throw new AppError('Failed to update special offer image in database', 500);
    }
    
    // Notify clients via WebSocket that the special offer has been updated
    const wss = getWebSocketService();
    if (wss) {
      wss.broadcast(JSON.stringify({
        type: 'special_offer_updated',
        offerId,
        imageUrl: result.url
      }));
    }
    
    res.json({
      success: true,
      data: {
        url: result.url,
        offerId
      }
    });
  } catch (error) {
    console.error('Error generating special offer image:', error);
    throw new AppError(`Failed to generate special offer image: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
}));

/**
 * Generate images for dental treatments
 * POST /api/openai/treatment-image
 */
router.post('/treatment-image', isAuthenticated, catchAsync(async (req: Request, res: Response) => {
  const { treatmentType } = req.body;
  
  if (!treatmentType) {
    throw new AppError('Treatment type is required', 400);
  }
  
  if (!isOpenAIConfigured()) {
    throw new AppError('OpenAI API is not configured', 503);
  }
  
  const result = await generateDentalTreatmentImage(treatmentType);
  
  res.json({
    success: true,
    data: result
  });
}));

export default router;