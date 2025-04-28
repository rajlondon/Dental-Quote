import { S3Client, PutObjectCommand, GetObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  visibility?: 'public' | 'private';
}

interface UploadResult {
  key: string;
  url: string;
  publicUrl?: string;
}

export class CloudStorage {
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;
  private useLocalStorage: boolean = false;
  private localStoragePath: string = path.join(process.cwd(), 'uploads');
  
  constructor() {
    this.initialize();
  }
  
  private initialize() {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;
    
    // Check if AWS credentials are provided
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION && AWS_S3_BUCKET) {
      try {
        const config: S3ClientConfig = {
          region: AWS_REGION,
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
          }
        };
        
        this.s3Client = new S3Client(config);
        this.bucketName = AWS_S3_BUCKET;
        
        console.log('AWS S3 client initialized successfully');
      } catch (error) {
        console.error('Error initializing S3 client:', error);
        this.useLocalStorage = true;
      }
    } else {
      console.log('AWS credentials not provided, using local storage');
      this.useLocalStorage = true;
    }
    
    // Ensure local storage directory exists (for fallback)
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
  }
  
  /**
   * Upload a file to cloud storage
   * 
   * @param filePath Path to the file on local filesystem
   * @param destinationKey S3 key (path) for the file destination
   * @param options Additional upload options
   * @returns Upload result with file details
   */
  async uploadFile(
    filePath: string,
    destinationKey: string,
    options: UploadOptions = {}
  ): Promise<UploadResult | null> {
    try {
      if (this.useLocalStorage) {
        return this.uploadToLocalStorage(filePath, destinationKey, options);
      }
      
      if (!this.s3Client || !this.bucketName) {
        console.error('S3 client or bucket not properly initialized');
        return this.uploadToLocalStorage(filePath, destinationKey, options);
      }
      
      // Read the file
      const fileContent = fs.readFileSync(filePath);
      
      // Set content type or detect from file extension
      const contentType = options.contentType || this.detectContentType(filePath);
      
      // Upload to S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: destinationKey,
        Body: fileContent,
        ContentType: contentType,
        Metadata: options.metadata || {},
        ACL: options.visibility === 'public' ? 'public-read' : 'private'
      };
      
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      // Generate a signed URL for private files
      let url: string;
      let publicUrl: string | undefined;
      
      if (options.visibility === 'public') {
        // For public files, use the direct S3 URL
        url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${destinationKey}`;
        publicUrl = url;
      } else {
        // For private files, generate a signed URL that expires
        url = await this.getSignedUrl(destinationKey);
      }
      
      return {
        key: destinationKey,
        url,
        publicUrl
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      
      // Fallback to local storage on error
      return this.uploadToLocalStorage(filePath, destinationKey, options);
    }
  }
  
  /**
   * Generate a signed URL for accessing a private file
   * 
   * @param key S3 object key
   * @param expirationSeconds Expiration time in seconds
   * @returns Signed URL for temporary access
   */
  async getSignedUrl(key: string, expirationSeconds: number = 3600): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error('S3 client or bucket not properly initialized');
    }
    
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });
    
    return getSignedUrl(this.s3Client, command, { expiresIn: expirationSeconds });
  }
  
  /**
   * Fallback method to store files locally
   * 
   * @param filePath Source file path
   * @param destinationKey Destination path/key
   * @param options Upload options
   * @returns Upload result with local URL
   */
  private async uploadToLocalStorage(
    filePath: string,
    destinationKey: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    // Create directories in the destination path if needed
    const destDir = path.join(this.localStoragePath, path.dirname(destinationKey));
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file to the destination
    const destPath = path.join(this.localStoragePath, destinationKey);
    fs.copyFileSync(filePath, destPath);
    
    // Calculate relative URL for access (this would be handled by an express static middleware)
    const url = `/uploads/${destinationKey}`;
    
    return {
      key: destinationKey,
      url,
      publicUrl: options.visibility === 'public' ? url : undefined
    };
  }
  
  /**
   * Detect content type from file extension
   * 
   * @param filePath File path
   * @returns Content type string
   */
  private detectContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.csv': 'text/csv'
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }
}