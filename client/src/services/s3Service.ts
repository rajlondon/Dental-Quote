/**
 * S3 Service for Client
 * 
 * Handles client-side functionality for uploading files to S3 via the server API,
 * retrieving document lists, and managing patient documents.
 */

import { apiRequest } from '@/lib/queryClient';

/**
 * Upload a file to S3 through the server API
 * 
 * @param file - File to upload
 * @param documentType - Type of document (x-ray, treatment-plan, medical, etc.)
 * @param notes - Optional notes about the document
 * @returns Upload result with success status and metadata
 */
export async function uploadFileToS3(
  file: File, 
  documentType: 'x-ray' | 'treatment-plan' | 'medical' | 'contract' | 'other',
  notes?: string
): Promise<{
  success: boolean;
  fileKey?: string;
  fileUrl?: string;
  error?: string;
}> {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    if (notes) {
      formData.append('notes', notes);
    }
    
    // Send the upload request
    const response = await fetch('/api/patient/documents/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }
    
    const data = await response.json();
    return {
      success: true,
      fileKey: data.document.fileKey,
      fileUrl: data.document.fileUrl || data.document.url
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return {
      success: false,
      error: error.message || 'File upload failed'
    };
  }
}

/**
 * Get all documents for the current user
 * 
 * @returns List of user documents
 */
export async function getUserDocuments(): Promise<{
  success: boolean;
  documents?: any[];
  error?: string;
}> {
  try {
    const response = await apiRequest('GET', '/api/patient/documents');
    const data = await response.json();
    
    return {
      success: data.success,
      documents: data.documents
    };
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch documents'
    };
  }
}

/**
 * Get a specific document by ID
 * 
 * @param documentId - ID of the document to retrieve
 * @returns Document details
 */
export async function getDocument(documentId: string): Promise<{
  success: boolean;
  document?: any;
  error?: string;
}> {
  try {
    const response = await apiRequest('GET', `/api/patient/documents/${documentId}`);
    const data = await response.json();
    
    return {
      success: data.success,
      document: data.document
    };
  } catch (error) {
    console.error(`Error fetching document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to fetch document'
    };
  }
}

/**
 * Delete a document by ID
 * 
 * @param documentId - ID of the document to delete
 * @returns Success status
 */
export async function deleteDocument(documentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await apiRequest('DELETE', `/api/patient/documents/${documentId}`);
    const data = await response.json();
    
    return {
      success: data.success
    };
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to delete document'
    };
  }
}

/**
 * Get all documents attached to a treatment plan
 * 
 * @param planId - ID of the treatment plan
 * @returns List of documents associated with the treatment plan
 */
export async function getTreatmentPlanDocuments(planId: string | number): Promise<{
  success: boolean;
  documents?: any[];
  error?: string;
}> {
  try {
    const response = await apiRequest('GET', `/api/patient/treatment-plans/${planId}/documents`);
    const data = await response.json();
    
    return {
      success: data.success,
      documents: data.documents
    };
  } catch (error) {
    console.error(`Error fetching documents for treatment plan ${planId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to fetch treatment plan documents'
    };
  }
}