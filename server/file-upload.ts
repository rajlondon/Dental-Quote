import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
const xraysDir = path.join(uploadDir, 'xrays');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(xraysDir)) {
  fs.mkdirSync(xraysDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, xraysDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow certain file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept image files and PDFs only
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF images and PDF documents are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Maximum 5 files per upload
  }
});

// Middleware to handle upload errors
export const handleUploadError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 10MB.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files. Maximum is 5 files per upload.' 
      });
    }
    return res.status(400).json({ 
      error: `Upload error: ${err.message}` 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: err.message 
    });
  }
  
  next();
};

// Types for file upload data
export interface UploadedFile {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface UploadResult {
  files: UploadedFile[];
  success: boolean;
  message: string;
}