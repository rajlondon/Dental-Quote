import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import axios from 'axios';
import { createHash } from 'crypto';
import { AppError } from './app-error';

// File system promises
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);

// Constants - simplified to use only one directory
const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public', 'cached-images');
const IMAGE_PUBLIC_PATH = '/cached-images';

// Ensure the cache directory exists
async function ensureCacheDirectoryExists(): Promise<void> {
  try {
    // Check and create the cache directory
    try {
      await access(IMAGE_CACHE_DIR);
      console.log(`✅ Image cache directory exists: ${IMAGE_CACHE_DIR}`);
    } catch {
      await mkdir(IMAGE_CACHE_DIR, { recursive: true });
      console.log(`✨ Created image cache directory: ${IMAGE_CACHE_DIR}`);
    }
  } catch (error) {
    console.error('❌ Failed to create image cache directory:', error);
    throw new AppError('Failed to create image cache directory', 500);
  }
}

// Initialize the cache directory when the module is loaded
ensureCacheDirectoryExists().catch(err => {
  console.error('Error initializing image cache service:', err);
});

// In-memory cache lookup to speed up checks
const urlToFileMap = new Map<string, { originalUrl: string, path: string, timestamp: number }>();

/**
 * Service for caching external images to avoid expiration issues with
 * Azure Blob Storage URLs (OpenAI DALL-E) and other temporary image URLs
 */
export class ImageCacheService {
  /**
   * Check if an image URL is already cached
   * @param url The URL of the image to check
   * @returns True if the image is cached, false otherwise
   */
  static isImageCached(url: string): boolean {
    // Check if URL is in our in-memory cache map
    if (urlToFileMap.has(url)) {
      return true;
    }

    // If not in memory, check the filesystem
    const fileHash = createHash('md5').update(url).digest('hex');
    const extensions = ['.jpg', '.png', '.jpeg', '.webp', '.gif'];
    
    // Check the cache directory
    for (const ext of extensions) {
      const filePath = path.join(IMAGE_CACHE_DIR, `${fileHash}${ext}`);
      
      if (fs.existsSync(filePath)) {
        // If found, add to in-memory cache for future lookups
        const publicUrl = `${IMAGE_PUBLIC_PATH}/${fileHash}${ext}`;
        
        // Add path to the cache map
        urlToFileMap.set(url, {
          originalUrl: url,
          path: publicUrl,
          timestamp: Date.now()
        });
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get the cached URL for an image
   * @param url The original URL of the image
   * @returns The cached URL if cached, otherwise null
   */
  static getCachedUrl(url: string): string | null {
    // Check if URL is in memory cache
    if (urlToFileMap.has(url)) {
      const cacheInfo = urlToFileMap.get(url);
      if (cacheInfo) {
        return cacheInfo.path;
      }
      return null;
    }

    // If not in memory, check filesystem
    const fileHash = createHash('md5').update(url).digest('hex');
    const extensions = ['.jpg', '.png', '.jpeg', '.webp', '.gif'];
    
    for (const ext of extensions) {
      const filePath = path.join(IMAGE_CACHE_DIR, `${fileHash}${ext}`);
      const publicUrl = `${IMAGE_PUBLIC_PATH}/${fileHash}${ext}`;
      
      if (fs.existsSync(filePath)) {
        // Add path to the cache map
        urlToFileMap.set(url, {
          originalUrl: url,
          path: publicUrl,
          timestamp: Date.now()
        });
        
        return publicUrl;
      }
    }
    
    return null;
  }

  /**
   * Gets a versioned URL for an image that can bypass browser cache
   * This ensures the image is always fresh even if the underlying image is the same
   * @param url Original image URL to get versioned URL for
   * @returns A versioned URL that will bypass browser cache
   */
  static getVersionedUrl(url: string): string | null {
    console.log(`🔄 Getting versioned URL for: ${url}`);
    const cachedUrl = ImageCacheService.getCachedUrl(url);
    
    if (!cachedUrl) {
      console.log(`❌ No cached URL found for: ${url}`);
      return null;
    }
    
    console.log(`✅ Found cached URL: ${cachedUrl}`);
    
    // Add timestamp and random value to force browsers to reload
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    const userId = Math.random().toString(36).substring(2, 10); // Random user ID to break CDN caching
    const versionedUrl = `${cachedUrl}?t=${timestamp}&r=${randomValue}&u=${userId}&nocache=true`;
    
    console.log(`🌟 Created versioned URL: ${versionedUrl}`);
    return versionedUrl;
  }

  /**
   * Cache an image from a URL to the local filesystem
   * @param url The URL of the image to cache
   * @param forceRefresh Force refreshing the cache even if it already exists
   * @returns The cached URL
   */
  static async cacheImage(url: string, forceRefresh = false): Promise<string> {
    console.log(`📥 Attempting to cache image from URL: ${url}`);
    console.log(`📥 Force refresh requested: ${forceRefresh}`);
    
    // Check if already cached first (unless force refresh is true)
    if (!forceRefresh && ImageCacheService.isImageCached(url)) {
      const cachedUrl = ImageCacheService.getCachedUrl(url);
      if (cachedUrl) {
        console.log(`📥 Image already cached and found: ${url} => ${cachedUrl}`);
        return cachedUrl;
      }
      console.log(`📥 Image marked as cached but URL not found, will re-download`);
    }

    try {
      // Ensure the cache directory exists
      await ensureCacheDirectoryExists();

      // Handle relative URLs by converting them to absolute URLs
      let fullUrl = url;
      if (url.startsWith('/')) {
        // This is a relative URL, make it absolute by adding the base URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        fullUrl = `${baseUrl}${url}`;
        console.log(`📥 Converting relative URL to absolute: ${fullUrl}`);
      }

      // Download the image
      console.log(`📥 Downloading image from: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, {
        responseType: 'arraybuffer',
        headers: {
          // Some servers require a user agent to prevent blocking
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        // Set a small timeout to avoid hanging
        timeout: 10000
      });
      
      console.log(`📥 Download successful, content type: ${response.headers['content-type']}`);
      console.log(`📥 Response status: ${response.status}`);
      console.log(`📥 Image data length: ${response.data.length} bytes`);

      // Determine file extension based on content type
      let extension = '.jpg'; // Default
      const contentType = response.headers['content-type'];
      
      if (contentType) {
        if (contentType.includes('png')) {
          extension = '.png';
        } else if (contentType.includes('webp')) {
          extension = '.webp';
        } else if (contentType.includes('gif')) {
          extension = '.gif';
        } else if (contentType.includes('jpeg')) {
          extension = '.jpg';
        }
      }

      // Create a hash of the URL to use as the filename
      const fileHash = createHash('md5').update(url).digest('hex');
      const fileName = `${fileHash}${extension}`;
      
      // Set the file paths
      const filePath = path.join(IMAGE_CACHE_DIR, fileName);
      const publicUrl = `${IMAGE_PUBLIC_PATH}/${fileName}`;
      
      // Define the image buffer
      const imageBuffer = Buffer.from(response.data);
      
      try {
        // Write the image to the file system
        await writeFile(filePath, imageBuffer);
        console.log(`📥 Successfully wrote file: ${filePath}`);
        console.log(`📥 File size: ${fs.statSync(filePath).size} bytes`);
        
        // Save in memory cache
        urlToFileMap.set(url, {
          originalUrl: url,
          path: publicUrl,
          timestamp: Date.now()
        });
        
        console.log(`📥 Image successfully cached and added to memory map`);
        
        // Return the URL
        return publicUrl;
      } catch (error) {
        const writeError = error as Error;
        console.error(`❌ Error writing image file:`, writeError);
        throw new AppError(`Failed to write image file: ${writeError.message}`, 500);
      }
    } catch (error) {
      console.error('❌ Failed to cache image:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error(`❌ Status: ${error.response?.status}, Data:`, error.response?.data);
      }
      throw new AppError(`Failed to cache image: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
  
  /**
   * Force refresh an image cache by re-downloading it
   * @param url The URL of the image to refresh
   * @returns The refreshed cached URL
   */
  static async refreshImageCache(url: string): Promise<string> {
    return ImageCacheService.cacheImage(url, true);
  }
}