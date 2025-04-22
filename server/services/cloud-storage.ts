/**
 * Cloud Storage Service
 * 
 * This service provides cloud storage functionality for the application.
 * It can be configured to use different cloud storage providers.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Cloud storage configuration
interface CloudStorageConfig {
  provider: 'local' | 'cloudinary' | 'aws-s3';
  bucket?: string;
  region?: string;
  credentials?: {
    accessKey?: string;
    secretKey?: string;
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
  };
  baseUrl?: string;
}

// Get cloud storage configuration from environment variables
function getCloudStorageConfig(): CloudStorageConfig {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  
  if (provider === 'local') {
    return { provider: 'local' };
  }
  
  if (provider === 'cloudinary') {
    return {
      provider: 'cloudinary',
      credentials: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
      baseUrl: process.env.CLOUDINARY_BASE_URL
    };
  }
  
  if (provider === 'aws-s3') {
    return {
      provider: 'aws-s3',
      bucket: process.env.S3_BUCKET_NAME,
      region: process.env.S3_REGION,
      credentials: {
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
      },
      baseUrl: process.env.S3_BASE_URL
    };
  }
  
  // Default to local if not recognized
  return { provider: 'local' };
}

// The current storage configuration
export const cloudStorageConfig = getCloudStorageConfig();

/**
 * Generate a secure filename for cloud storage
 */
export function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomBytes}${ext}`;
}

/**
 * Parse file type from mimetype
 */
export function parseFileType(mimetype: string): 'image' | 'document' | 'xray' | 'other' {
  if (mimetype.startsWith('image/')) {
    return mimetype.includes('dicom') ? 'xray' : 'image';
  }
  
  if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('excel')) {
    return 'document';
  }
  
  return 'other';
}

/**
 * Check if cloud storage is configured and ready to use
 */
export function isCloudStorageConfigured(): boolean {
  const config = cloudStorageConfig;
  
  if (config.provider === 'local') {
    return true; // Local storage is always available
  }
  
  if (config.provider === 'cloudinary') {
    return !!(
      config.credentials?.cloudName &&
      config.credentials?.apiKey &&
      config.credentials?.apiSecret
    );
  }
  
  if (config.provider === 'aws-s3') {
    return !!(
      config.bucket &&
      config.region &&
      config.credentials?.accessKey &&
      config.credentials?.secretKey
    );
  }
  
  return false;
}

/**
 * Generate local file path for a given file
 */
export function getLocalFilePath(filename: string, category: string): string {
  const baseDir = path.join(process.cwd(), 'uploads');
  const categoryDir = path.join(baseDir, category);
  
  // Ensure the directory exists
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  
  return path.join(categoryDir, filename);
}

// Placeholder for future implementation of cloud storage services
// Add integration with AWS S3, Cloudinary, etc. here when needed