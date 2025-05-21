/**
 * Document Utilities
 * 
 * Helper functions for document management, including validation and
 * sample document generation for development purposes.
 */

import { v4 as uuidv4 } from 'uuid';

// Define allowed document types and file formats
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/dicom',
  'application/dicom'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates if a document meets all requirements
 * 
 * @param mimeType MIME type of the document
 * @param fileSize Size of the document in bytes
 * @returns Validation result with validity and optional error message
 */
export function validateDocument(mimeType: string, fileSize: number): { valid: boolean; message?: string } {
  // Check if the file type is allowed
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      message: `Unsupported file type. Allowed types: PDF, JPEG, PNG, DICOM.`
    };
  }

  // Check if the file size is within limits
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds the maximum allowed size (10MB).`
    };
  }

  return { valid: true };
}

/**
 * Generates sample documents for development and testing
 * 
 * @param userId User ID to associate with the documents
 * @returns Array of sample documents
 */
export function generateSampleDocuments(userId: number): any[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  try {
    return [
      {
        id: uuidv4(),
        userId,
        fileName: 'panoramic-xray.jpg',
        fileType: 'image/jpeg',
        fileSize: 2.4 * 1024 * 1024,
        documentType: 'x-ray',
        notes: 'Panoramic X-ray from initial consultation',
        isPublic: false,
        uploadedAt: lastWeek.toISOString(),
        uploadedBy: 'clinic',
        fileKey: `users/${userId}/x-ray/sample-panoramic-xray.jpg`
      },
      {
        id: uuidv4(),
        userId,
        fileName: 'treatment-plan-v1.pdf',
        fileType: 'application/pdf',
        fileSize: 1.2 * 1024 * 1024,
        documentType: 'treatment-plan',
        notes: 'Initial treatment plan for dental implants and crowns',
        isPublic: false,
        uploadedAt: yesterday.toISOString(),
        uploadedBy: 'clinic',
        fileKey: `users/${userId}/treatment-plan/sample-treatment-plan.pdf`
      },
      {
        id: uuidv4(),
        userId,
        fileName: 'medical-history.pdf',
        fileType: 'application/pdf',
        fileSize: 450 * 1024,
        documentType: 'medical',
        notes: 'Completed medical history form',
        isPublic: false,
        uploadedAt: now.toISOString(),
        uploadedBy: 'patient',
        fileKey: `users/${userId}/medical/sample-medical-history.pdf`
      },
      {
        id: uuidv4(),
        userId,
        fileName: 'dental-ct-scan.dicom',
        fileType: 'application/dicom',
        fileSize: 8.5 * 1024 * 1024,
        documentType: 'x-ray',
        notes: 'Detailed CT scan for implant planning',
        isPublic: false,
        uploadedAt: yesterday.toISOString(),
        uploadedBy: 'clinic',
        fileKey: `users/${userId}/x-ray/sample-ct-scan.dicom`
      }
    ];
  } catch (error) {
    console.error('Error generating sample documents:', error);
    return [];
  }
}