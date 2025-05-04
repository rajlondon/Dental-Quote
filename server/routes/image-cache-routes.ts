import express, { Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { catchAsync } from '../utils/catch-async';
import { ImageCacheService } from '../utils/image-cache-service';

const router = express.Router();

/**
 * Image caching endpoint
 * This route downloads and caches an image from a URL to solve the expiration issues with
 * Azure Blob Storage URLs (OpenAI DALL-E).
 * 
 * POST /api/images/cache
 * body: { url: string }
 * returns: { success: boolean, cached: boolean, cachedUrl: string, originalUrl: string }
 */
router.post('/api/images/cache', catchAsync(async (req: Request, res: Response) => {
  const { url } = req.body;
  
  if (!url) {
    throw new AppError('URL is required', 400);
  }
  
  try {
    console.log(`🔍 Attempting to cache image from URL: ${url}`);
    
    // Check if image is already cached
    const isCached = ImageCacheService.isImageCached(url);
    
    if (isCached) {
      console.log(`Cache hit for ${url}`);
      // Get both regular and versioned URLs
      const cachedUrl = ImageCacheService.getCachedUrl(url);
      const versionedUrl = ImageCacheService.getVersionedUrl(url);
      
      return res.json({
        success: true,
        cached: true,
        cachedUrl,
        versionedUrl,
        originalUrl: url,
        fromCache: true
      });
    }
    
    // Cache the image
    console.log(`Caching new image from ${url}`);
    const cachedUrl = await ImageCacheService.cacheImage(url);
    // Also get a versioned URL for better cache busting
    const versionedUrl = ImageCacheService.getVersionedUrl(url);
    
    return res.json({
      success: true, 
      cached: true,
      cachedUrl,
      versionedUrl,
      originalUrl: url
    });
  } catch (error) {
    console.error('Error caching image:', error);
    
    // Return original URL if caching failed
    return res.json({
      success: false,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalUrl: url
    });
  }
}));

/**
 * Image proxy endpoint
 * This route proxies an image URL to avoid CORS issues and caches it for future use
 * 
 * GET /api/images/proxy?url={encoded_url}
 */
router.get('/api/images/proxy', catchAsync(async (req: Request, res: Response) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    throw new AppError('URL query parameter is required', 400);
  }
  
  try {
    // Try to get the cached version
    if (ImageCacheService.isImageCached(url)) {
      // Get versioned URL if available (better for cache busting)
      const versionedUrl = ImageCacheService.getVersionedUrl(url);
      const standardCachedUrl = ImageCacheService.getCachedUrl(url);
      const cachedUrl = versionedUrl || standardCachedUrl;
      
      if (cachedUrl && typeof cachedUrl === 'string') {
        return res.redirect(cachedUrl);
      }
    }
    
    // Cache the image first
    const cachedUrl = await ImageCacheService.cacheImage(url);
    
    // Try to get a versioned URL for better cache control
    const versionedUrl = ImageCacheService.getVersionedUrl(url);
    
    // Redirect to the versioned cached URL if available, otherwise use the standard cached URL
    return res.redirect(versionedUrl || cachedUrl);
  } catch (error) {
    console.error('Error proxying image:', error);
    
    // If caching fails, redirect to the original URL
    return res.redirect(url);
  }
}));

export default router;