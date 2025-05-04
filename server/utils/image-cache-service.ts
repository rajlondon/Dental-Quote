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

// Constants
const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public', 'cached-images');
const IMAGE_PUBLIC_PATH = '/cached-images';

// Ensure the cache directory exists
async function ensureCacheDirectoryExists(): Promise<void> {
  try {
    await access(IMAGE_CACHE_DIR);
  } catch (error) {
    // Directory doesn't exist, create it
    try {
      await mkdir(IMAGE_CACHE_DIR, { recursive: true });
      console.log(`Created image cache directory: ${IMAGE_CACHE_DIR}`);
    } catch (mkdirError) {
      console.error('Failed to create image cache directory:', mkdirError);
      throw new AppError('Failed to create image cache directory', 500);
    }
  }
}

// Initialize the cache directory when the module is loaded
ensureCacheDirectoryExists().catch(err => {
  console.error('Error initializing image cache service:', err);
});

// In-memory cache lookup to speed up checks
const urlToFileMap = new Map<string, string>();

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
    
    for (const ext of extensions) {
      const filePath = path.join(IMAGE_CACHE_DIR, `${fileHash}${ext}`);
      if (fs.existsSync(filePath)) {
        // If found, add to in-memory cache for future lookups
        const publicUrl = `${IMAGE_PUBLIC_PATH}/${fileHash}${ext}`;
        urlToFileMap.set(url, publicUrl);
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
      return urlToFileMap.get(url) || null;
    }

    // If not in memory, check filesystem
    const fileHash = createHash('md5').update(url).digest('hex');
    const extensions = ['.jpg', '.png', '.jpeg', '.webp', '.gif'];
    
    for (const ext of extensions) {
      const filePath = path.join(IMAGE_CACHE_DIR, `${fileHash}${ext}`);
      if (fs.existsSync(filePath)) {
        const publicUrl = `${IMAGE_PUBLIC_PATH}/${fileHash}${ext}`;
        // Add to in-memory cache for future lookups
        urlToFileMap.set(url, publicUrl);
        return publicUrl;
      }
    }
    
    return null;
  }

  /**
   * Cache an image from a URL to the local filesystem
   * @param url The URL of the image to cache
   * @returns The cached URL
   */
  static async cacheImage(url: string): Promise<string> {
    // Check if already cached first
    if (ImageCacheService.isImageCached(url)) {
      const cachedUrl = ImageCacheService.getCachedUrl(url);
      if (cachedUrl) {
        console.log(`Image already cached: ${url} => ${cachedUrl}`);
        return cachedUrl;
      }
    }

    try {
      // Ensure the cache directory exists
      await ensureCacheDirectoryExists();

      // Download the image
      console.log(`Downloading image from: ${url}`);
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          // Some servers require a user agent to prevent blocking
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

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
      const filePath = path.join(IMAGE_CACHE_DIR, fileName);

      // Write the image to disk
      await writeFile(filePath, Buffer.from(response.data));
      console.log(`Image cached successfully: ${url} => ${filePath}`);

      // Create the public URL for the cached image
      const publicUrl = `${IMAGE_PUBLIC_PATH}/${fileName}`;
      
      // Save in memory cache
      urlToFileMap.set(url, publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Failed to cache image:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
      throw new AppError(`Failed to cache image: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }
}