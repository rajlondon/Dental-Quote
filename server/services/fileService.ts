import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { storage } from '../storage';
import { File, InsertFile } from '@shared/schema';

// Setup storage directory
const uploadsDir = path.join(process.cwd(), 'uploads');
const medicalsDir = path.join(uploadsDir, 'medical');
const xraysDir = path.join(uploadsDir, 'xrays');
const docsDir = path.join(uploadsDir, 'documents');
const imagesDir = path.join(uploadsDir, 'images');

// Ensure directories exist
[uploadsDir, medicalsDir, xraysDir, docsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Determine directory based on file mimetype
    if (file.mimetype.startsWith('image/')) {
      if (file.fieldname === 'xray') {
        uploadPath = xraysDir;
      } else {
        uploadPath = imagesDir;
      }
    } else if (file.mimetype === 'application/pdf' || 
              file.mimetype === 'application/msword' || 
              file.mimetype.includes('officedocument')) {
      uploadPath = docsDir;
    } else if (file.fieldname === 'medical') {
      uploadPath = medicalsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const randomName = `${Date.now()}-${randomUUID()}${fileExt}`;
    cb(null, randomName);
  }
});

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only specific file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Medical images
    'application/dicom', 'image/dicom',
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

// Set up multer middleware
export const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  }
});

// Service functions
export const fileService = {
  // Save uploaded file metadata to database
  async saveFileMetadata(fileData: InsertFile): Promise<File> {
    return storage.createFile(fileData);
  },
  
  // Retrieve file by ID with visibility check
  async getFileById(id: number, userId: number, userRole: string): Promise<File | undefined> {
    const file = await storage.getFile(id);
    
    if (!file) return undefined;
    
    // Check visibility permissions
    if (this.canAccessFile(file, userId, userRole)) {
      return file;
    }
    
    return undefined;
  },
  
  // Get files for a treatment plan
  async getFilesByTreatmentPlanId(treatmentPlanId: number, userId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByTreatmentPlanId(treatmentPlanId);
    return files.filter(file => this.canAccessFile(file, userId, userRole));
  },
  
  // Get files for a booking
  async getFilesByBookingId(bookingId: number, userId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByBookingId(bookingId);
    return files.filter(file => this.canAccessFile(file, userId, userRole));
  },
  
  // Get files for a quote request (e.g., x-rays)
  async getFilesByQuoteRequestId(quoteRequestId: number, userId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByQuoteRequestId(quoteRequestId);
    return files.filter(file => this.canAccessFile(file, userId, userRole));
  },
  
  // Get files uploaded by a user
  async getFilesByUserId(userId: number, requestingUserId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByUserId(userId);
    return files.filter(file => this.canAccessFile(file, requestingUserId, userRole));
  },
  
  // Delete a file (both DB record and physical file)
  async deleteFile(id: number, userId: number, userRole: string): Promise<boolean> {
    const file = await storage.getFile(id);
    
    if (!file) return false;
    
    // Check permissions (only owner, admin, or clinic staff for their clinic's files)
    if (!this.canModifyFile(file, userId, userRole)) {
      return false;
    }
    
    // Delete physical file if it exists
    if (file.fileUrl) {
      const filePath = path.join(process.cwd(), file.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete database record
    await storage.deleteFile(id);
    return true;
  },
  
  // Update file metadata
  async updateFile(id: number, updateData: Partial<File>, userId: number, userRole: string): Promise<File | undefined> {
    const file = await storage.getFile(id);
    
    if (!file) return undefined;
    
    // Check permissions
    if (!this.canModifyFile(file, userId, userRole)) {
      return undefined;
    }
    
    return storage.updateFile(id, updateData);
  },
  
  // Check if a user can access a file based on visibility and roles
  canAccessFile(file: File, userId: number, userRole: string): boolean {
    // Public files are accessible to everyone
    if (file.visibility === 'public') return true;
    
    // Admin can access all files
    if (userRole === 'admin') return true;
    
    // File owner can always access their own files
    if (file.userId === userId) return true;
    
    // Check clinic staff access (for files related to their clinic)
    if (userRole === 'clinic_staff') {
      // Check if the file is related to a booking/treatment at their clinic
      // This would require an additional DB lookup in a real implementation
      if (file.visibility === 'clinic') return true;
    }
    
    // For 'private' files, only the owner can access
    return false;
  },
  
  // Check if a user can modify a file
  canModifyFile(file: File, userId: number, userRole: string): boolean {
    // Admin can modify all files
    if (userRole === 'admin') return true;
    
    // File owner can modify their own files
    if (file.userId === userId) return true;
    
    // Clinic staff can modify files related to their clinic
    if (userRole === 'clinic_staff' && file.visibility === 'clinic') {
      // Additional check for clinic ID would be needed in a real implementation
      return true;
    }
    
    return false;
  }
};