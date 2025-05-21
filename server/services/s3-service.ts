/**
 * AWS S3 Service for MyDentalFly
 * 
 * This service handles secure file storage operations using AWS S3
 * for dental records, medical documents, and other patient files.
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// S3 bucket name from environment
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'mydentalfly-documents';

// Default expiration times for signed URLs (in seconds)
const UPLOAD_URL_EXPIRATION = 300; // 5 minutes
const DOWNLOAD_URL_EXPIRATION = 3600; // 1 hour

/**
 * Generates a presigned URL for uploading a file to S3
 * 
 * @param fileKey - The key to use for the S3 object
 * @param contentType - The MIME type of the file
 * @param isPublic - Whether the file should be publicly accessible
 * @param expiresIn - URL expiration time in seconds (default: 5 minutes)
 * @returns Promise resolving to a presigned URL
 */
export async function generateS3PresignedUrl(
  fileKey: string,
  contentType: string,
  isPublic: boolean = false,
  expiresIn: number = UPLOAD_URL_EXPIRATION
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      // Set appropriate ACL based on public flag
      ACL: isPublic ? 'public-read' : 'private',
      // Add metadata with encryption flag and security indicators
      Metadata: {
        'x-amz-meta-encrypted': 'true',
        'x-amz-meta-security-level': isPublic ? 'public' : 'private',
        'x-amz-meta-upload-date': new Date().toISOString()
      }
    });

    // Generate the presigned URL for upload
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating S3 presigned URL:', error);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
}

/**
 * Gets a presigned URL for downloading a file from S3
 * 
 * @param fileKey - The key of the S3 object
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Promise resolving to a presigned URL
 */
export async function getS3DownloadUrl(
  fileKey: string,
  expiresIn: number = DOWNLOAD_URL_EXPIRATION
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey
    });

    // Generate the presigned URL for download
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating S3 download URL:', error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
}

/**
 * Deletes an object from S3
 * 
 * @param fileKey - The key of the S3 object to delete
 * @returns Promise that resolves when the object is deleted
 */
export async function deleteS3Object(fileKey: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Checks if S3 service is properly configured
 * 
 * @returns Boolean indicating if S3 credentials are available
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_S3_BUCKET_NAME
  );
}