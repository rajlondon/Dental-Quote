/**
 * Document Utilities
 * 
 * Provides helper functions for document validation, processing, and sample data generation
 * for testing the document management system.
 */

import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Allowed document types/extensions
const ALLOWED_EXTENSIONS = [
  // Images
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  // Documents
  '.pdf', '.doc', '.docx', '.txt', '.rtf',
  // Medical specific
  '.dcm', '.dicom', '.xml'
];

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates if a document meets the requirements
 */
export function validateDocument(
  fileName: string,
  fileSize: number,
  fileType: string
): { valid: boolean; message?: string } {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds the maximum allowed size of 10MB`
    };
  }

  // Check file extension
  const fileExt = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return {
      valid: false,
      message: `File type ${fileExt} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Additional validation for medical documents could be added here
  // For example, check DICOM headers, PDF structure, etc.

  return { valid: true };
}

/**
 * Determine document category based on file extension and metadata
 */
export function determineDocumentCategory(fileName: string, documentType?: string): string {
  if (documentType) {
    return documentType.toLowerCase();
  }
  
  const fileExt = path.extname(fileName).toLowerCase();
  
  // Simple categorization based on extension
  if (['.dcm', '.dicom'].includes(fileExt)) {
    return 'x-rays';
  } else if (['.pdf', '.doc', '.docx'].includes(fileExt)) {
    return 'treatment_plans';
  } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt)) {
    return 'medical';
  } else {
    return 'other';
  }
}

/**
 * Generate sample documents for development/testing
 */
export function generateSampleDocuments(userId: number, count = 5) {
  const categories = ['x-rays', 'treatment_plans', 'medical', 'other'];
  const documents = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const fileExt = category === 'x-rays' ? '.dcm' :
                   category === 'treatment_plans' ? '.pdf' :
                   category === 'medical' ? '.jpg' : '.txt';
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    documents.push({
      id: uuidv4(),
      userId,
      fileName: `Sample-${category}-${i + 1}${fileExt}`,
      fileKey: `local:sample-${category}-${i + 1}${fileExt}`, // For real S3, this would be a valid S3 key
      fileSize: Math.floor(Math.random() * 5000000) + 100000, // Random size between 100KB and 5MB
      fileType: category === 'x-rays' ? 'application/dicom' :
                category === 'treatment_plans' ? 'application/pdf' :
                category === 'medical' ? 'image/jpeg' : 'text/plain',
      category,
      notes: `Sample ${category} document for testing purposes`,
      uploadDate: createdAt,
      treatmentPlanId: category === 'treatment_plans' ? Math.floor(Math.random() * 3) + 1 : null,
      isSharedWithClinic: Math.random() > 0.5
    });
  }
  
  return documents;
}