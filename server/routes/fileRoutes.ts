import express, { Request, Response } from "express";
import { csrfProtection, uploadRateLimit } from "../middleware/security";
import { checkRole } from "../middleware/auth";
import { isAuthenticated } from "../middleware/auth-middleware";
import { upload, handleUploadError, processUploadedFile, type UploadedFile, StorageType, ACTIVE_STORAGE_TYPE } from "../file-upload";
import { logError, ErrorSeverity } from "../services/error-logger";
import { listS3Files, getSignedS3Url, cloudStorageConfig, isCloudStorageConfigured } from "../services/cloud-storage";
import { runAwsS3ConfigCheck } from "../aws-s3-check";
import { db } from "../db";
import { parse } from "path";

const router = express.Router();

// Test AWS S3 connection and upload capabilities
router.get("/test-s3", async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const isProd = process.env.NODE_ENV === 'production';
  
  // Only allow admin users in production
  if (isProd && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access to S3 test endpoint"
    });
  }
  
  try {
    console.log('Running AWS S3 configuration check...');
    const s3TestResult = await runAwsS3ConfigCheck();
    
    return res.json({
      success: true,
      s3TestResult,
      message: s3TestResult 
        ? "AWS S3 is properly configured and operational" 
        : "AWS S3 configuration check failed - see server logs for details"
    });
  } catch (error) {
    console.error('Error running S3 test:', error);
    return res.status(500).json({
      success: false,
      message: "Error running S3 test",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Debug endpoint to check storage configuration (admin-only in production)
router.get("/debug-storage", async (req: Request, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const isProd = process.env.NODE_ENV === 'production';
  
  // Only allow admin users in production
  if (isProd && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access to debug endpoint"
    });
  }
  
  // Check environment variables without exposing secrets
  const s3AccessKeyExists = !!process.env.S3_ACCESS_KEY;
  const s3SecretKeyExists = !!process.env.S3_SECRET_KEY;
  const awsAccessKeyExists = !!process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKeyExists = !!process.env.AWS_SECRET_ACCESS_KEY;
  const bucketNameExists = !!process.env.S3_BUCKET_NAME;
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION || process.env.AWS_REGION || 'eu-north-1';
  
  // Provide diagnostics info
  return res.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    storageConfig: {
      activeStorageType: ACTIVE_STORAGE_TYPE,
      configuredProvider: cloudStorageConfig.provider,
      isCloudStorageConfigured: isCloudStorageConfigured(),
      region
    },
    credentials: {
      s3AccessKeyExists,
      s3SecretKeyExists,
      awsAccessKeyExists,
      awsSecretKeyExists,
      bucketNameExists,
      bucketName // This is safe to expose
    }
  });
});

// General file upload endpoint
router.post("/upload", uploadRateLimit, isAuthenticated, upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
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
    console.log(`Storage active type: ${ACTIVE_STORAGE_TYPE} in ${process.env.NODE_ENV} environment`);
    console.log(`Processing upload with patientId: ${patientId || 'none'}`);
    
    // Process the file (handles S3 upload if configured) with patient ID if provided
    const processedFile = await processUploadedFile(file, patientId);
    
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
router.post("/upload-message-attachment", uploadRateLimit, isAuthenticated, upload.single('file'), handleUploadError, async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file provided"
      });
    }

    console.log(`Processing message attachment upload: ${file.originalname}`);
    
    // Process the file (handles S3 upload if configured) - no patient ID for message attachments
    const processedFile = await processUploadedFile(file, undefined);
    
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
router.get("/list", isAuthenticated, async (req: Request, res: Response) => {
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
      
      // Get all files for the current context first
      const s3Keys = await listS3Files(prefix);
      
      // We'll filter the keys on the server side based on file extension
      let filteredKeys = s3Keys;
      
      // Apply file type filtering if specified
      if (fileType && fileType !== 'all') {
        // Add debugging to see file names, extensions and matching logic
        console.log(`Filtering by file type: ${fileType}`);
        
        filteredKeys = s3Keys.filter(key => {
          const filename = key.split('/').pop() || '';
          const extension = filename.split('.').pop()?.toLowerCase() || '';
          
          // Get the category from the filename (first part before the dash)
          const fileCategory = filename.split('-')[0] || '';
          
          console.log(`File: ${filename}, Extension: ${extension}, Category: ${fileCategory}`);
          
          // Map common file type groups to their extensions
          let matches = false;
          
          switch (fileType) {
            case 'pdf':
              matches = extension === 'pdf';
              break;
            case 'image': // Updated to match client TabsTrigger value
              // Check both by extension and by category
              matches = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || fileCategory === 'image';
              break;
            case 'docx': // This matches the TabsTrigger value in the client
            case 'document':
              matches = ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension);
              break;
            case 'zip': // This matches the TabsTrigger value in the client
              matches = ['zip', 'rar', 'tar', 'gz', '7z'].includes(extension);
              break;
            case 'spreadsheet':
              matches = ['xls', 'xlsx', 'csv'].includes(extension);
              break;
            case 'presentation':
              matches = ['ppt', 'pptx'].includes(extension);
              break;
            case 'video':
              matches = ['mp4', 'mov', 'avi', 'webm'].includes(extension);
              break;
            case 'audio':
              matches = ['mp3', 'wav', 'ogg'].includes(extension);
              break;
            case 'xray':
              matches = ['dcm', 'dicom'].includes(extension);
              break;
            case 'shared':
              // This would need additional logic based on shared status
              // For now, return all files since we can't filter by shared status on the server
              matches = true;
              break;
            case 'patients':
              // This would need additional logic based on if files are assigned to patients
              // For now, return all files since we can't filter by patient assignment on the server
              matches = true;
              break;
            default:
              // For specific extensions like 'jpg', match exactly
              matches = extension === fileType.toLowerCase();
              break;
          }
          
          console.log(`  Matches ${fileType}? ${matches}`);
          return matches;
        });
      }
      
      if (filteredKeys.length > 0) {
        // Process the filtered S3 files
        s3Files = await Promise.all(filteredKeys.map(async (key) => {
          // Parse important information from the key
          const filename = key.split('/').pop() || '';
          
          // Extract extension more reliably
          const lastDotIndex = filename.lastIndexOf('.');
          const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1).toLowerCase() : '';
          
          // Parse the parts of the filename to extract metadata
          const parts = filename.split('-');
          
          // Try to get category from filename patterns
          let fileType = 'document';
          if (parts.length >= 1) {
            fileType = parts[0];
          }
          
          // More reliable date extraction
          let uploadDate = new Date();
          if (parts.length >= 2) {
            const possibleTimestamp = parseInt(parts[1]);
            if (!isNaN(possibleTimestamp) && possibleTimestamp > 1000000000) {
              uploadDate = new Date(possibleTimestamp);
            }
          }
          
          // Generate a signed URL
          const url = await getSignedS3Url(key, 3600);
          
          // Log what we found for debugging
          console.log(`File details: name=${filename}, type=${extension}, category=${fileType}`);
          
          return {
            key,
            filename,
            originalname: filename,
            type: extension,
            category: fileType,
            url,
            uploaded: uploadDate.toISOString(),
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
router.get("/get/:fileKey", isAuthenticated, async (req: Request, res: Response) => {
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
router.get("/patient/:patientId", isAuthenticated, async (req: Request, res: Response) => {
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