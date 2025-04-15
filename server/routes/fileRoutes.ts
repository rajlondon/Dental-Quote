import express from 'express';
import { fileService, upload } from '../services/fileService';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  next();
};

// Middleware to check for admin or clinic_staff roles
const hasAdminOrClinicAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  
  const user = req.user as any;
  if (user.role !== 'admin' && user.role !== 'clinic_staff') {
    return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
  }
  
  next();
};

// Upload a file (with appropriate permissions)
router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const user = req.user as any;
    
    // Parse and validate request body
    const schema = z.object({
      fileType: z.string().default('document'),
      fileCategory: z.string().default('document'),
      description: z.string().optional(),
      visibility: z.enum(['private', 'clinic', 'admin', 'public']).default('private'),
      bookingId: z.string().optional(),
      quoteRequestId: z.string().optional(),
      treatmentPlanId: z.string().optional()
    });
    
    const parsedBody = schema.parse(req.body);
    
    // Get the file path relative to the app root
    const relativePath = req.file.path.split(path.join(process.cwd()))[1];
    
    // Construct the file data
    const fileData = {
      userId: user.id,
      uploadedById: user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      fileType: parsedBody.fileType,
      fileCategory: parsedBody.fileCategory,
      fileSize: req.file.size,
      fileUrl: relativePath, // Store relative path
      visibility: parsedBody.visibility,
      description: parsedBody.description,
      bookingId: parsedBody.bookingId ? parseInt(parsedBody.bookingId) : undefined,
      quoteRequestId: parsedBody.quoteRequestId ? parseInt(parsedBody.quoteRequestId) : undefined,
      treatmentPlanId: parsedBody.treatmentPlanId ? parseInt(parsedBody.treatmentPlanId) : undefined
    };
    
    // Save the file metadata to the database
    const savedFile = await fileService.saveFileMetadata(fileData);
    
    res.status(201).json(savedFile);
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Get a specific file by ID (with visibility check)
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const user = req.user as any;
    
    const file = await fileService.getFileById(fileId, user.id, user.role);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found or you do not have permission to access it' });
    }
    
    res.json(file);
  } catch (error: any) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve file information' });
  }
});

// Get all files related to a treatment plan
router.get('/treatmentPlan/:id', isAuthenticated, async (req, res) => {
  try {
    const treatmentPlanId = parseInt(req.params.id);
    const user = req.user as any;
    
    const files = await fileService.getFilesByTreatmentPlanId(treatmentPlanId, user.id, user.role);
    res.json(files);
  } catch (error: any) {
    console.error('Error retrieving treatment plan files:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve treatment plan files' });
  }
});

// Get all files related to a booking
router.get('/booking/:id', isAuthenticated, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const user = req.user as any;
    
    const files = await fileService.getFilesByBookingId(bookingId, user.id, user.role);
    res.json(files);
  } catch (error: any) {
    console.error('Error retrieving booking files:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve booking files' });
  }
});

// Get all files related to a quote request (e.g., x-rays)
router.get('/quoteRequest/:id', isAuthenticated, async (req, res) => {
  try {
    const quoteRequestId = parseInt(req.params.id);
    const user = req.user as any;
    
    const files = await fileService.getFilesByQuoteRequestId(quoteRequestId, user.id, user.role);
    res.json(files);
  } catch (error: any) {
    console.error('Error retrieving quote request files:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve quote request files' });
  }
});

// Get all files uploaded by a specific user
router.get('/user/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = req.user as any;
    
    const files = await fileService.getFilesByUserId(userId, user.id, user.role);
    res.json(files);
  } catch (error: any) {
    console.error('Error retrieving user files:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve user files' });
  }
});

// Download a file
router.get('/download/:id', isAuthenticated, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const user = req.user as any;
    
    const file = await fileService.getFileById(fileId, user.id, user.role);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found or you do not have permission to access it' });
    }
    
    // Construct the absolute path
    const filePath = path.join(process.cwd(), file.fileUrl);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set the appropriate headers
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: error.message || 'Failed to download file' });
  }
});

// Update file metadata (e.g., description, visibility)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Parse and validate request body
    const schema = z.object({
      description: z.string().optional(),
      visibility: z.enum(['private', 'clinic', 'admin', 'public']).optional(),
      fileCategory: z.string().optional(),
      fileType: z.string().optional()
    });
    
    const updateData = schema.parse(req.body);
    
    // Update the file metadata
    const updatedFile = await fileService.updateFile(fileId, updateData, user.id, user.role);
    
    if (!updatedFile) {
      return res.status(404).json({ error: 'File not found or you do not have permission to modify it' });
    }
    
    res.json(updatedFile);
  } catch (error: any) {
    console.error('Error updating file metadata:', error);
    res.status(500).json({ error: error.message || 'Failed to update file metadata' });
  }
});

// Delete a file
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const user = req.user as any;
    
    const success = await fileService.deleteFile(fileId, user.id, user.role);
    
    if (!success) {
      return res.status(404).json({ error: 'File not found or you do not have permission to delete it' });
    }
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
});

export default router;