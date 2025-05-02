import express from 'express';
import { isAuthenticated, ensureRole } from '../middleware/auth';
import { z } from 'zod';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { clinics } from '@shared/schema';
import multer from 'multer';
import { upload, handleUploadError, StorageType } from '../file-upload';
import { logError, ErrorSeverity } from '../services/error-logger';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 bucket name
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'mydentalfly-documents-prod';

// Setup multer file upload middleware
const uploadMiddleware = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Helper functions for file operations
// Upload file to S3
async function uploadToS3(
  file: Express.Multer.File, 
  key: string, 
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });
    
    await s3Client.send(command);
    
    // Generate URL for the uploaded file
    return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Delete file from S3
async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error(`Failed to delete from S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Process file upload
async function processFileUpload(
  file: Express.Multer.File,
  options: {
    userId: number;
    fileType: string;
    visibility: 'public' | 'private';
  }
): Promise<{
  filename: string;
  fileUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
}> {
  // Generate unique filename
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(file.originalname).toLowerCase();
  const filename = `${options.fileType}_${options.userId}_${randomString}${extension}`;
  
  // Upload to S3
  const fileUrl = await uploadToS3(file, filename, file.mimetype);
  
  return {
    filename,
    fileUrl,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  };
}

// Delete file
async function deleteFile(filename: string): Promise<void> {
  await deleteFromS3(filename);
}

// Get file URL
function getFileUrl(file: { filename: string }): string {
  return `https://${S3_BUCKET}.s3.amazonaws.com/${file.filename}`;
}

/**
 * Clinic media routes for handling before/after images, clinic tours, and testimonial videos
 */
const router = express.Router();

// Media types
export enum MediaType {
  BEFORE_AFTER = 'before_after',
  CLINIC_TOUR = 'clinic_tour',
  TESTIMONIAL = 'testimonial'
}

// Media item schema
const mediaItemSchema = z.object({
  id: z.string(),
  title: z.string().max(100),
  description: z.string().optional(),
  fileUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  uploadDate: z.string().or(z.date()),
  type: z.string(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

type MediaItem = z.infer<typeof mediaItemSchema>;

// Middleware to check if the user is authorized to access the clinic
const isClinicAuthorized = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Allow admin to access any clinic
  if (req.user?.role === 'admin') {
    return next();
  }
  
  // For clinic staff, check if they belong to the clinic
  if (req.user?.role === 'clinic_staff') {
    const clinicId = parseInt(req.params.clinicId);
    
    // If the user is assigned to this clinic or it's their own clinic
    if (req.user.clinicId === clinicId) {
      return next();
    }
  }
  
  // Not authorized
  return res.status(403).json({
    success: false,
    message: 'You are not authorized to access this clinic data'
  });
};

// Get all media for a clinic
router.get('/:clinicId/media/:mediaType', 
  isAuthenticated,
  async (req, res) => {
    try {
      const clinicId = parseInt(req.params.clinicId);
      const mediaType = req.params.mediaType as MediaType;
      
      // Validate media type
      if (!Object.values(MediaType).includes(mediaType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid media type'
        });
      }
      
      // Get clinic
      const clinic = await db.query.clinics.findFirst({
        where: eq(clinics.id, clinicId)
      });
      
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
      }
      
      // Get media based on type
      let mediaItems: any[] = [];
      
      if (mediaType === MediaType.BEFORE_AFTER) {
        mediaItems = clinic.beforeAfterImages as any[] || [];
      } else if (mediaType === MediaType.CLINIC_TOUR) {
        mediaItems = clinic.clinicTourVideos as any[] || [];
      } else if (mediaType === MediaType.TESTIMONIAL) {
        mediaItems = clinic.testimonialVideos as any[] || [];
      }
      
      return res.json({
        success: true,
        media: mediaItems
      });
    } catch (error) {
      console.error('Error getting clinic media:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get clinic media'
      });
    }
  }
);

// Upload media for a clinic
router.post('/:clinicId/media/:mediaType',
  isAuthenticated,
  ensureRole(['admin', 'clinic_staff']),
  isClinicAuthorized,
  upload.single('file'),
  async (req, res) => {
    try {
      const clinicId = parseInt(req.params.clinicId);
      const mediaType = req.params.mediaType as MediaType;
      const { title, description } = req.body;
      
      // Validate media type
      if (!Object.values(MediaType).includes(mediaType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid media type'
        });
      }

      // Check if we have a file
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Determine file category based on media type
      let fileCategory;
      switch (mediaType) {
        case MediaType.BEFORE_AFTER:
          fileCategory = 'beforeAfter';
          break;
        case MediaType.CLINIC_TOUR:
          fileCategory = 'clinicTour';
          break;
        case MediaType.TESTIMONIAL:
          fileCategory = 'testimonial';
          break;
        default:
          fileCategory = 'clinicMedia';
      }
      
      const uploadResult = await processFileUpload(req.file, {
        userId: req.user?.id || 0,
        fileType: fileCategory,
        visibility: 'public'
      });
      
      if (!uploadResult) {
        return res.status(500).json({
          success: false,
          message: 'File upload failed'
        });
      }
      
      // Get clinic
      const clinic = await db.query.clinics.findFirst({
        where: eq(clinics.id, clinicId)
      });
      
      if (!clinic) {
        // Remove the uploaded file since we can't associate it
        await deleteFile(uploadResult.filename);
        
        return res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
      }
      
      // Create new media item
      const newMediaItem: MediaItem = {
        id: uploadResult.filename,
        title: title || 'Untitled',
        description: description || '',
        fileUrl: uploadResult.fileUrl,
        uploadDate: new Date().toISOString(),
        type: mediaType,
        displayOrder: 0,
        isActive: true,
        metadata: {
          mimeType: req.file.mimetype,
          size: req.file.size
        }
      };
      
      // Update clinic with new media item
      let existingMedia: any[] = [];
      let updateData: any = {};
      
      if (mediaType === MediaType.BEFORE_AFTER) {
        existingMedia = clinic.beforeAfterImages as any[] || [];
        updateData.beforeAfterImages = [...existingMedia, newMediaItem];
      } else if (mediaType === MediaType.CLINIC_TOUR) {
        existingMedia = clinic.clinicTourVideos as any[] || [];
        updateData.clinicTourVideos = [...existingMedia, newMediaItem];
      } else if (mediaType === MediaType.TESTIMONIAL) {
        existingMedia = clinic.testimonialVideos as any[] || [];
        updateData.testimonialVideos = [...existingMedia, newMediaItem];
      }
      
      // Update clinic
      await db.update(clinics)
        .set(updateData)
        .where(eq(clinics.id, clinicId));
      
      return res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        media: newMediaItem
      });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'ClinicMediaRoutes',
        operation: 'uploadMedia',
        userId: req.user?.id
      }, ErrorSeverity.ERROR);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to upload media'
      });
    }
  }
);

// Delete media item
router.delete('/:clinicId/media/:mediaType/:mediaId',
  isAuthenticated,
  ensureRole(['admin', 'clinic_staff']),
  isClinicAuthorized,
  async (req, res) => {
    try {
      const clinicId = parseInt(req.params.clinicId);
      const mediaType = req.params.mediaType as MediaType;
      const mediaId = req.params.mediaId;
      
      // Validate media type
      if (!Object.values(MediaType).includes(mediaType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid media type'
        });
      }
      
      // Get clinic
      const clinic = await db.query.clinics.findFirst({
        where: eq(clinics.id, clinicId)
      });
      
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
      }
      
      // Get media array based on type
      let mediaArray: any[] = [];
      let updateData: any = {};
      
      if (mediaType === MediaType.BEFORE_AFTER) {
        mediaArray = clinic.beforeAfterImages as any[] || [];
        updateData.beforeAfterImages = mediaArray.filter(item => item.id !== mediaId);
      } else if (mediaType === MediaType.CLINIC_TOUR) {
        mediaArray = clinic.clinicTourVideos as any[] || [];
        updateData.clinicTourVideos = mediaArray.filter(item => item.id !== mediaId);
      } else if (mediaType === MediaType.TESTIMONIAL) {
        mediaArray = clinic.testimonialVideos as any[] || [];
        updateData.testimonialVideos = mediaArray.filter(item => item.id !== mediaId);
      }
      
      // Find the item to delete
      const mediaItem = mediaArray.find(item => item.id === mediaId);
      
      if (!mediaItem) {
        return res.status(404).json({
          success: false,
          message: 'Media item not found'
        });
      }
      
      // Try to delete the actual file
      try {
        await deleteFile(mediaId);
      } catch (fileError) {
        console.warn('Failed to delete media file:', fileError);
        // Continue with removing the reference even if file deletion fails
      }
      
      // Update clinic
      await db.update(clinics)
        .set(updateData)
        .where(eq(clinics.id, clinicId));
      
      return res.json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'ClinicMediaRoutes',
        operation: 'deleteMedia',
        userId: req.user?.id
      }, ErrorSeverity.ERROR);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to delete media'
      });
    }
  }
);

// Update media item details
router.patch('/:clinicId/media/:mediaType/:mediaId',
  isAuthenticated,
  ensureRole(['admin', 'clinic_staff']),
  isClinicAuthorized,
  async (req, res) => {
    try {
      const clinicId = parseInt(req.params.clinicId);
      const mediaType = req.params.mediaType as MediaType;
      const mediaId = req.params.mediaId;
      const updates = req.body;
      
      // Validate media type
      if (!Object.values(MediaType).includes(mediaType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid media type'
        });
      }
      
      // Get clinic
      const clinic = await db.query.clinics.findFirst({
        where: eq(clinics.id, clinicId)
      });
      
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
      }
      
      // Get media array based on type
      let mediaArray: any[] = [];
      let updateData: any = {};
      
      if (mediaType === MediaType.BEFORE_AFTER) {
        mediaArray = clinic.beforeAfterImages as any[] || [];
      } else if (mediaType === MediaType.CLINIC_TOUR) {
        mediaArray = clinic.clinicTourVideos as any[] || [];
      } else if (mediaType === MediaType.TESTIMONIAL) {
        mediaArray = clinic.testimonialVideos as any[] || [];
      }
      
      // Find and update the item
      const updatedMediaArray = mediaArray.map(item => {
        if (item.id === mediaId) {
          return { ...item, ...updates };
        }
        return item;
      });
      
      // Prepare update data
      if (mediaType === MediaType.BEFORE_AFTER) {
        updateData.beforeAfterImages = updatedMediaArray;
      } else if (mediaType === MediaType.CLINIC_TOUR) {
        updateData.clinicTourVideos = updatedMediaArray;
      } else if (mediaType === MediaType.TESTIMONIAL) {
        updateData.testimonialVideos = updatedMediaArray;
      }
      
      // Update clinic
      await db.update(clinics)
        .set(updateData)
        .where(eq(clinics.id, clinicId));
      
      return res.json({
        success: true,
        message: 'Media updated successfully',
        media: updatedMediaArray.find(item => item.id === mediaId)
      });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        component: 'ClinicMediaRoutes',
        operation: 'updateMedia',
        userId: req.user?.id
      }, ErrorSeverity.ERROR);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update media'
      });
    }
  }
);

export default router;