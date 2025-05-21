/**
 * Document Routes
 * 
 * Handles the API routes for document management in the patient portal,
 * including secure file uploads and retrieval for medical documents.
 */

import express from 'express';
import multer from 'multer';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
// Import from s3-service.ts without the .js extension
import { isS3Configured, uploadToS3, getS3DownloadUrl, deleteFromS3 } from '../services/s3-service';
import { validateDocument, generateSampleDocuments, determineDocumentCategory } from '../utils/document-utils';
import { getPatientDocuments, createDocument, deleteDocument, updateDocumentMetadata, getTreatmentPlanDocuments } from '../services/document-service';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const memStorage = multer.memoryStorage();
const upload = multer({ 
  storage: memStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Ensure upload directory exists for development
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Get all documents for the authenticated patient
 */
router.get('/', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    
    // Use the document service to get documents with download URLs
    let documents = await getPatientDocuments(userId, true);
    
    // Generate download URLs for documents if S3 is configured
    if (isS3Configured()) {
      try {
        documents = await Promise.all(
          documents.map(async (doc) => {
            // Only process documents with a fileKey
            if (doc.fileKey) {
              try {
                const fileUrl = await getS3DownloadUrl(doc.fileKey);
                return { ...doc, fileUrl };
              } catch (error) {
                console.error(`Error generating download URL for document ${doc.id}:`, error);
                return doc;
              }
            }
            return doc;
          })
        );
      } catch (error) {
        console.error('Error generating download URLs:', error);
      }
    }
    
    // Return the documents
    return res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

/**
 * Upload a new document
 * Route handles both /upload and /patient/documents/upload endpoints
 */
router.post(['/upload', '/patient/documents/upload'], upload.single('file'), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    const file = req.file;
    const { documentType, notes, treatmentPlanId } = req.body;
    
    console.log('Document upload request received:', {
      userId,
      fileName: file?.originalname,
      documentType,
      notes: notes || 'none',
      treatmentPlanId: treatmentPlanId || 'none'
    });
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Validate file type and size
    const validation = validateDocument(file.mimetype, file.size);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Use the document service to create the document
    const document = await createDocument({
      userId,
      fileName: file.originalname,
      fileBuffer: file.buffer,
      fileSize: file.size,
      fileType: file.mimetype,
      documentType: documentType || 'medical',
      notes: notes || null,
      treatmentPlanId: treatmentPlanId ? parseInt(treatmentPlanId) : undefined
    });
    
    return res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

/**
 * Get document details
 */
router.get('/patient/documents/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    const documentId = req.params.id;
    
    // Get the document from the database
    const document = await storage.getFile(parseInt(documentId));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Security check - ensure user owns the document
    if (document.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this document'
      });
    }
    
    // Generate download URL if S3 is configured
    let documentWithUrl = { 
      id: document.id,
      userId: document.userId,
      fileName: document.filename || document.originalName,
      fileSize: document.fileSize,
      fileType: document.mimetype || document.fileType,
      category: document.fileCategory || document.fileType,
      notes: document.description || null,
      treatmentPlanId: document.treatmentPlanId,
      uploadDate: document.createdAt,
      isSharedWithClinic: document.visibility === 'clinic',
      downloadUrl: null
    };
    
    if (isS3Configured() && document.fileUrl) {
      try {
        const downloadUrl = await getS3DownloadUrl(document.fileUrl);
        documentWithUrl.downloadUrl = downloadUrl;
      } catch (error) {
        console.error(`Error generating download URL for document ${document.id}:`, error);
      }
    }
    
    return res.json({
      success: true,
      document: documentWithUrl
    });
  } catch (error) {
    console.error(`Error fetching document:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
});

/**
 * Delete a document
 */
router.delete('/patient/documents/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    const documentId = req.params.id;
    
    // Use document service to handle deletion
    const result = await deleteDocument(documentId, userId);
    
    if (result) {
      return res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Document not found or could not be deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // Return appropriate error response based on error type
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    } else if (error.message === 'Not authorized to delete this document') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error.message
      });
    }
  }
});

/**
 * Get documents for a treatment plan
 */
router.get('/patient/treatment-plans/:planId/documents', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    const planId = parseInt(req.params.planId);
    
    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid treatment plan ID'
      });
    }
    
    // Use document service to get treatment plan documents
    const documents = await getTreatmentPlanDocuments(planId, userId);
    
    return res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error(`Error fetching treatment plan documents:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment plan documents',
      error: error.message
    });
  }
});

export default router;