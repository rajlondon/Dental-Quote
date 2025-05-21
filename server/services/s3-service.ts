/**
 * S3 Service
 * 
 * Handles AWS S3 integration for secure document storage and retrieval.
 * Used for storing sensitive medical documents like x-rays and
 * treatment plans with proper security controls.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Configure S3 client
let s3Client: S3Client | null = null;
let bucketName: string | null = null;
let bucketRegion: string | null = null;

// Initialize S3 client if credentials are available
try {
  if (process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY && 
      process.env.S3_BUCKET_NAME) {
    
    bucketName = process.env.S3_BUCKET_NAME;
    bucketRegion = process.env.AWS_REGION || 'eu-west-2';
    
    s3Client = new S3Client({
      region: bucketRegion,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log('S3 client initialized successfully');
  } else {
    console.log('S3 client not initialized - environment variables missing');
  }
} catch (error) {
  console.error('Error initializing S3 client:', error);
}

/**
 * Checks if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return s3Client !== null && bucketName !== null;
}

/**
 * Uploads a file to S3 bucket
 * 
 * @param fileBuffer - The file data buffer
 * @param fileName - Original file name
 * @param contentType - MIME type of the file
 * @param userId - ID of the user uploading the file
 * @param folder - Optional subfolder within the user's directory
 * @returns Object with file key and other metadata
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  userId: number,
  folder: string = 'documents'
): Promise<{ fileKey: string; fileUrl?: string }> {
  // Check if S3 is configured
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }
  
  try {
    // Generate a unique key for the file
    const fileId = uuidv4();
    const extension = fileName.split('.').pop();
    const fileKey = `users/${userId}/${folder}/${fileId}.${extension}`;
    
    // Set up the upload parameters
    const params = {
      Bucket: bucketName!,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        'user-id': userId.toString(),
        'original-name': fileName
      }
    };
    
    // Upload to S3
    const command = new PutObjectCommand(params);
    await s3Client!.send(command);
    
    // Return the file key and a temporary URL
    const fileUrl = await getS3DownloadUrl(fileKey);
    
    return {
      fileKey,
      fileUrl
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${(error as Error).message}`);
  }
}

/**
 * Gets a temporary download URL for a file in S3
 * 
 * @param fileKey - The file key in S3
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL for downloading the file
 */
export async function getS3DownloadUrl(
  fileKey: string,
  expiresIn: number = 3600
): Promise<string> {
  // Check if S3 is configured
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }
  
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName!,
      Key: fileKey
    });
    
    const url = await getSignedUrl(s3Client!, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating S3 download URL:', error);
    throw new Error(`Failed to generate download URL: ${(error as Error).message}`);
  }
}

/**
 * Deletes a file from S3
 * 
 * @param fileKey - The file key in S3
 * @returns Success status
 */
export async function deleteFromS3(fileKey: string): Promise<boolean> {
  // Check if S3 is configured
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }
  
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName!,
      Key: fileKey
    });
    
    await s3Client!.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error(`Failed to delete file from S3: ${(error as Error).message}`);
  }
}