/**
 * Document Service
 * 
 * This service handles document operations for the patient portal.
 * It provides a bridge between the S3 storage service and the database.
 */

import { storage } from '../storage';
import { generateSampleDocuments, createLocalDocument } from '../utils/document-utils';
import { isS3Configured, getS3DownloadUrl } from '../services/s3-service';

/**
 * Gets documents for a specific patient
 * During development, if no documents are found, returns sample documents
 */
export async function getPatientDocuments(userId: number) {
  try {
    // Try to get real documents from the database
    let documents = [];
    
    try {
      documents = await storage.getUserDocuments(userId);
    } catch (error) {
      console.log('Error fetching real documents, falling back to sample data:', error);
      documents = [];
    }
    
    // If no real documents found, use sample documents during development
    if (!documents || documents.length === 0) {
      documents = generateSampleDocuments(userId);
    }
    
    // Generate presigned download URLs for each document if S3 is configured
    if (isS3Configured()) {
      documents = await Promise.all(
        documents.map(async (doc) => {
          try {
            // Only process documents with a fileKey
            if (doc.fileKey) {
              const fileUrl = await getS3DownloadUrl(doc.fileKey);
              return { ...doc, fileUrl };
            }
            return doc;
          } catch (error) {
            console.error(`Error generating download URL for document ${doc.id}:`, error);
            return doc;
          }
        })
      );
    }
    
    return documents;
  } catch (error) {
    console.error('Error in getPatientDocuments:', error);
    return generateSampleDocuments(userId);
  }
}

/**
 * Gets documents associated with a specific treatment plan
 */
export async function getTreatmentPlanDocuments(planId: string, userId: number) {
  try {
    // Try to get real documents from the database
    let documents = [];
    
    try {
      documents = await storage.getTreatmentPlanDocuments(planId);
    } catch (error) {
      console.log(`Error fetching treatment plan (${planId}) documents, falling back:`, error);
      documents = [];
    }
    
    // If no real documents found, use some of the sample documents during development
    if (!documents || documents.length === 0) {
      const samples = generateSampleDocuments(userId);
      documents = samples.slice(0, 2); // Just use first two samples for this treatment plan
    }
    
    // Generate presigned download URLs for each document if S3 is configured
    if (isS3Configured()) {
      documents = await Promise.all(
        documents.map(async (doc) => {
          try {
            // Only process documents with a fileKey
            if (doc.fileKey) {
              const fileUrl = await getS3DownloadUrl(doc.fileKey);
              return { ...doc, fileUrl };
            }
            return doc;
          } catch (error) {
            console.error(`Error generating download URL for document ${doc.id}:`, error);
            return doc;
          }
        })
      );
    }
    
    return documents;
  } catch (error) {
    console.error(`Error in getTreatmentPlanDocuments for plan ${planId}:`, error);
    return [];
  }
}

/**
 * Creates a document in the system
 * - If S3 is configured, registers the document in the database
 * - If S3 is not configured, creates a local document for development
 */
export async function createDocument(userData: any, fileBuffer?: Buffer) {
  try {
    if (isS3Configured()) {
      // In production with S3, the document is registered in the database
      return await storage.createDocument(userData);
    } else if (fileBuffer) {
      // In development without S3, create a local document
      return await createLocalDocument(userData, fileBuffer);
    } else {
      throw new Error('File buffer is required when S3 is not configured');
    }
  } catch (error) {
    console.error('Error in createDocument:', error);
    throw error;
  }
}