import express, { Request, Response } from "express";
import { csrfProtection, uploadRateLimit } from "../middleware/security";
import { ensureAuthenticated, checkRole } from "../middleware/auth";
import { upload, handleUploadError, processUploadedFile, type UploadedFile, StorageType } from "../file-upload";
import { logError, ErrorSeverity } from "../services/error-logger";
import { listS3Files, getSignedS3Url } from "../services/cloud-storage";
import { db } from "../db";
import { parse } from "path";

const router = express.Router();

// General file upload endpoint
router.post("/upload", uploadRateLimit, ensureAuthenticated, upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const category = req.body.category || 'document';
    const patientId = req.body.patientId;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file provided"
      });
    }

    console.log(`Processing file upload: ${file.originalname}, Category: ${category}`);
    console.log(`Storage active type: ${StorageType[StorageType.AWS_S3]} vs ${process.env.NODE_ENV}`);
    
    // Process the file (handles S3 upload if configured)
    const processedFile = await processUploadedFile(file);
    
    console.log(`File processed successfully. Storage type: ${processedFile.storageType}`);
    console.log(`File URL: ${processedFile.url || 'local file'}`);
    
    // Return the file information
    res.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        filename: processedFile.filename,
        originalname: processedFile.originalname,
        url: processedFile.url || `/uploads/${processedFile.category}/${processedFile.filename}`,
        mimetype: processedFile.mimetype,
        size: processedFile.size,
        category: processedFile.category || category,
        patientId: patientId,
        storageType: processedFile.storageType,
        key: processedFile.key // Include the S3 key for reference
      }
    });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'FileUpload',
      operation: 'UploadFile',
      user: req.user?.id
    }, ErrorSeverity.ERROR);
    
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Endpoint to upload message attachments
router.post("/upload-message-attachment", uploadRateLimit, ensureAuthenticated, upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file provided"
      });
    }

    console.log(`Processing message attachment upload: ${file.originalname}`);
    
    // Process the file (handles S3 upload if configured)
    const processedFile = await processUploadedFile(file);
    
    console.log(`File processed successfully. Storage type: ${processedFile.storageType}`);
    console.log(`File URL: ${processedFile.url || 'local file'}`);
    
    // Return the file information
    res.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        filename: processedFile.filename,
        originalname: processedFile.originalname,
        url: processedFile.url || `/uploads/${processedFile.category}/${processedFile.filename}`,
        mimetype: processedFile.mimetype,
        size: processedFile.size,
        category: processedFile.category,
        storageType: processedFile.storageType
      }
    });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'FileUpload',
      operation: 'UploadMessageAttachment',
      user: req.user?.id
    }, ErrorSeverity.ERROR);
    
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// List uploaded files for the current user or all files for admin/clinic
router.get("/list", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const fileType = req.query.type as string || 'all';
    const patientId = req.query.patientId as string;
    const isAdmin = req.user?.role === 'admin';
    const isClinic = req.user?.role === 'clinic';
    
    // If the user is admin or clinic, they can view all files
    // Otherwise, users can only view their own files
    if (!isAdmin && !isClinic && patientId && patientId !== req.user?.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to patient files"
      });
    }
    
    // List files from S3 if in production or files exist there
    try {
      // For production, always try to list from S3 first
      const prefix = patientId ? `patient-${patientId}/` : '';
      let s3Files: any[] = [];
      
      // Add type filtering if needed
      let s3Prefix = prefix;
      if (fileType && fileType !== 'all') {
        s3Prefix = fileType + '-';
      }
      
      const s3Keys = await listS3Files(s3Prefix);
      
      if (s3Keys.length > 0) {
        // Process the S3 files
        s3Files = await Promise.all(s3Keys.map(async (key) => {
          // Parse important information from the key
          // Format: [type]-[timestamp]-[randomhash].[extension]
          const filename = key.split('/').pop() || '';
          const parts = filename.split('-');
          
          // Skip files that don't match our naming pattern
          if (parts.length < 3) return null;
          
          const fileType = parts[0];
          // The remaining might include the timestamp and random hash
          const fileTimeParts = parts.slice(1).join('-').split('.');
          const extension = fileTimeParts.pop() || '';
          const fileTime = fileTimeParts.join('.');
          
          // Generate a signed URL
          const url = await getSignedS3Url(key, 3600);
          
          return {
            key,
            filename,
            originalname: filename,
            type: extension,
            category: fileType,
            url,
            uploaded: new Date(parseInt(parts[1]) || Date.now()).toISOString(),
            storageType: 'aws-s3'
          };
        }));
        
        // Filter out any null values
        s3Files = s3Files.filter(Boolean);
      }
      
      return res.json({
        success: true,
        message: "File list retrieved from S3",
        files: s3Files,
        source: "s3"
      });
    } catch (error) {
      console.error("Error listing S3 files:", error);
      // Fallback to local files
      return res.json({
        success: true,
        message: "Local file listing is not fully implemented",
        files: [],
        source: "local"
      });
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'FileRoutes',
      operation: 'ListFiles',
      user: req.user?.id
    }, ErrorSeverity.ERROR);
    
    res.status(500).json({
      success: false,
      message: "Failed to list files",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get a specific file by key (for S3) or path (for local)
router.get("/get/:fileKey", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const fileKey = req.params.fileKey;
    
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        message: "No file key provided"
      });
    }
    
    // Get S3 signed URL for the file
    const url = await getSignedS3Url(fileKey, 3600);
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "File not found or URL could not be generated"
      });
    }
    
    // Return the signed URL
    res.json({
      success: true,
      message: "File URL generated",
      url
    });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'FileRoutes',
      operation: 'GetFile',
      user: req.user?.id,
      fileKey: req.params.fileKey
    }, ErrorSeverity.ERROR);
    
    res.status(500).json({
      success: false,
      message: "Failed to get file URL",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// List patient files (clinic access only)
router.get("/patient/:patientId", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const patientId = req.params.patientId;
    const isClinic = req.user?.role === 'clinic';
    const isAdmin = req.user?.role === 'admin';
    
    // Only clinic staff or admins can access patient files
    if (!isClinic && !isAdmin && patientId !== req.user?.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to patient files"
      });
    }
    
    // For actual implementation, this would query the database
    // to get files associated with the patient
    
    // List files from S3 with patient prefix
    const prefix = `patient-${patientId}/`;
    let s3Files: any[] = [];
    
    try {
      const s3Keys = await listS3Files(prefix);
      
      if (s3Keys.length > 0) {
        // Process the S3 files
        s3Files = await Promise.all(s3Keys.map(async (key) => {
          const filename = key.split('/').pop() || '';
          const url = await getSignedS3Url(key, 3600);
          
          return {
            key,
            filename,
            url,
            uploaded: new Date().toISOString(),
            storageType: 'aws-s3'
          };
        }));
      }
      
      return res.json({
        success: true,
        message: "Patient files retrieved",
        patientId,
        files: s3Files
      });
    } catch (error) {
      console.error("Error listing patient S3 files:", error);
      return res.json({
        success: true,
        message: "No files found for patient",
        patientId,
        files: []
      });
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'FileRoutes',
      operation: 'ListPatientFiles',
      user: req.user?.id,
      patientId: req.params.patientId
    }, ErrorSeverity.ERROR);
    
    res.status(500).json({
      success: false,
      message: "Failed to list patient files",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;