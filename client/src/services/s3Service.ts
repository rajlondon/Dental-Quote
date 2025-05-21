import { apiRequest } from '@/lib/queryClient';

// Type definitions
export interface UploadResult {
  success: boolean;
  fileKey: string;
  fileUrl: string;
  message?: string;
  error?: string;
}

export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  notes?: string;
  patientId: number;
  isPublic?: boolean;
}

// Function to generate a presigned URL for uploading files to S3
export const getPresignedUploadUrl = async (file: File, documentType: string, isPublic = false): Promise<{ presignedUrl: string, fileKey: string }> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  // Request a presigned URL from the server
  const response = await apiRequest('POST', '/api/documents/presigned-upload', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    documentType,
    isPublic
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get upload URL');
  }
  
  const data = await response.json();
  return {
    presignedUrl: data.presignedUrl,
    fileKey: data.fileKey
  };
};

// Function to upload a file to S3 using a presigned URL
export const uploadFileToS3 = async (
  file: File, 
  documentType: string, 
  notes?: string,
  isPublic = false
): Promise<UploadResult> => {
  try {
    // Step 1: Get a presigned URL from our server
    const { presignedUrl, fileKey } = await getPresignedUploadUrl(file, documentType, isPublic);
    
    // Step 2: Upload the file directly to S3 using the presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to S3: ${uploadResponse.statusText}`);
    }
    
    // Step 3: Register the upload in our database to keep track of it
    const registerResponse = await apiRequest('POST', '/api/documents/register', {
      fileKey,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      documentType,
      notes,
      isPublic
    });
    
    if (!registerResponse.ok) {
      const registerErrorData = await registerResponse.json();
      throw new Error(registerErrorData.message || 'Failed to register document');
    }
    
    const registerData = await registerResponse.json();
    
    return {
      success: true,
      fileKey,
      fileUrl: registerData.fileUrl,
      message: 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      fileKey: '',
      fileUrl: '',
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    };
  }
};

// Function to get document details
export const getDocumentDetails = async (documentId: string) => {
  const response = await apiRequest('GET', `/api/documents/${documentId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get document details');
  }
  
  return await response.json();
};

// Function to get all user documents
export const getUserDocuments = async () => {
  const response = await apiRequest('GET', '/api/documents/user');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get user documents');
  }
  
  return await response.json();
};

// Function to delete a document
export const deleteDocument = async (documentId: string) => {
  const response = await apiRequest('DELETE', `/api/documents/${documentId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete document');
  }
  
  return await response.json();
};

// Function to update document metadata
export const updateDocumentMetadata = async (documentId: string, metadata: Partial<DocumentMetadata>) => {
  const response = await apiRequest('PATCH', `/api/documents/${documentId}`, metadata);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update document metadata');
  }
  
  return await response.json();
};