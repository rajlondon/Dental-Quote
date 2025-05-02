import express from 'express';
import { isAuthenticated, hasRole } from '../middleware/auth';
import { z } from 'zod';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { clinics } from '@shared/schema';
import { processFileUpload, deleteFile, getFileUrl } from '../file-upload';
import { StorageType } from '../file-upload';
import { logError, ErrorSeverity } from '../services/error-logger';

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
  hasRole(['admin', 'clinic_staff']),
  isClinicAuthorized,
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

      // Check if we have files
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      // Process file upload
      const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
      
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
      
      const uploadResult = await processFileUpload(file, {
        userId: req.user.id,
        fileType: fileCategory,
        visibility: 'public',
        storageType: StorageType.AWS_S3
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
        fileUrl: uploadResult.fileUrl || getFileUrl(uploadResult),
        uploadDate: new Date().toISOString(),
        type: mediaType,
        displayOrder: 0,
        isActive: true,
        metadata: {
          mimeType: file.mimetype,
          size: file.size
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
  hasRole(['admin', 'clinic_staff']),
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
  hasRole(['admin', 'clinic_staff']),
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