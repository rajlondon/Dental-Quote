import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    if (await this.canAccessFile(file, userId, userRole)) {
      return file;
    }
    
    return undefined;
  },
  
  // Get files for a treatment plan
  async getFilesByTreatmentPlanId(treatmentPlanId: number, userId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByTreatmentPlanId(treatmentPlanId);
    
    // Check permissions for each file using Promise.all
    const accessibleFiles = await Promise.all(
      files.map(async (file) => {
        const canAccess = await this.canAccessFile(file, userId, userRole);
        return canAccess ? file : null;
      })
    );
    
    // Filter out null entries (files user can't access)
    return accessibleFiles.filter((file): file is File => file !== null);
  },
  
  // Get files for a booking
  async getFilesByBookingId(bookingId: number, userId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByBookingId(bookingId);
    
    // Check permissions for each file using Promise.all
    const accessibleFiles = await Promise.all(
      files.map(async (file) => {
        const canAccess = await this.canAccessFile(file, userId, userRole);
        return canAccess ? file : null;
      })
    );
    
    // Filter out null entries (files user can't access)
    return accessibleFiles.filter((file): file is File => file !== null);
  },
  
  // Get files for a quote request (e.g., x-rays)
  async getFilesByQuoteRequestId(quoteRequestId: number, userId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByQuoteRequestId(quoteRequestId);
    
    // Check permissions for each file using Promise.all
    const accessibleFiles = await Promise.all(
      files.map(async (file) => {
        const canAccess = await this.canAccessFile(file, userId, userRole);
        return canAccess ? file : null;
      })
    );
    
    // Filter out null entries (files user can't access)
    return accessibleFiles.filter((file): file is File => file !== null);
  },
  
  // Get files uploaded by a user
  async getFilesByUserId(userId: number, requestingUserId: number, userRole: string): Promise<File[]> {
    const files = await storage.getFilesByUserId(userId);
    
    // Check permissions for each file using Promise.all
    const accessibleFiles = await Promise.all(
      files.map(async (file) => {
        const canAccess = await this.canAccessFile(file, requestingUserId, userRole);
        return canAccess ? file : null;
      })
    );
    
    // Filter out null entries (files user can't access)
    return accessibleFiles.filter((file): file is File => file !== null);
  },
  
  // Delete a file (both DB record and physical file)
  async deleteFile(id: number, userId: number, userRole: string): Promise<boolean> {
    const file = await storage.getFile(id);
    
    if (!file) return false;
    
    // Check permissions (only owner, admin, or clinic staff for their clinic's files)
    const canModify = await this.canModifyFile(file, userId, userRole);
    if (!canModify) {
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
    const canModify = await this.canModifyFile(file, userId, userRole);
    if (!canModify) {
      return undefined;
    }
    
    return storage.updateFile(id, updateData);
  },
  
  // Enhanced file access checking with proper treatment plan permissions
  async canAccessFile(file: File, userId: number, userRole: string): Promise<boolean> {
    // Public files are accessible to everyone
    if (file.visibility === 'public') return true;
    
    // Admin can access all files
    if (userRole === 'admin') return true;
    
    // File owner can always access their own files
    if (file.userId === userId) return true;
    
    // Check clinic staff access (for files related to their clinic)
    if (userRole === 'clinic_staff') {
      // If file is marked for clinic visibility, likely accessible
      if (file.visibility === 'clinic') {
        // For treatment plan files, verify it's at the staff's clinic
        if (file.treatmentPlanId) {
          const treatmentPlan = await storage.getTreatmentPlan(file.treatmentPlanId);
          // Added proper clinic staff permission check
          return treatmentPlan ? treatmentPlan.clinicId === userId : false;
        }
        return true;
      }
    }
    
    // If file belongs to a treatment plan, check if user is the patient
    if (file.treatmentPlanId && userRole === 'patient') {
      const treatmentPlan = await storage.getTreatmentPlan(file.treatmentPlanId);
      return treatmentPlan ? treatmentPlan.patientId === userId : false;
    }
    
    // For 'private' files, only the owner can access
    return false;
  },
  
  // Enhanced file modification permissions
  async canModifyFile(file: File, userId: number, userRole: string): Promise<boolean> {
    // Admin can modify all files
    if (userRole === 'admin') return true;
    
    // File owner can modify their own files
    if (file.userId === userId) return true;
    
    // Clinic staff can modify files related to their clinic
    if (userRole === 'clinic_staff') {
      // For treatment plan files, verify it's at the staff's clinic
      if (file.treatmentPlanId) {
        const treatmentPlan = await storage.getTreatmentPlan(file.treatmentPlanId);
        return treatmentPlan ? treatmentPlan.clinicId === userId : false;
      }
      
      // For general clinic visibility files
      if (file.visibility === 'clinic') return true;
    }
    
    return false;
  }
};