import express from 'express';
import { ImageCacheService } from '../utils/image-cache-service';

const router = express.Router();

// Route to cache an image by URL
router.post('/api/image-cache/cache', async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - you must be logged in to use this endpoint'
      });
    }
    
    const { imageUrl, force = false } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }
    
    console.log(`Attempting to cache image URL: ${imageUrl}`);
    
    // Try to cache the image
    const cachedUrl = await ImageCacheService.cacheImage(imageUrl, force);
    
    if (cachedUrl) {
      return res.status(200).json({
        success: true,
        message: 'Image successfully cached',
        cachedUrl,
        originalUrl: imageUrl
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to cache the image'
      });
    }
  } catch (error) {
    console.error('Error in image cache endpoint:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to cache image: ${error.message}`
    });
  }
});

// Get a cached image by its original URL
router.get('/api/image-cache/lookup', (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }
    
    // Check if the image is cached
    if (ImageCacheService.isImageCached(url)) {
      const cachedUrl = ImageCacheService.getCachedUrl(url);
      
      return res.status(200).json({
        success: true,
        isCached: true,
        cachedUrl,
        originalUrl: url
      });
    } else {
      return res.status(200).json({
        success: true,
        isCached: false,
        originalUrl: url
      });
    }
  } catch (error) {
    console.error('Error in image cache lookup endpoint:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to lookup cached image: ${error.message}`
    });
  }
});

export default router;