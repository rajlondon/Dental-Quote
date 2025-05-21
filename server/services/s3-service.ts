/**
 * S3 Service
 * 
 * Provides functionality for interacting with AWS S3 storage for secure document management.
 * Handles uploads, downloads, and deletion of files, with proper authentication checks.
 */

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

let s3Client: S3Client | null = null;

/**
 * Check if S3 is properly configured in the environment
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.S3_BUCKET_NAME
  );
}

/**
 * Initialize the S3 client if environment variables are set
 */
function getS3Client(): S3Client {
  if (s3Client) return s3Client;
  
  if (!isS3Configured()) {
    throw new Error('AWS S3 is not properly configured. Set required environment variables.');
  }
  
  s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
  
  return s3Client;
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Fall back to local storage if S3 is not configured
  if (!isS3Configured()) {
    return await saveFileLocally(fileBuffer, fileName);
  }
  
  try {
    const s3 = getS3Client();
    const key = `documents/${uuidv4()}-${fileName}`;
    
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ContentDisposition: 'inline'
    }));
    
    return key;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fallback function to save file locally for development
 */
async function saveFileLocally(fileBuffer: Buffer, fileName: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads');
  const uniqueFileName = `${uuidv4()}-${fileName}`;
  const filePath = path.join(uploadDir, uniqueFileName);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  await fs.promises.writeFile(filePath, fileBuffer);
  
  return `local:${uniqueFileName}`;
}

/**
 * Get a download URL for a file stored in S3
 */
export async function getS3DownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  // Handle local file
  if (key.startsWith('local:')) {
    const fileName = key.substring(6);
    return `/uploads/${fileName}`;
  }
  
  if (!isS3Configured()) {
    throw new Error('S3 is not configured for download URLs');
  }
  
  try {
    const s3 = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    });
    
    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating S3 download URL:", error);
    throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  // Handle local file
  if (key.startsWith('local:')) {
    const fileName = key.substring(6);
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting local file:", error);
      return false;
    }
  }
  
  if (!isS3Configured()) {
    throw new Error('S3 is not configured for file deletion');
  }
  
  try {
    const s3 = getS3Client();
    
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    }));
    
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}