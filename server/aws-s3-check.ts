/**
 * AWS S3 Configuration Check
 * 
 * This utility helps diagnose AWS S3 configuration issues
 * You can run it directly with: ts-node server/aws-s3-check.ts
 */

import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

async function checkAwsS3Configuration() {
  console.log('🔍 Checking AWS S3 Configuration...');
  
  // Check environment variables
  const accessKey = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION || process.env.AWS_REGION || 'eu-north-1';
  
  // Report on environment
  console.log(`Environment Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`AWS Region: ${region}`);
  console.log(`S3 Bucket Name: ${bucketName || 'Not configured'}`);
  console.log(`Access Key configured: ${!!accessKey}`);
  console.log(`Secret Key configured: ${!!secretKey}`);
  
  if (!accessKey || !secretKey) {
    console.error('❌ Missing AWS credentials. Set S3_ACCESS_KEY/S3_SECRET_KEY or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY');
    return false;
  }
  
  if (!bucketName) {
    console.error('❌ Missing S3 bucket name. Set S3_BUCKET_NAME environment variable');
    return false;
  }
  
  try {
    // Initialize S3 client
    console.log('Initializing S3 client...');
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
      }
    });
    
    // Test listing buckets (requires s3:ListAllMyBuckets permission)
    console.log('Testing S3 connection by listing buckets...');
    try {
      const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}));
      console.log(`✅ Successfully connected to S3 - found ${listBucketsResponse.Buckets?.length || 0} buckets`);
      
      // Check if our bucket is in the list
      const bucketExists = listBucketsResponse.Buckets?.some(bucket => bucket.Name === bucketName);
      console.log(`Bucket '${bucketName}' exists: ${bucketExists ? '✅ Yes' : '❌ No'}`);
    } catch (listError) {
      console.error('❌ Failed to list buckets:', listError);
      console.log('This might be due to restricted IAM permissions - trying with direct bucket operations');
    }
    
    // Test uploading a small file to the bucket (requires s3:PutObject permission)
    console.log(`Testing upload to bucket '${bucketName}'...`);
    try {
      const testKey = `test-file-${Date.now()}.txt`;
      const testContent = 'This is a test file to verify S3 upload permissions';
      
      const putObjectResponse = await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain'
      }));
      
      console.log(`✅ Successfully uploaded test file to S3 (${testKey})`);
      return true;
    } catch (error) {
      console.error('❌ Failed to upload test file to S3:', error);
      
      const uploadError = error as { name?: string; message?: string };
      
      if (uploadError.name === 'NoSuchBucket') {
        console.error(`❌ The bucket '${bucketName}' does not exist or you don't have access to it`);
      } else if (uploadError.name === 'AccessDenied') {
        console.error('❌ Access denied. Check your IAM permissions for s3:PutObject');
      } else {
        console.error(`❌ Error: ${uploadError.message || 'Unknown error'}`);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing S3 client:', error);
    return false;
  }
}

// Run this when imported as a module
// We don't have direct access to 'require.main === module' in ESM,
// so we export this function for direct use by api endpoints
async function runAwsS3ConfigCheck(): Promise<boolean> {
  try {
    const result = await checkAwsS3Configuration();
    if (result) {
      console.log('✅ AWS S3 is properly configured and operational');
    } else {
      console.error('❌ AWS S3 configuration check failed');
    }
    return result;
  } catch (error) {
    console.error('❌ Unexpected error during S3 configuration check:', error);
    return false;
  }
}

export { checkAwsS3Configuration, runAwsS3ConfigCheck };