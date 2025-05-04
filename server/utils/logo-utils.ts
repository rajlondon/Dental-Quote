import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, '../../public/images/logo.png');
const logoBase64Path = path.join(__dirname, '../../logo_base64.txt');

/**
 * Get the application logo as a base64 string
 * This is used to embed the logo in generated PDFs and images
 * @returns Base64 encoded logo image or empty string if not found
 */
export function getLogoAsBase64(): string {
  try {
    // First try to read from the cached base64 file
    if (fs.existsSync(logoBase64Path)) {
      return fs.readFileSync(logoBase64Path, 'utf-8');
    }
    
    // If the cached file doesn't exist, create it
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const base64Logo = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      
      // Cache the result to avoid recomputing
      fs.writeFileSync(logoBase64Path, base64Logo);
      
      return base64Logo;
    }
    
    // If logo doesn't exist, return empty string
    console.warn('Logo not found at path:', logoPath);
    return '';
  } catch (error) {
    console.error('Error loading logo as base64:', error);
    return '';
  }
}

/**
 * Get height and width of the logo
 * @returns Object with width and height in pixels, or null if logo not found
 */
export function getLogoSize(): { width: number, height: number } | null {
  try {
    // We could use image processing libraries here, but for simplicity
    // we'll return a hardcoded size as the logo is unlikely to change often
    return { width: 200, height: 80 };
  } catch (error) {
    console.error('Error getting logo size:', error);
    return null;
  }
}