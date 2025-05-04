import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { AppError } from './app-error';

// Promisify fs functions
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);

// Constants
const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public', 'cached-images');
const IMAGE_PUBLIC_PATH = '/cached-images';

// Create rotating versioned directories to force cache refresh
// Use a daily rotation for the version number to ensure absolute cache freshness
const today = new Date();
const dailyVersion = `v${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
const VERSIONED_CACHE_DIR = path.join(process.cwd(), 'public', `cached-images-${dailyVersion}`);
const VERSIONED_PUBLIC_PATH = `/cached-images-${dailyVersion}`;

// Ensure the cache directories exist
async function ensureCacheDirectoryExists(): Promise<void> {
  try {
    console.log('🔄 Daily versioned cache directory initialized:', VERSIONED_CACHE_DIR);
    console.log(`🔄 Using daily version: ${dailyVersion} for absolute cache freshness`);
    
    // Check and create the main cache directory
    try {
      await access(IMAGE_CACHE_DIR);
      console.log(`✅ Regular image cache directory exists: ${IMAGE_CACHE_DIR}`);
    } catch {
      await mkdir(IMAGE_CACHE_DIR, { recursive: true });
      console.log(`✨ Created regular image cache directory: ${IMAGE_CACHE_DIR}`);
    }
    
    // Check and create the versioned cache directory
    try {
      await access(VERSIONED_CACHE_DIR);
      console.log(`✅ Daily versioned cache directory exists: ${VERSIONED_CACHE_DIR}`);
    } catch {
      await mkdir(VERSIONED_CACHE_DIR, { recursive: true });
      console.log(`✨ Created daily versioned cache directory: ${VERSIONED_CACHE_DIR}`);
    }
  } catch (error) {
    console.error('❌ Failed to create image cache directories:', error);
    throw new AppError('Failed to create image cache directories', 500);
  }
}

// Initialize the cache directories when the module is loaded
ensureCacheDirectoryExists().catch(err => {
  console.error('Error initializing image cache service:', err);
});

// In-memory cache lookup to speed up checks with versioning information
const urlToFileMap = new Map<string, { originalUrl: string, regularPath: string, versionedPath: string, timestamp: number }>();

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
    
    // Check both the regular cache and versioned cache directories
    for (const ext of extensions) {
      const filePath = path.join(IMAGE_CACHE_DIR, `${fileHash}${ext}`);
      const versionedPath = path.join(VERSIONED_CACHE_DIR, `${fileHash}${ext}`);
      
      if (fs.existsSync(filePath) || fs.existsSync(versionedPath)) {
        // If found in either location, add to in-memory cache for future lookups
        const regularUrl = `${IMAGE_PUBLIC_PATH}/${fileHash}${ext}`;
        const versionedUrl = `${VERSIONED_PUBLIC_PATH}/${fileHash}${ext}`;
        
        // Add both paths to the cache map
        urlToFileMap.set(url, {
          originalUrl: url,
          regularPath: regularUrl,
          versionedPath: versionedUrl,
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
   * @param forceVersioned Force using versioned path for aggressive cache breaking
   * @returns The cached URL if cached, otherwise null
   */
  static getCachedUrl(url: string, forceVersioned = false): string | null {
    // Check if URL is in memory cache
    if (urlToFileMap.has(url)) {
      const cacheInfo = urlToFileMap.get(url);
      // If forcing versioned path or if entry is an object with paths
      if (typeof cacheInfo === 'object' && cacheInfo.versionedPath) {
        return forceVersioned ? cacheInfo.versionedPath : cacheInfo.regularPath;
      }
      // For backward compatibility with old cache entries
      if (typeof cacheInfo === 'string') {
        return cacheInfo;
      }
      return null;
    }

    // If not in memory, check filesystem
    const fileHash = createHash('md5').update(url).digest('hex');
    const extensions = ['.jpg', '.png', '.jpeg', '.webp', '.gif'];
    
    for (const ext of extensions) {
      const regularFilePath = path.join(IMAGE_CACHE_DIR, `${fileHash}${ext}`);
      const versionedFilePath = path.join(VERSIONED_CACHE_DIR, `${fileHash}${ext}`);
      const regularPublicUrl = `${IMAGE_PUBLIC_PATH}/${fileHash}${ext}`;
      const versionedPublicUrl = `${VERSIONED_PUBLIC_PATH}/${fileHash}${ext}`;
      
      const regularExists = fs.existsSync(regularFilePath);
      const versionedExists = fs.existsSync(versionedFilePath) || regularExists; // If regular exists, we can create versioned
      
      if (regularExists || versionedExists) {
        // Add both paths to the cache map
        urlToFileMap.set(url, {
          originalUrl: url,
          regularPath: regularPublicUrl,
          versionedPath: versionedPublicUrl,
          timestamp: Date.now()
        });
        
        return forceVersioned ? versionedPublicUrl : regularPublicUrl;
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
    const cachedUrl = ImageCacheService.getCachedUrl(url, true);
    
    if (!cachedUrl) {
      console.log(`❌ No cached URL found for: ${url}`);
      return null;
    }
    
    console.log(`✅ Found cached URL: ${cachedUrl}`);
    
    // Add timestamp and random value to force browsers to reload
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    const versionedUrl = `${cachedUrl}?t=${timestamp}&r=${randomValue}&nocache=true&daily=${dailyVersion}`;
    
    console.log(`🌟 Created daily versioned URL: ${versionedUrl}`);
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

      // Download the image
      console.log(`📥 Downloading image from: ${url}`);
      console.log(`📥 Using daily versioned directory: ${VERSIONED_CACHE_DIR}`);
      
      const response = await axios.get(url, {
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
      
      // Generate both regular and versioned file paths
      const regularFilePath = path.join(IMAGE_CACHE_DIR, fileName);
      const versionedFilePath = path.join(VERSIONED_CACHE_DIR, fileName);
      
      // Create the public URLs
      const regularPublicUrl = `${IMAGE_PUBLIC_PATH}/${fileName}`;
      const versionedPublicUrl = `${VERSIONED_PUBLIC_PATH}/${fileName}`;
      
      // Define the image buffer once
      const imageBuffer = Buffer.from(response.data);
      
      try {
        // Write the image to both locations
        await writeFile(regularFilePath, imageBuffer);
        console.log(`📥 Successfully wrote file to regular path: ${regularFilePath}`);
        
        await writeFile(versionedFilePath, imageBuffer);
        console.log(`📥 Successfully wrote file to versioned path: ${versionedFilePath}`);
        
        // Save in memory cache with both paths
        urlToFileMap.set(url, {
          originalUrl: url,
          regularPath: regularPublicUrl,
          versionedPath: versionedPublicUrl,
          timestamp: Date.now()
        });
        
        console.log(`📥 Image successfully cached in both locations and added to memory map`);
        
        // By default, return the regular URL as it's more compatible
        return regularPublicUrl;
      } catch (error) {
        const writeError = error as Error;
        console.error(`❌ Error writing image files:`, writeError);
        throw new AppError(`Failed to write image files: ${writeError.message}`, 500);
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