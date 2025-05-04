import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Cached image service that downloads and stores Azure Blob Storage images
 * to solve the expiration problem
 */
export class ImageCacheService {
  private static cacheDir = path.join(process.cwd(), 'public', 'image-cache');
  private static urlMapping = new Map<string, string>();
  
  /**
   * Get a hash of a URL to use as a filename
   */
  private static getUrlHash(url: string): string {
    // Create a hash of the URL to use as a filename
    return crypto.createHash('md5').update(url).digest('hex');
  }
  
  /**
   * Download and cache an image from a URL
   * @param url Original image URL (e.g., Azure blob storage URL)
   * @returns Path to the cached image file
   */
  public static async cacheImage(url: string): Promise<string> {
    try {
      // Make sure cache directory exists
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      
      // If URL has query parameters, strip them for hashing
      // This avoids creating multiple cache entries for the same base URL
      const baseUrl = url.split('?')[0];
      
      // Create a hash of the base URL to use as a filename
      const urlHash = this.getUrlHash(baseUrl);
      const ext = path.extname(baseUrl) || '.jpg'; // Default to .jpg if no extension
      const filename = `${urlHash}${ext}`;
      const filePath = path.join(this.cacheDir, filename);
      
      // Check if we already have this image cached
      if (fs.existsSync(filePath)) {
        console.log(`Cache hit for ${url} -> ${filename}`);
        
        // Always store the most recent URL to filename mapping
        this.urlMapping.set(url, `/image-cache/${filename}`);
        
        return `/image-cache/${filename}`;
      }
      
      console.log(`Cache miss for ${url}, downloading...`);
      
      // Download the image from the original URL
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          // Add headers to avoid CORS issues
          'User-Agent': 'MyDentalFly/1.0 Image Caching Service',
          'Accept': 'image/jpeg,image/png,image/webp,image/*,*/*'
        }
      });
      
      // Write to disk
      fs.writeFileSync(filePath, response.data);
      
      console.log(`Image cached: ${url} -> ${filePath}`);
      
      // Store the URL to filename mapping
      this.urlMapping.set(url, `/image-cache/${filename}`);
      
      // Return the path to the cached file
      return `/image-cache/${filename}`;
    } catch (error) {
      console.error(`Error caching image from ${url}:`, error);
      
      // Return the original URL if we couldn't cache it
      return url;
    }
  }
  
  /**
   * Get a cached image URL if available, otherwise return the original
   */
  public static getCachedUrl(url: string): string {
    // Get the base URL (strip query parameters)
    const baseUrl = url.split('?')[0];
    
    // Try to get from the URL mapping first (newest mappings)
    const mappedUrl = this.urlMapping.get(url);
    if (mappedUrl) {
      return mappedUrl;
    }
    
    // Otherwise, try to check if the file exists
    const urlHash = this.getUrlHash(baseUrl);
    const ext = path.extname(baseUrl) || '.jpg';
    const filename = `${urlHash}${ext}`;
    const filePath = path.join(this.cacheDir, filename);
    
    if (fs.existsSync(filePath)) {
      // Update mapping for future lookups
      this.urlMapping.set(url, `/image-cache/${filename}`);
      return `/image-cache/${filename}`;
    }
    
    // If not cached, return the original URL
    return url;
  }
  
  /**
   * Check if an image is already cached
   */
  public static isImageCached(url: string): boolean {
    // Get the base URL (strip query parameters)
    const baseUrl = url.split('?')[0];
    
    // Check if it's in the URL mapping
    if (this.urlMapping.has(url)) {
      return true;
    }
    
    // Or check if the file exists
    const urlHash = this.getUrlHash(baseUrl);
    const ext = path.extname(baseUrl) || '.jpg';
    const filename = `${urlHash}${ext}`;
    const filePath = path.join(this.cacheDir, filename);
    
    return fs.existsSync(filePath);
  }
}