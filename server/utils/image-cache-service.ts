import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Directory where cached images will be stored
const CACHE_DIR = path.join(process.cwd(), 'public', 'image-cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`Created image cache directory at ${CACHE_DIR}`);
  } catch (err) {
    console.error('Failed to create image cache directory:', err);
  }
}

/**
 * Cached image service that downloads and stores Azure Blob Storage images
 * to solve the expiration problem
 */
export class ImageCacheService {
  // In-memory map of original URLs to cached paths
  private static urlMapping = new Map<string, string>();

  /**
   * Get a hash of a URL to use as a filename
   */
  private static getUrlHash(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex');
  }

  /**
   * Download and cache an image from a URL
   * @param url Original image URL (e.g., Azure blob storage URL)
   * @returns Path to the cached image file
   */
  public static async cacheImage(url: string): Promise<string> {
    // Check if we've already cached this image
    if (this.urlMapping.has(url)) {
      return this.urlMapping.get(url)!;
    }

    // Generate a filename based on URL hash
    const hash = this.getUrlHash(url);
    const fileName = `${hash}.png`;
    const filePath = path.join(CACHE_DIR, fileName);
    const publicPath = `/image-cache/${fileName}`;

    // Check if file already exists on disk
    if (fs.existsSync(filePath)) {
      // Store in our mapping and return
      this.urlMapping.set(url, publicPath);
      return publicPath;
    }

    try {
      console.log(`🔄 Downloading and caching image from ${url}`);
      
      // Download the image with axios
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
      });

      // Write the image to disk
      fs.writeFileSync(filePath, response.data);
      console.log(`✅ Image cached at ${filePath}`);

      // Store in our mapping and return
      this.urlMapping.set(url, publicPath);
      return publicPath;
    } catch (error) {
      console.error('❌ Failed to cache image:', error);
      return url; // Return original URL as fallback
    }
  }

  /**
   * Get a cached image URL if available, otherwise return the original
   */
  public static getCachedUrl(url: string): string {
    return this.urlMapping.get(url) || url;
  }

  /**
   * Check if an image is already cached
   */
  public static isImageCached(url: string): boolean {
    return this.urlMapping.has(url);
  }
}