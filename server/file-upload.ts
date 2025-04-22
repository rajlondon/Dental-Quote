import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Storage options
enum StorageType {
  LOCAL = 'local',
  CLOUD = 'cloud'
}

// Default to local storage unless configured for cloud
const STORAGE_TYPE = process.env.STORAGE_TYPE === 'cloud' ? StorageType.CLOUD : StorageType.LOCAL;

// Generate a secure random filename that's harder to guess
function generateSecureFilename(originalExt: string): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomBytes}${originalExt}`;
}

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
if (STORAGE_TYPE === StorageType.LOCAL) {
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
    const secureFilename = generateSecureFilename(ext);
    cb(null, secureFilename);
  }
});

// Set up storage (could be expanded for cloud storage)
const storage = STORAGE_TYPE === StorageType.CLOUD
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
    
    console.error(`File upload error: ${err.code} - ${err.message}`);
    return res.status(400).json({ 
      success: false,
      error: errorMessage 
    });
  }
  
  if (err) {
    console.error(`General file upload error: ${err.message}`);
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
}

export interface UploadResult {
  files: UploadedFile[];
  success: boolean;
  message: string;
  totalSize: number;
}