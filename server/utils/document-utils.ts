/**
 * Document Utilities
 * 
 * This file contains helper functions for document management
 * in the patient portal, including secure file storage with AWS S3.
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

// Supported document types
export const DOCUMENT_TYPES = ['x-ray', 'treatment-plan', 'medical', 'contract', 'other'];

// Supported document formats
export const SUPPORTED_FORMATS = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 
  // Documents
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Medical specific formats
  'application/dicom', 'image/dicom'
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface DocumentMetadata {
  userId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  notes?: string;
  patientId?: number;
  clinicId?: number;
  treatmentPlanId?: string;
  isPublic?: boolean;
}

/**
 * Creates a document record in the local storage/database during development
 * when S3 integration is not available or properly configured
 */
export async function createLocalDocument(metadata: DocumentMetadata, fileBuffer: Buffer): Promise<any> {
  try {
    // Generate a unique file key
    const fileExtension = metadata.fileName.split('.').pop() || '';
    const fileKey = `${metadata.userId}/${metadata.documentType}/${uuidv4()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', String(metadata.userId), metadata.documentType);
    fs.mkdirSync(uploadDir, { recursive: true });
    
    // Save the file locally
    const filePath = path.join(uploadDir, path.basename(fileKey));
    fs.writeFileSync(filePath, fileBuffer);
    
    // Create a document record
    const document = {
      id: uuidv4(),
      userId: metadata.userId,
      fileName: metadata.fileName,
      fileType: metadata.fileType,
      fileSize: metadata.fileSize,
      documentType: metadata.documentType,
      notes: metadata.notes || null,
      fileKey,
      filePath: `/uploads/${metadata.userId}/${metadata.documentType}/${path.basename(fileKey)}`,
      isPublic: metadata.isPublic || false,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // No need to store the temporary documents during development
    return document;
  } catch (error) {
    console.error('Error creating local document:', error);
    throw new Error(`Failed to create local document: ${error.message}`);
  }
}

/**
 * Generates sample dental documents for a specific user
 * during development when real documents are not available
 */
export function generateSampleDocuments(userId: number): any[] {
  return [
    {
      id: `sample-x-ray-${uuidv4()}`,
      userId,
      fileName: 'Panoramic X-ray.jpg',
      fileType: 'image/jpeg',
      fileSize: 2.4 * 1024 * 1024,
      documentType: 'x-ray',
      notes: 'Panoramic X-ray taken before treatment planning',
      fileKey: `${userId}/x-ray/panoramic.jpg`,
      filePath: `/uploads/sample/x-ray/panoramic.jpg`,
      isPublic: false,
      uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `sample-treatment-${uuidv4()}`,
      userId,
      fileName: 'Treatment Plan.pdf',
      fileType: 'application/pdf',
      fileSize: 1.2 * 1024 * 1024,
      documentType: 'treatment-plan',
      notes: 'Initial treatment plan for dental implants',
      fileKey: `${userId}/treatment-plan/treatment-plan.pdf`,
      filePath: `/uploads/sample/treatment-plan/treatment-plan.pdf`,
      isPublic: false,
      uploadedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `sample-medical-${uuidv4()}`,
      userId,
      fileName: 'Medical History.pdf',
      fileType: 'application/pdf',
      fileSize: 450 * 1024,
      documentType: 'medical',
      notes: 'Patient medical history and current medications',
      fileKey: `${userId}/medical/medical-history.pdf`,
      filePath: `/uploads/sample/medical/medical-history.pdf`,
      isPublic: false,
      uploadedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

/**
 * Validates if a document is of an acceptable file type and size
 */
export function validateDocument(fileType: string, fileSize: number): { valid: boolean, message?: string } {
  if (!SUPPORTED_FORMATS.includes(fileType)) {
    return {
      valid: false, 
      message: `Unsupported file type: ${fileType}. Allowed types: ${SUPPORTED_FORMATS.join(', ')}`
    };
  }
  
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  return { valid: true };
}

/**
 * Generates a file path for a document preview or thumbnail
 */
export function getDocumentPreviewPath(document: any): string {
  if (document.fileType.startsWith('image/')) {
    // For images, use the actual file
    return document.filePath;
  } else if (document.fileType === 'application/pdf') {
    // For PDFs, return a PDF icon or generate a thumbnail
    return '/images/icons/pdf-icon.png';
  } else {
    // For other document types, return a generic document icon
    return '/images/icons/document-icon.png';
  }
}