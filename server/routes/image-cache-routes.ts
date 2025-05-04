import express from 'express';
import { ImageCacheService } from '../utils/image-cache-service';
import { AppError } from '../utils/app-error';
import { catchAsync } from '../utils/catch-async';

const router = express.Router();

/**
 * @route   GET /api/proxy-image
 * @desc    Proxy an image through the server to cache it and avoid expiration issues
 * @access  Public
 * 
 * Query params:
 *   url: The URL of the image to proxy
 * 
 * Example usage:
 *   <img src="/api/proxy-image?url=https://example.com/image.jpg" />
 */
router.get('/proxy-image', catchAsync(async (req: express.Request, res: express.Response) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    throw new AppError('URL query parameter is required', 400);
  }
  
  try {
    console.log(`🔄 Image proxy requested for URL: ${url}`);
    
    // First, check if image is already cached
    if (ImageCacheService.isImageCached(url)) {
      console.log(`✅ Image is already cached for URL: ${url}`);
      
      // Get versioned URL with cache busting query parameters
      const versionedUrl = ImageCacheService.getVersionedUrl(url);
      
      if (versionedUrl) {
        console.log(`🌟 Redirecting to versioned URL: ${versionedUrl}`);
        return res.redirect(versionedUrl);
      }
      
      // Fallback to standard URL if versioned not available
      const standardUrl = ImageCacheService.getCachedUrl(url);
      if (standardUrl) {
        console.log(`⚠️ Falling back to standard URL: ${standardUrl}`);
        return res.redirect(standardUrl);
      }
      
      console.log(`❌ Image marked as cached but no URL found, will download`);
    } else {
      console.log(`ℹ️ Image not cached, will download: ${url}`);
    }
    
    // Cache the image first
    console.log(`📥 Caching image from URL: ${url}`);
    const cachedUrl = await ImageCacheService.cacheImage(url);
    console.log(`📥 Image cached at URL: ${cachedUrl}`);
    
    // Generate a versioned URL with timestamp and randomness for cache busting
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    const finalUrl = `${cachedUrl}?t=${timestamp}&r=${randomValue}&nocache=true`;
    
    console.log(`🌟 Redirecting to cache-busted URL: ${finalUrl}`);
    return res.redirect(finalUrl);
  } catch (error) {
    console.error('❌ Error proxying image:', error);
    
    // If caching fails, redirect to the original URL
    console.log(`⚠️ Cache failed, redirecting to original URL: ${url}`);
    return res.redirect(url);
  }
}));

export default router;