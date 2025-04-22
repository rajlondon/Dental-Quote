import express, { Request, Response } from "express";
import { csrfProtection, uploadRateLimit } from "../middleware/security";
import { ensureAuthenticated } from "../middleware/auth";
import { upload, handleUploadError, processUploadedFile, type UploadedFile, StorageType } from "../file-upload";
import { logError, ErrorSeverity } from "../services/error-logger";

const router = express.Router();

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

// List uploaded files for the current user
router.get("/list", csrfProtection, ensureAuthenticated, (req, res) => {
  // TODO: Implement file listing from database
  res.json({
    success: true,
    message: "File list",
    files: []
  });
});

export default router;