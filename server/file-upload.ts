import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { 
  generateSecureFilename, 
  parseFileType, 
  cloudStorageConfig, 
  uploadToS3, 
  isCloudStorageConfigured 
} from './services/cloud-storage';
import { logError, ErrorSeverity } from './services/error-logger';

// Storage options
export enum StorageType {
  LOCAL = 'local',
  AWS_S3 = 'aws-s3',
  CLOUDINARY = 'cloudinary'
}

// Determine storage type from environment configuration
function determineStorageType(): StorageType {
  const provider = cloudStorageConfig.provider;
  const envForce = process.env.FORCE_STORAGE_TYPE;
  const isProductionEnv = process.env.NODE_ENV === 'production';
  
  // Debug log the storage configuration
  console.log(`Storage provider from config: ${provider}`);
  console.log(`CloudStorage configured: ${isCloudStorageConfigured()}`);
  console.log(`Environment S3 keys exist: ${!!process.env.S3_ACCESS_KEY}`);
  console.log(`Environment has S3 bucket: ${!!process.env.S3_BUCKET_NAME}`);
  console.log(`Environment: ${isProductionEnv ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  // Force specific storage type if set in environment
  if (envForce === 'aws-s3') {
    console.log('Using AWS S3 storage as forced by environment variable');
    return StorageType.AWS_S3;
  } else if (envForce === 'local') {
    console.log('Using local storage as forced by environment variable');
    return StorageType.LOCAL;
  }
  
  // FORCE S3: If we have AWS S3 keys configured, use it regardless of environment
  // This ensures we always use S3 if it's properly configured
  if (process.env.S3_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
    console.log('FORCED: Using AWS S3 storage (keys are configured)');
    return StorageType.AWS_S3;
  }
  
  // In production, always try to use S3 if the keys are available
  if (isProductionEnv && process.env.S3_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
    console.log('Using AWS S3 storage in production environment');
    return StorageType.AWS_S3;
  }
  
  // For the Replit environment, we know AWS S3 keys are properly set, so prefer S3
  if (process.env.REPLIT_ENVIRONMENT === 'production' && process.env.S3_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
    console.log('Using AWS S3 storage in Replit production environment');
    return StorageType.AWS_S3;
  }
  
  // Regular logic from cloud storage config
  if (provider === 'aws-s3' && isCloudStorageConfigured()) {
    console.log('Using AWS S3 storage based on configuration');
    return StorageType.AWS_S3;
  } else if (provider === 'cloudinary' && isCloudStorageConfigured()) {
    return StorageType.CLOUDINARY;
  } else {
    console.log('Using local storage as fallback');
    return StorageType.LOCAL;
  }
}

// Get the active storage type
export const ACTIVE_STORAGE_TYPE = determineStorageType();

// Log the storage configuration on startup
console.log(`File storage configured to use: ${ACTIVE_STORAGE_TYPE}`);

// Ensure upload directory exists for local storage
const uploadDir = path.join(process.cwd(), 'uploads');
const xraysDir = path.join(uploadDir, 'xrays');
const docsDir = path.join(uploadDir, 'documents');
const imagesDir = path.join(uploadDir, 'images');

function ensureLocalDirectories() {
  const directories = [uploadDir, xraysDir, docsDir, imagesDir];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Make sure directories exist if using local storage
if (ACTIVE_STORAGE_TYPE === StorageType.LOCAL) {
  ensureLocalDirectories();
}

// Determine appropriate directory based on file mimetype
function getDestinationPath(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
    return mimetype.includes('dicom') ? xraysDir : imagesDir;
  }
  return docsDir;
}

// Configure storage based on environment
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = getDestinationPath(file.mimetype);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Create secure unique filename with original extension
    const ext = path.extname(file.originalname);
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

// Set up storage (memory for cloud, disk for local)
const storage = ACTIVE_STORAGE_TYPE !== StorageType.LOCAL
  ? multer.memoryStorage() // For cloud storage we'll keep file in memory
  : diskStorage;

// Improved file filter with better security and validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedMimeTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    xrays: ['image/jpeg', 'image/png', 'application/dicom']
  };
  
  // Combine all allowed mime types
  const allowedMimes = [
    ...allowedMimeTypes.images,
    ...allowedMimeTypes.documents,
    ...allowedMimeTypes.xrays
  ];
  
  // Validate the file type
  if (allowedMimes.includes(file.mimetype)) {
    // Also check file extension to prevent extension/mimetype mismatch
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.webp', '.dcm'];
    
    if (validExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file extension. Only JPG, PNG, GIF, PDF, DOC, DOCX, and DICOM files are allowed.'));
    }
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and medical document formats are allowed.'));
  }
};

// Create multer upload instance with improved security
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
    files: 10 // Maximum 10 files per upload
  }
});

// Improved middleware to handle upload errors
export const handleUploadError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // Handle specific Multer errors with user-friendly messages
    const errorResponses: Record<string, string> = {
      'LIMIT_FILE_SIZE': 'File too large. Maximum size is 15MB.',
      'LIMIT_FILE_COUNT': 'Too many files. Maximum is 10 files per upload.',
      'LIMIT_UNEXPECTED_FILE': 'Unexpected file field. Please check your form.',
      'LIMIT_PART_COUNT': 'Too many parts in the multipart form.'
    };
    
    const errorMessage = errorResponses[err.code] || `Upload error: ${err.message}`;
    
    logError(err, {
      component: 'FileUpload',
      errorCode: err.code,
      path: req.path
    }, ErrorSeverity.WARNING);
    
    return res.status(400).json({ 
      success: false,
      error: errorMessage 
    });
  }
  
  if (err) {
    logError(err, {
      component: 'FileUpload',
      path: req.path
    }, ErrorSeverity.WARNING);
    
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  next();
};

// Improved types with additional metadata
export interface UploadedFile {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
  url?: string; // URL for cloud storage
  storageType: StorageType;
  category?: string; // xray, document, image
  uploadDate: Date;
  key?: string; // For cloud storage (S3 key or Cloudinary public ID)
}

/**
 * Process the uploaded file and store it in the configured storage system
 * @param file The file object from multer
 * @returns Promise with the processed file information
 */
export async function processUploadedFile(file: Express.Multer.File): Promise<UploadedFile> {
  const fileType = parseFileType(file.mimetype);
  const uploadDate = new Date();
  
  // For local storage (already saved by multer disk storage)
  if (ACTIVE_STORAGE_TYPE === StorageType.LOCAL) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      storageType: StorageType.LOCAL,
      category: fileType,
      uploadDate
    };
  }
  
  // For S3 storage
  if (ACTIVE_STORAGE_TYPE === StorageType.AWS_S3) {
    try {
      // Generate a filename with the file type as prefix
      // This uses root-level storage which we've verified works with the current IAM policy
      const key = `${fileType}-${generateSecureFilename(file.originalname)}`;
      
      // Upload to S3
      const result = await uploadToS3(file.buffer, key, file.mimetype);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return {
        filename: path.basename(key),
        originalname: file.originalname,
        path: key, // Store the S3 key as the path
        size: file.size,
        mimetype: file.mimetype,
        url: result.url,
        key: key,
        storageType: StorageType.AWS_S3,
        category: fileType,
        uploadDate
      };
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'FileUpload',
        operation: 'S3Upload',
        filename: file.originalname,
        fileType
      }, ErrorSeverity.ERROR);
      
      // Fallback to local storage if S3 upload fails
      console.warn('S3 upload failed, falling back to local storage');
      
      // Ensure local dir exists
      ensureLocalDirectories();
      
      // Save locally as fallback
      const destPath = getDestinationPath(file.mimetype);
      const filename = generateSecureFilename(file.originalname);
      const fullPath = path.join(destPath, filename);
      
      fs.writeFileSync(fullPath, file.buffer);
      
      return {
        filename: filename,
        originalname: file.originalname,
        path: fullPath,
        size: file.size,
        mimetype: file.mimetype,
        storageType: StorageType.LOCAL, // Fallback to local
        category: fileType,
        uploadDate
      };
    }
  }
  
  // Cloudinary would be implemented here if needed
  
  // Default fallback to local storage (should not reach here normally)
  throw new Error('Unsupported storage type');
}

export interface UploadResult {
  files: UploadedFile[];
  success: boolean;
  message: string;
  totalSize: number;
}