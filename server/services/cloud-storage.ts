/**
 * Cloud Storage Service
 * 
 * This service provides cloud storage functionality for the application.
 * It can be configured to use different cloud storage providers.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logError, logInfo, ErrorSeverity } from './error-logger';

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

// File upload response
export interface UploadFileResponse {
  success: boolean;
  message: string;
  url?: string;
  key?: string;
  error?: any;
}

/**
 * Determines whether the application is running in production mode
 * @returns {boolean} true if in production, false otherwise
 */
export function isProduction(): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Only log during the initial configuration to avoid log spam
  if (!isProductionLogged) {
    if (isProd) {
      console.log('🚀 Running in PRODUCTION mode - secure cloud storage enabled by default');
    } else {
      console.log('🔧 Running in DEVELOPMENT mode - using local storage by default');
    }
    isProductionLogged = true;
  }
  
  return isProd;
}

// Flag to ensure we only log environment once during startup
let isProductionLogged = false;

/**
 * Get cloud storage configuration from environment variables
 * Production environments default to cloud storage if configured
 * Development environments default to local storage for easier testing
 * Override with STORAGE_PROVIDER environment variable
 */
function getCloudStorageConfig(): CloudStorageConfig {
  // If STORAGE_PROVIDER is explicitly set, use that regardless of environment
  const explicitProvider = process.env.STORAGE_PROVIDER;
  if (explicitProvider) {
    console.log(`Using explicitly configured storage provider: ${explicitProvider}`);
  }
  
  // Default provider based on environment
  const defaultProvider = isProduction() ? 'aws-s3' : 'local';
  const provider = explicitProvider || defaultProvider;
  
  // Check for environment-specific configurations
  const isAWSConfigured = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
  
  // Log detailed environment information for better debugging
  console.log(`Storage mode: ${provider} (${isProduction() ? 'PRODUCTION' : 'DEVELOPMENT'} environment)`);
  if (provider === 'aws-s3' && !isAWSConfigured) {
    console.warn('⚠️ AWS S3 selected but credentials not found - may fall back to local storage');
  }
  
  if (provider === 'local') {
    return { provider: 'local' };
  }
  
  if (provider === 'cloudinary') {
    // Check for required environment variables
    const missingVars = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missingVars.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');
    
    if (missingVars.length > 0 && isProduction()) {
      console.error(`⚠️ Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
      console.warn('⚠️ Falling back to local storage despite production environment');
      return { provider: 'local' };
    }
    
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
    // Check for required environment variables - adapted to match provided credentials
    const missingVars = [];
    if (!process.env.S3_BUCKET_NAME) missingVars.push('S3_BUCKET_NAME');
    
    // Support both naming conventions for AWS credentials
    const accessKey = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'eu-north-1';
    
    if (!accessKey) missingVars.push('S3_ACCESS_KEY or AWS_ACCESS_KEY_ID');
    if (!secretKey) missingVars.push('S3_SECRET_KEY or AWS_SECRET_ACCESS_KEY');
    
    if (missingVars.length > 0 && isProduction()) {
      console.error(`⚠️ Missing AWS S3 environment variables: ${missingVars.join(', ')}`);
      console.warn('⚠️ Falling back to local storage despite production environment');
      return { provider: 'local' };
    }
    
    return {
      provider: 'aws-s3',
      bucket: process.env.S3_BUCKET_NAME,
      region: region,
      credentials: {
        accessKey: accessKey,
        secretKey: secretKey,
      },
      baseUrl: process.env.S3_BASE_URL
    };
  }
  
  // Default to local if not recognized
  return { provider: 'local' };
}

// The current storage configuration
export const cloudStorageConfig = getCloudStorageConfig();

// Create AWS S3 client if configured
let s3Client: S3Client | null = null;

// Helper function to initialize S3 client
function initializeS3Client(): S3Client | null {
  console.log('Attempting to initialize S3 client...');
  
  // Get credentials from environment directly to avoid any config issues
  const accessKey = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION || process.env.AWS_REGION || 'eu-north-1';
  const bucket = process.env.S3_BUCKET_NAME;
  
  console.log(`S3 configuration check:
  - Access Key exists: ${!!accessKey}
  - Secret Key exists: ${!!secretKey}
  - Region: ${region}
  - Bucket: ${bucket}
  `);
  
  if (!accessKey || !secretKey || !bucket) {
    console.warn('Cannot initialize S3 client: missing required credentials or bucket name');
    return null;
  }
  
  try {
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
      }
    });
    
    logInfo('AWS S3 client initialized successfully');
    console.log('S3 client created successfully');
    return client;
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 
      { component: 'CloudStorage' }, 
      ErrorSeverity.WARNING);
    console.error('Failed to initialize S3 client:', error);
    return null;
  }
}

// Initialize S3 client
s3Client = initializeS3Client();

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
      config.credentials?.secretKey &&
      s3Client
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

/**
 * Upload file to S3
 * @param buffer File buffer
 * @param key File key (path in S3)
 * @param mimetype File mimetype
 * @returns UploadFileResponse
 */
export async function uploadToS3(
  buffer: Buffer, 
  key: string, 
  mimetype: string
): Promise<UploadFileResponse> {
  console.log(`Attempting S3 upload for file with key: ${key}`);
  console.log(`Mimetype: ${mimetype}, Buffer size: ${buffer.length} bytes`);
  
  // Get bucket name directly from environment
  const bucketName = process.env.S3_BUCKET_NAME;
  
  // If we don't have an S3 client or bucket, try initializing again
  if (!s3Client) {
    console.log('S3 client not initialized, attempting to create...');
    s3Client = initializeS3Client();
  }
  
  if (!s3Client || !bucketName) {
    console.error('S3 client or bucket not configured');
    console.log(`S3 client exists: ${!!s3Client}, Bucket: ${bucketName}`);
    return { 
      success: false, 
      message: 'S3 client or bucket not configured' 
    };
  }

  try {
    console.log(`Using bucket: ${bucketName}`);
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'eu-north-1';
    console.log(`Using region: ${region}`);
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      // Add encryption for better security
      ServerSideEncryption: 'AES256'
    });

    console.log('Sending S3 PutObject command...');
    const response = await s3Client.send(command);
    console.log('S3 upload succeeded:', response);
    
    // Generate URL (either from base URL or signed URL)
    let url = '';
    if (cloudStorageConfig.baseUrl) {
      url = `${cloudStorageConfig.baseUrl}/${key}`;
      console.log(`Using base URL: ${url}`);
    } else {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      // Generate temporary signed URL valid for 60 minutes
      console.log('Generating signed URL...');
      url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      console.log(`Generated signed URL successfully`);
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      url,
      key
    };
  } catch (error) {
    console.error('S3 upload failed with error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'CloudStorage',
      operation: 'uploadToS3',
      key,
      mimetype,
      bufferSize: buffer.length,
      bucket: cloudStorageConfig.bucket,
      region: cloudStorageConfig.region
    }, ErrorSeverity.ERROR);

    return {
      success: false,
      message: 'Failed to upload file to S3',
      error
    };
  }
}

/**
 * Generate a temporary signed URL for an S3 object
 * @param key S3 object key
 * @param expiresIn Expiration time in seconds (default 3600 = 1 hour)
 * @returns Signed URL or null if error
 */
export async function getSignedS3Url(key: string, expiresIn = 3600): Promise<string | null> {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  if (!s3Client) {
    s3Client = initializeS3Client();
  }
  
  if (!s3Client || !bucketName) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'CloudStorage',
      operation: 'getSignedS3Url',
      key
    }, ErrorSeverity.WARNING);
    return null;
  }
}

/**
 * Delete file from S3
 * @param key S3 object key
 * @returns Success or failure
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  if (!s3Client) {
    s3Client = initializeS3Client();
  }
  
  if (!s3Client || !bucketName) {
    return false;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'CloudStorage',
      operation: 'deleteFromS3',
      key
    }, ErrorSeverity.WARNING);
    return false;
  }
}

/**
 * List files in S3 bucket by prefix
 * @param prefix Prefix to filter by (folder path)
 * @returns Array of S3 object keys
 */
export async function listS3Files(prefix: string): Promise<string[]> {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  if (!s3Client) {
    s3Client = initializeS3Client();
  }
  
  if (!s3Client || !bucketName) {
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    });

    const response = await s3Client.send(command);
    return (response.Contents || []).map(item => item.Key || '').filter(Boolean);
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'CloudStorage',
      operation: 'listS3Files',
      prefix
    }, ErrorSeverity.WARNING);
    return [];
  }
}