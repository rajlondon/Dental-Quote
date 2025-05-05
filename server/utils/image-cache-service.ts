import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';
import { URL } from 'url';

class ImageCacheServiceClass {
  private cachePath: string;
  private urlToPathMap: Map<string, string>;
  private pathToUrlMap: Map<string, string>;
  private initialized: boolean = false;
  private cacheTimestamps: Map<string, number> = new Map();

  constructor() {
    // Set the cache path relative to project root
    this.cachePath = path.join(process.cwd(), 'public', 'cached-images');
    this.urlToPathMap = new Map();
    this.pathToUrlMap = new Map();
    
    // Initialize the cache directory
    this.init();
  }

  // Initialize the cache system
  private init(): void {
    try {
      // Create the cache directory if it doesn't exist
      if (!fs.existsSync(this.cachePath)) {
        fs.mkdirSync(this.cachePath, { recursive: true });
        console.log(`✅ Created image cache directory at ${this.cachePath}`);
      } else {
        console.log(`✅ Image cache directory exists: ${this.cachePath}`);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize image cache:', error);
    }
  }

  // Generate a hash for a URL to use as filename
  private hashUrl(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex');
  }

  // Get file extension from URL or default to .jpg
  private getExtensionFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const ext = path.extname(pathname).toLowerCase();
      
      // If we have a valid image extension, use it
      if (ext && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        return ext;
      }
    } catch (error) {
      console.warn(`Error parsing URL for extension: ${url}`, error);
    }
    
    // Default to .jpg if we can't determine the extension
    return '.jpg';
  }

  // Download an image and save it to the cache
  public async cacheImage(url: string, force: boolean = false): Promise<string | null> {
    if (!this.initialized) {
      this.init();
    }
    
    // If the URL is already a cached URL, return it
    if (url.includes('/cached-images/')) {
      return url;
    }
    
    try {
      // Check if the URL is already cached
      if (this.urlToPathMap.has(url) && !force) {
        const cachedPath = this.urlToPathMap.get(url);
        if (cachedPath) {
          const relativePath = cachedPath.replace(this.cachePath, '/cached-images');
          return relativePath;
        }
      }
      
      // Generate a unique filename for the cached image
      const hash = this.hashUrl(url);
      const extension = this.getExtensionFromUrl(url);
      const filename = `${hash}${extension}`;
      const fullPath = path.join(this.cachePath, filename);
      
      console.log(`Downloading image from ${url} to ${fullPath}`);
      
      // Download the image
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer'
      });
      
      // Write the image to the cache
      fs.writeFileSync(fullPath, response.data);
      
      // Add to the maps
      const relativePath = `/cached-images/${filename}`;
      this.urlToPathMap.set(url, fullPath);
      this.pathToUrlMap.set(fullPath, url);
      
      console.log(`Successfully cached image: ${url} → ${relativePath}`);
      
      return relativePath;
    } catch (error) {
      console.error(`Failed to cache image from ${url}:`, error);
      return null;
    }
  }

  // Check if an image URL is already cached
  public isImageCached(url: string): boolean {
    return this.urlToPathMap.has(url);
  }

  // Get the cached URL for an original URL
  public getCachedUrl(url: string): string | null {
    if (this.urlToPathMap.has(url)) {
      const cachedPath = this.urlToPathMap.get(url);
      if (cachedPath) {
        return cachedPath.replace(this.cachePath, '/cached-images');
      }
    }
    return null;
  }

  // Get the original URL for a cached URL
  public getOriginalUrl(cachedUrl: string): string | null {
    const fullPath = cachedUrl.replace('/cached-images', this.cachePath);
    if (this.pathToUrlMap.has(fullPath)) {
      return this.pathToUrlMap.get(fullPath) || null;
    }
    return null;
  }
  
  // Get a versioned URL that forces cache bypassing
  public getVersionedUrl(url: string): string | null {
    // First make sure the URL is cached
    const cachedUrl = this.getCachedUrl(url);
    if (!cachedUrl) {
      return null;
    }
    
    // Add a timestamp to the URL to force cache busting
    const timestamp = Date.now();
    this.cacheTimestamps.set(url, timestamp);
    
    // Add cache-busting parameters
    return `${cachedUrl}?t=${timestamp}&nocache=true`;
  }

  // Clear the cache for a specific URL
  public clearCache(url: string): boolean {
    if (this.urlToPathMap.has(url)) {
      const cachedPath = this.urlToPathMap.get(url);
      if (cachedPath && fs.existsSync(cachedPath)) {
        fs.unlinkSync(cachedPath);
        this.pathToUrlMap.delete(cachedPath);
        this.urlToPathMap.delete(url);
        return true;
      }
    }
    return false;
  }

  // Clear the entire cache
  public clearAllCache(): boolean {
    try {
      const files = fs.readdirSync(this.cachePath);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cachePath, file));
      }
      this.urlToPathMap.clear();
      this.pathToUrlMap.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const ImageCacheService = new ImageCacheServiceClass();