import express, { Request, Response } from 'express';
import { ImageCacheService } from '../utils/image-cache-service';
import { catchAsync } from '../utils/catch-async';
import { AppError } from '../utils/app-error';

const router = express.Router();

// Cache an image from a remote URL (Azure blob, etc.)
router.post('/api/images/cache', catchAsync(async (req: Request, res: Response) => {
  const { url } = req.body;
  
  if (!url) {
    throw new AppError('Image URL is required', 400);
  }

  console.log(`🔄 Image cache request for: ${url}`);
  
  // Check if this is an Azure blob URL or likely to expire
  const isAzureBlobUrl = url.includes('oaidalleapiprodscus.blob.core.windows.net');
  const isOpenAIUrl = url.includes('openai.com');
  
  if (!isAzureBlobUrl && !isOpenAIUrl) {
    // If it's not an Azure URL, just return it as-is (no need to cache)
    return res.json({
      originalUrl: url,
      cachedUrl: url,
      cached: false
    });
  }
  
  // Download and cache the image
  const cachedUrl = await ImageCacheService.cacheImage(url);
  
  res.json({
    originalUrl: url,
    cachedUrl: cachedUrl,
    cached: true,
    timestamp: Date.now()
  });
}));

// Force refresh a cached image
router.post('/api/images/refresh-cache', catchAsync(async (req: Request, res: Response) => {
  const { url } = req.body;
  
  if (!url) {
    throw new AppError('Image URL is required', 400);
  }
  
  // Always re-download and re-cache the image
  const cachedUrl = await ImageCacheService.cacheImage(url);
  
  res.json({
    originalUrl: url,
    cachedUrl: cachedUrl,
    refreshed: true,
    timestamp: Date.now()
  });
}));

// Get status of a cached image
router.get('/api/images/cache-status', catchAsync(async (req: Request, res: Response) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    throw new AppError('Image URL is required as a query parameter', 400);
  }
  
  const isCached = ImageCacheService.isImageCached(url);
  const cachedUrl = isCached ? ImageCacheService.getCachedUrl(url) : url;
  
  res.json({
    originalUrl: url,
    cachedUrl: cachedUrl,
    isCached: isCached,
    timestamp: Date.now()
  });
}));

export default router;