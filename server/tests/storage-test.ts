/**
 * AWS S3 Storage Integration Test Utility
 * 
 * This utility helps verify that S3 storage is correctly configured
 * and can be used to test uploads, downloads, and URL generation.
 * 
 * Run with: npx tsx server/tests/storage-test.ts
 * 
 * To run in production mode: NODE_ENV=production npx tsx server/tests/storage-test.ts
 */

import fs from 'fs';
import path from 'path';
import { 
  cloudStorageConfig, 
  isProduction, 
  uploadToS3, 
  getSignedS3Url, 
  deleteFromS3, 
  listS3Files 
} from '../services/cloud-storage';
import crypto from 'crypto';

const testFileContent = `
MyDentalFly Storage Test
------------------------
Generated: ${new Date().toISOString()}
Random ID: ${crypto.randomBytes(8).toString('hex')}
`;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

async function runStorageTest() {
  console.log(`${colors.bright}${colors.blue}=== MyDentalFly Storage Integration Test ===\n${colors.reset}`);
  
  // 1. Configuration check
  console.log(`${colors.cyan}[Test 1] Checking configuration...${colors.reset}`);
  console.log(`Environment: ${isProduction() ? colors.yellow + 'PRODUCTION' : colors.green + 'DEVELOPMENT'}${colors.reset}`);
  console.log(`Storage provider: ${colors.bright}${cloudStorageConfig.provider}${colors.reset}`);
  
  if (cloudStorageConfig.provider === 'aws-s3') {
    console.log(`S3 Bucket: ${colors.bright}${cloudStorageConfig.bucket || 'Not configured'}${colors.reset}`);
    console.log(`S3 Region: ${colors.bright}${cloudStorageConfig.region || 'Not configured'}${colors.reset}`);
    console.log(`S3 Credentials: ${colors.bright}${cloudStorageConfig.credentials?.accessKey ? 'Configured ✓' : 'Missing ✗'}${colors.reset}`);
    
    if (!cloudStorageConfig.bucket || !cloudStorageConfig.credentials?.accessKey) {
      console.log(`${colors.red}${colors.bright}❌ S3 configuration incomplete.${colors.reset}`);
      console.log(`Make sure you've set the following environment variables:
      - S3_BUCKET_NAME or process.env.S3_BUCKET_NAME
      - S3_ACCESS_KEY or AWS_ACCESS_KEY_ID
      - S3_SECRET_KEY or AWS_SECRET_ACCESS_KEY
      - S3_REGION or AWS_REGION (defaults to eu-north-1)`);
      
      process.exit(1);
    }
    
    console.log(`${colors.green}${colors.bright}✅ S3 Configuration test passed.${colors.reset}\n`);
    
    // 2. File Upload Test
    console.log(`${colors.cyan}[Test 2] Testing file upload...${colors.reset}`);
    
    // Create test file
    const testFileKey = `test/storage-test-${Date.now()}.txt`;
    const testBuffer = Buffer.from(testFileContent);
    
    try {
      const uploadResult = await uploadToS3(testBuffer, testFileKey, 'text/plain');
      
      if (!uploadResult.success) {
        console.log(`${colors.red}${colors.bright}❌ File upload failed: ${uploadResult.message}${colors.reset}`);
        process.exit(1);
      }
      
      console.log(`${colors.green}${colors.bright}✅ File upload test passed.${colors.reset}`);
      console.log(`Uploaded to key: ${colors.dim}${testFileKey}${colors.reset}`);
      console.log(`URL: ${colors.dim}${uploadResult.url?.substring(0, 100)}...${colors.reset}\n`);
      
      // 3. Signed URL Test
      console.log(`${colors.cyan}[Test 3] Testing signed URL generation...${colors.reset}`);
      
      const signedUrl = await getSignedS3Url(testFileKey, 60);
      
      if (!signedUrl) {
        console.log(`${colors.red}${colors.bright}❌ Signed URL generation failed.${colors.reset}`);
        process.exit(1);
      }
      
      console.log(`${colors.green}${colors.bright}✅ Signed URL test passed.${colors.reset}`);
      console.log(`Signed URL (valid for 60 seconds): ${colors.dim}${signedUrl.substring(0, 100)}...${colors.reset}\n`);
      
      // 4. List Files Test
      console.log(`${colors.cyan}[Test 4] Testing file listing...${colors.reset}`);
      
      const fileList = await listS3Files('test/');
      
      if (fileList.length === 0 || !fileList.includes(testFileKey)) {
        console.log(`${colors.red}${colors.bright}❌ File listing failed. The uploaded test file was not found.${colors.reset}`);
        process.exit(1);
      }
      
      console.log(`${colors.green}${colors.bright}✅ File listing test passed.${colors.reset}`);
      console.log(`Found ${fileList.length} files in 'test/' directory.${colors.reset}\n`);
      
      // 5. File Deletion Test
      console.log(`${colors.cyan}[Test 5] Testing file deletion...${colors.reset}`);
      
      const deleteResult = await deleteFromS3(testFileKey);
      
      if (!deleteResult) {
        console.log(`${colors.yellow}⚠️ File deletion test failed, but this may be due to S3 permissions.${colors.reset}`);
        console.log(`If using minimal permissions, ensure that DeleteObject permission is granted.${colors.reset}\n`);
      } else {
        console.log(`${colors.green}${colors.bright}✅ File deletion test passed.${colors.reset}\n`);
      }
      
      // Final result
      console.log(`${colors.green}${colors.bright}✅ All tests completed.${colors.reset}`);
      console.log(`${colors.bright}${colors.blue}=== Storage Integration Test Complete ===\n${colors.reset}`);
      
    } catch (error) {
      console.log(`${colors.red}${colors.bright}❌ Test error: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
      console.error(error);
      process.exit(1);
    }
  } else {
    console.log(`${colors.yellow}⚠️ Not using AWS S3 storage. Current provider: ${cloudStorageConfig.provider}${colors.reset}`);
    console.log(`To test S3 integration:
    1. Set the required S3 environment variables
    2. Set NODE_ENV=production or STORAGE_PROVIDER=aws-s3
    3. Run this test again.`);
  }
}

// Run the test
runStorageTest();