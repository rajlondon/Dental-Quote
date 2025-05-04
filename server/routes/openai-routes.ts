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
    
    let imageUrl = '';
    
    try {
      // First try to generate with OpenAI
      const result = await generateSpecialOfferImage(offerTitle, offerType);
      
      if (!result.url) {
        throw new Error('No image URL returned from OpenAI');
      }
      
      imageUrl = result.url;
      console.log('Successfully generated image with OpenAI');
    } catch (aiError) {
      // If OpenAI fails (due to rate limits or any other reason), use static fallbacks
      console.warn(`OpenAI image generation failed, using fallback image: ${aiError instanceof Error ? aiError.message : String(aiError)}`);
      
      // Identify fallback image based on offer type/title
      let fallbackPath = '/images/offers/premium-hotel-deal.jpg';
      
      if (offerTitle.toLowerCase().includes('consultation')) {
        fallbackPath = '/images/offers/free-consultation.jpg';
      } else if (offerTitle.toLowerCase().includes('implant')) {
        fallbackPath = '/images/offers/dental-implant-crown-bundle.jpg';
      } else if (offerTitle.toLowerCase().includes('airport') || offerTitle.toLowerCase().includes('transfer')) {
        fallbackPath = '/images/offers/luxury-airport-transfer.jpg';
      }
      
      // Add a timestamp to bust the cache
      imageUrl = `${fallbackPath}?t=${Date.now()}`;
      
      console.log(`Using fallback image: ${fallbackPath}`);
    }
    
    // Update the special offer image in memory
    const { updateSpecialOfferImageInMemory } = await import('./special-offers-update-helper');
    console.log('Updating special offer image for offer ID:', offerId);
    
    const updateResult = await updateSpecialOfferImageInMemory(offerId, imageUrl);
    
    if (!updateResult) {
      throw new AppError('Failed to update special offer image in database', 500);
    }
    
    console.log('Image updated successfully for offer ID:', offerId);
    
    // Send multiple WebSocket notifications to ensure clients refresh properly
    const wss = getWebSocketService();
    if (wss) {
      // First notification
      wss.broadcast(JSON.stringify({
        type: 'special_offer_updated',
        offerId,
        imageUrl,
        timestamp: Date.now()
      }));
      
      // Second notification after a delay to ensure refresh
      setTimeout(() => {
        wss.broadcast(JSON.stringify({
          type: 'special_offer_updated',
          offerId,
          imageUrl,
          timestamp: Date.now() + 1000 // Ensure unique timestamp
        }));
        
        console.log('Sent second WebSocket notification to ensure client refresh');
      }, 2000);
    }
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        offerId,
        fromFallback: !imageUrl.includes('openai.com')
      }
    });
  } catch (error) {
    console.error('Error handling special offer image update:', error);
    throw new AppError(`Failed to update special offer image: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
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