/**
 * Document Service
 * 
 * Handles business logic for document management in the patient portal,
 * including CRUD operations for medical documents and secure file handling.
 */

import { storage } from '../storage';
import { determineDocumentCategory, generateSampleDocuments } from '../utils/document-utils';
import { isS3Configured, uploadToS3, getS3DownloadUrl, deleteFromS3 } from './s3-service';

/**
 * Get all documents for a patient
 */
export async function getPatientDocuments(userId: number, includeSample = true) {
  try {
    // Attempt to get documents from database
    let documents = [];
    
    // Try to fetch from storage first
    try {
      // Use the existing getFilesByUserId method instead
      documents = await storage.getFilesByUserId(userId);
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
    
    return documents;
  } catch (error) {
    console.error('Error in document service:', error);
    throw error;
  }
}

/**
 * Get documents related to a specific treatment plan
 */
export async function getTreatmentPlanDocuments(treatmentPlanId: number, userId: number) {
  try {
    // Attempt to get treatment plan documents from database
    let documents = [];
    
    // Try to fetch from storage first
    try {
      documents = await storage.getFilesByTreatmentPlanId(treatmentPlanId);
    } catch (error) {
      console.error(`Failed to fetch documents for treatment plan ${treatmentPlanId}:`, error);
      // Return filtered sample data for development
      const allSamples = generateSampleDocuments(userId);
      return allSamples.filter(doc => doc.treatmentPlanId === treatmentPlanId);
    }
    
    // Enrich documents with download URLs if needed
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
    
    return documents;
  } catch (error) {
    console.error('Error fetching treatment plan documents:', error);
    throw error;
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
      fileName,
      fileKey,
      fileSize,
      fileType,
      category,
      notes: notes || null,
      treatmentPlanId: treatmentPlanId || null,
      uploadDate: new Date(),
      isSharedWithClinic: true // Default to shared with clinic
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
    const document = await storage.getDocumentById(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Security check - ensure user owns the document
    if (document.userId !== userId) {
      throw new Error('Not authorized to delete this document');
    }
    
    // Delete file from S3 or local storage
    if (document.fileKey) {
      try {
        await deleteFromS3(document.fileKey);
      } catch (error) {
        console.error('Failed to delete file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Delete document record from database
    const success = await storage.deleteDocument(documentId);
    
    return success;
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
) {
  try {
    const document = await storage.getDocumentById(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Security check - ensure user owns the document
    if (document.userId !== userId) {
      throw new Error('Not authorized to update this document');
    }
    
    // Update document
    const updatedDocument = await storage.updateDocument(documentId, updates);
    
    return updatedDocument;
  } catch (error) {
    console.error('Document update error:', error);
    throw error;
  }
}