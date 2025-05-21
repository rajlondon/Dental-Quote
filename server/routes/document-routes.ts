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
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  try {
    const userId = req.user.id;
    const file = req.file;
    const { documentType, notes } = req.body;
    
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
    
    let document;
    
    // Use S3 in production if configured
    if (isS3Configured()) {
      // Upload to S3
      const { fileKey, fileUrl } = await uploadToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        userId,
        documentType || 'medical'
      );
      
      // Create document record
      document = {
        id: uuidv4(),
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        documentType: documentType || 'medical',
        notes: notes || null,
        fileKey,
        fileUrl,
        isPublic: false,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real application, save this document to the database
      // await storage.createDocument(document);
    } else {
      // For development, save locally
      const fileId = uuidv4();
      const fileExtension = file.originalname.split('.').pop() || '';
      const fileName = `${fileId}.${fileExtension}`;
      
      // Create user-specific directory
      const userDir = path.join(uploadDir, String(userId), documentType || 'medical');
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      
      // Save file
      const filePath = path.join(userDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      
      // Create document record
      document = {
        id: fileId,
        userId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        documentType: documentType || 'medical',
        notes: notes || null,
        filePath: `/uploads/${userId}/${documentType || 'medical'}/${fileName}`,
        isPublic: false,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
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
    
    // For development, get from sample documents
    const sampleDocuments = generateSampleDocuments(userId);
    const document = sampleDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Generate download URL if S3 is configured
    let documentWithUrl = { ...document };
    if (isS3Configured() && document.fileKey) {
      try {
        const fileUrl = await getS3DownloadUrl(document.fileKey);
        documentWithUrl.fileUrl = fileUrl;
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
    
    // For development
    // In production, this would delete from S3 and the database
    
    return res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
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
    const planId = req.params.planId;
    
    // For development, get subset of sample documents
    const sampleDocuments = generateSampleDocuments(userId);
    const documents = sampleDocuments.slice(0, 2); // Just use first two samples for this plan
    
    // Generate download URLs if S3 is configured
    let documentsWithUrls = [...documents];
    if (isS3Configured()) {
      documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
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
    }
    
    return res.json({
      success: true,
      documents: documentsWithUrls
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