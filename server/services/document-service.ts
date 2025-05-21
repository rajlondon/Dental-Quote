/**
 * Document Service
 * 
 * Handles business logic for document management in the patient portal,
 * including CRUD operations for medical documents and secure file handling.
 */

import { storage } from '../storage';
import { determineDocumentCategory, generateSampleDocuments } from '../utils/document-utils';
import { isS3Configured, uploadToS3, getS3DownloadUrl, deleteFromS3 } from './s3-service';
import { files } from '@shared/schema';

// Define the document type that we're using throughout this service
export interface DocumentFile {
  id: number;
  userId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileKey?: string;
  fileUrl?: string;
  category: string;
  notes?: string | null;
  description?: string | null;
  uploadDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  treatmentPlanId?: number | null;
  isSharedWithClinic?: boolean;
  visibility?: string;
  fileCategory?: string;
  downloadUrl?: string | null;
  mimetype?: string;
  originalName?: string;
}

/**
 * Get all documents for a patient
 */
export async function getPatientDocuments(userId: number, includeSample = true): Promise<DocumentFile[]> {
  try {
    // Attempt to get documents from database
    let documents: DocumentFile[] = [];
    
    // Try to fetch from storage first
    try {
      // Use the existing getFilesByUserId method instead
      const files = await storage.getFilesByUserId(userId);
      
      // Map database records to our DocumentFile interface
      documents = files.map(file => ({
        id: file.id,
        userId: file.userId,
        fileName: file.filename || file.originalName || "Unknown Document",
        fileSize: file.fileSize || 0,
        fileType: file.mimetype || file.fileType || "application/octet-stream",
        fileKey: file.fileUrl, // Use fileUrl as the S3 key
        fileUrl: file.fileUrl,
        category: file.fileCategory || "other",
        notes: file.description || null,
        description: file.description || null,
        uploadDate: file.createdAt,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        treatmentPlanId: file.treatmentPlanId || null,
        isSharedWithClinic: file.visibility === "clinic",
        visibility: file.visibility || "private",
        fileCategory: file.fileCategory || null,
        downloadUrl: null, // Will be set below
        mimetype: file.mimetype,
        originalName: file.originalName
      }));
    } catch (error) {
      console.error('Failed to fetch documents from storage:', error);
      // If storage method doesn't exist yet, return sample data for development
      if (includeSample) {
        return generateSampleDocuments(userId);
      }
    }
    
    if (documents.length === 0 && includeSample) {
      // If no documents found, generate sample data for development
      return generateSampleDocuments(userId);
    }
    
    // Enrich documents with download URLs if needed
    if (isS3Configured()) {
      for (const doc of documents) {
        if (doc.fileKey && !doc.downloadUrl) {
          try {
            doc.downloadUrl = await getS3DownloadUrl(doc.fileKey);
          } catch (error) {
            console.error(`Failed to generate download URL for document ${doc.id}:`, error);
            doc.downloadUrl = null;
          }
        }
      }
    }
    
    return documents;
  } catch (error) {
    console.error('Error in document service:', error);
    throw new Error('Failed to retrieve patient documents');
  }
}

/**
 * Get documents related to a specific treatment plan
 */
export async function getTreatmentPlanDocuments(treatmentPlanId: number, userId: number): Promise<DocumentFile[]> {
  try {
    // Attempt to get treatment plan documents from database
    let documents: DocumentFile[] = [];
    
    // Try to fetch from storage first
    try {
      const files = await storage.getFilesByTreatmentPlanId(treatmentPlanId);
      
      // Map database records to our DocumentFile interface
      documents = files.map(file => ({
        id: file.id,
        userId: file.userId,
        fileName: file.filename || file.originalName || "Unknown Document",
        fileSize: file.fileSize || 0,
        fileType: file.mimetype || file.fileType || "application/octet-stream",
        fileKey: file.fileUrl, // Use fileUrl as the S3 key
        fileUrl: file.fileUrl,
        category: file.fileCategory || "other",
        notes: file.description || null,
        description: file.description || null,
        uploadDate: file.createdAt,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        treatmentPlanId: file.treatmentPlanId || null,
        isSharedWithClinic: file.visibility === "clinic",
        visibility: file.visibility || "private",
        fileCategory: file.fileCategory || null,
        downloadUrl: null, // Will be set below
        mimetype: file.mimetype,
        originalName: file.originalName
      }));
    } catch (error) {
      console.error(`Failed to fetch documents for treatment plan ${treatmentPlanId}:`, error);
      // Return filtered sample data for development
      const allSamples = generateSampleDocuments(userId);
      return allSamples.filter(doc => doc.treatmentPlanId === treatmentPlanId);
    }
    
    // Enrich documents with download URLs if needed
    if (isS3Configured()) {
      for (const doc of documents) {
        if (doc.fileKey && !doc.downloadUrl) {
          try {
            doc.downloadUrl = await getS3DownloadUrl(doc.fileKey);
          } catch (error) {
            console.error(`Failed to generate download URL for document ${doc.id}:`, error);
            doc.downloadUrl = null;
          }
        }
      }
    }
    
    return documents;
  } catch (error) {
    console.error('Error fetching treatment plan documents:', error);
    throw new Error(`Failed to retrieve documents for treatment plan ${treatmentPlanId}`);
  }
}

/**
 * Create a new document
 */
export async function createDocument(data: {
  userId: number;
  fileName: string;
  fileBuffer: Buffer;
  fileSize: number;
  fileType: string;
  documentType?: string;
  notes?: string;
  treatmentPlanId?: number;
}) {
  try {
    const {
      userId,
      fileName,
      fileBuffer,
      fileSize,
      fileType,
      documentType,
      notes,
      treatmentPlanId
    } = data;
    
    // Determine document category
    const category = determineDocumentCategory(fileName, documentType);
    
    // Upload file to S3 (or local filesystem if S3 not configured)
    let fileKey;
    try {
      fileKey = await uploadToS3(fileBuffer, fileName, fileType);
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw new Error('Document upload failed');
    }
    
    // Create document record in database
    const documentData = {
      userId,
      filename: fileName, // Match the field name to what the files table expects
      originalName: fileName,
      mimetype: fileType,
      fileType: category,
      fileCategory: category,
      fileSize,
      fileUrl: fileKey, // Store the S3 key in the fileUrl field
      description: notes || null,
      treatmentPlanId: treatmentPlanId || null,
      visibility: 'clinic', // Default to shared with clinic
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let document;
    try {
      document = await storage.createFile(documentData);
    } catch (error) {
      console.error('Failed to create document record:', error);
      
      // If database insert fails, delete the uploaded file
      try {
        await deleteFromS3(fileKey);
      } catch (deleteError) {
        console.error('Failed to delete file after database error:', deleteError);
      }
      
      throw new Error('Failed to save document information');
    }
    
    // Generate download URL for the created document
    try {
      document.downloadUrl = await getS3DownloadUrl(fileKey);
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      document.downloadUrl = null;
    }
    
    return document;
  } catch (error) {
    console.error('Document creation error:', error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string, userId: number) {
  try {
    const document = await storage.getFile(parseInt(documentId));
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Security check - ensure user owns the document
    if (document.userId !== userId) {
      throw new Error('Not authorized to delete this document');
    }
    
    // Delete file from S3 or local storage
    if (document.fileUrl) {
      try {
        // Extract the file key from the URL if possible
        const urlParts = document.fileUrl.split('/');
        const fileKey = urlParts[urlParts.length - 1];
        
        await deleteFromS3(fileKey);
      } catch (error) {
        console.error('Failed to delete file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Delete document record from database
    await storage.deleteFile(parseInt(documentId));
    
    return true;
  } catch (error) {
    console.error('Document deletion error:', error);
    throw error;
  }
}

/**
 * Update document metadata
 */
export async function updateDocumentMetadata(
  documentId: string,
  userId: number,
  updates: {
    notes?: string;
    category?: string;
    isSharedWithClinic?: boolean;
    treatmentPlanId?: number | null;
  }
): Promise<DocumentFile> {
  try {
    const document = await storage.getFile(parseInt(documentId));
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Security check - ensure user owns the document
    if (document.userId !== userId) {
      throw new Error('Not authorized to update this document');
    }
    
    // Prepare updates in the format expected by the storage layer
    const fileUpdates: Record<string, any> = {};
    
    if (updates.notes) {
      fileUpdates.description = updates.notes;
    }
    
    if (updates.category) {
      fileUpdates.fileCategory = updates.category;
    }
    
    if (updates.treatmentPlanId !== undefined) {
      fileUpdates.treatmentPlanId = updates.treatmentPlanId;
    }
    
    if (updates.isSharedWithClinic !== undefined) {
      fileUpdates.visibility = updates.isSharedWithClinic ? 'clinic' : 'private';
    }
    
    // Update document
    const updated = await storage.updateFile(parseInt(documentId), fileUpdates);
    
    // Convert to DocumentFile format
    const updatedDocument: DocumentFile = {
      id: updated.id,
      userId: updated.userId,
      fileName: updated.filename || updated.originalName || "Unknown Document",
      fileSize: updated.fileSize || 0,
      fileType: updated.mimetype || updated.fileType || "application/octet-stream",
      fileKey: updated.fileUrl,
      fileUrl: updated.fileUrl,
      category: updated.fileCategory || "other",
      notes: updated.description || null,
      description: updated.description || null,
      uploadDate: updated.createdAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      treatmentPlanId: updated.treatmentPlanId || null,
      isSharedWithClinic: updated.visibility === "clinic",
      visibility: updated.visibility || "private",
      fileCategory: updated.fileCategory || null,
      downloadUrl: null
    };
    
    // Generate download URL if possible
    if (isS3Configured() && updatedDocument.fileKey) {
      try {
        updatedDocument.downloadUrl = await getS3DownloadUrl(updatedDocument.fileKey);
      } catch (downloadError) {
        console.error('Failed to generate download URL:', downloadError);
      }
    }
    
    return updatedDocument;
  } catch (error) {
    console.error('Document update error:', error);
    throw new Error('Failed to update document metadata');
  }
}