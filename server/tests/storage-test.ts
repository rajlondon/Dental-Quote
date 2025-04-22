/**
 * AWS S3 Storage Integration Test Utility
 * 
 * This utility helps verify that S3 storage is correctly configured
 * and can be used to test uploads, downloads, and URL generation.
 * 
 * Run with: npx tsx server/tests/storage-test.ts
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

// Configuration check
async function checkConfiguration() {
  console.log('=== S3 Configuration Check ===');
  console.log(`Environment: ${isProduction() ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`Storage provider: ${cloudStorageConfig.provider}`);
  
  if (cloudStorageConfig.provider === 'aws-s3') {
    console.log(`Bucket: ${cloudStorageConfig.bucket}`);
    console.log(`Region: ${cloudStorageConfig.region}`);
    
    if (cloudStorageConfig.credentials?.accessKey) {
      const accessKey = cloudStorageConfig.credentials.accessKey;
      const maskedKey = accessKey.substring(0, 4) + '***' + accessKey.substring(accessKey.length - 4);
      console.log(`Access Key: ${maskedKey}`);
    } else {
      console.error('❌ Missing Access Key');
    }
    
    if (cloudStorageConfig.credentials?.secretKey) {
      console.log('Secret Key: ********** (present)');
    } else {
      console.error('❌ Missing Secret Key');
    }
  } else {
    console.log(`Using ${cloudStorageConfig.provider} storage (not AWS S3)`);
    return false;
  }
  
  return true;
}

// Generate test file
function createTestFile() {
  const testDir = path.join(process.cwd(), 'tmp');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Generate UUID-like identifier for the test file
  const uuid = crypto.randomBytes(16).toString('hex');
  const testFilePath = path.join(testDir, `test-file-${Date.now()}-${uuid}.txt`);
  const testContent = `This is a test file created at ${new Date().toISOString()}\n`;
  fs.writeFileSync(testFilePath, testContent);
  
  return testFilePath;
}

// Test upload
async function testUpload(filePath: string) {
  console.log('\n=== Testing File Upload ===');
  
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const testKey = `test/${fileName}`;
    
    console.log(`Uploading file: ${fileName}`);
    console.log(`Target S3 key: ${testKey}`);
    
    const result = await uploadToS3(fileContent, testKey, 'text/plain');
    
    if (result.success) {
      console.log('✅ Upload successful');
      console.log(`URL: ${result.url}`);
      return testKey;
    } else {
      console.error('❌ Upload failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return null;
  }
}

// Test signed URL generation
async function testSignedUrl(key: string) {
  console.log('\n=== Testing Signed URL Generation ===');
  
  try {
    console.log(`Generating signed URL for key: ${key}`);
    const url = await getSignedS3Url(key, 300); // 5 minutes expiration
    
    if (url) {
      console.log('✅ Signed URL generated successfully');
      console.log(`URL (valid for 5 minutes): ${url}`);
      return true;
    } else {
      console.error('❌ Failed to generate signed URL');
      return false;
    }
  } catch (error) {
    console.error('❌ Signed URL error:', error);
    return false;
  }
}

// Test listing files
async function testListFiles(prefix: string) {
  console.log('\n=== Testing File Listing ===');
  
  try {
    console.log(`Listing files with prefix: ${prefix}`);
    const files = await listS3Files(prefix);
    
    console.log(`Found ${files.length} files:`);
    files.forEach(file => console.log(`- ${file}`));
    
    return true;
  } catch (error) {
    console.error('❌ List files error:', error);
    return false;
  }
}

// Test file deletion
async function testDeleteFile(key: string) {
  console.log('\n=== Testing File Deletion ===');
  
  try {
    console.log(`Deleting file with key: ${key}`);
    const result = await deleteFromS3(key);
    
    if (result) {
      console.log('✅ File deleted successfully');
      return true;
    } else {
      console.error('❌ Failed to delete file');
      return false;
    }
  } catch (error) {
    console.error('❌ Delete error:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting S3 Storage Integration Tests...\n');
  
  // Check configuration first
  const configValid = await checkConfiguration();
  if (!configValid) {
    console.error('\n❌ Configuration check failed. Please configure AWS S3 properly.');
    process.exit(1);
  }
  
  // Create a test file
  const testFilePath = createTestFile();
  console.log(`Created test file: ${testFilePath}`);
  
  // Run upload test
  const uploadedKey = await testUpload(testFilePath);
  if (!uploadedKey) {
    console.error('\n❌ Upload test failed. Cannot continue with other tests.');
    process.exit(1);
  }
  
  // Run signed URL test
  await testSignedUrl(uploadedKey);
  
  // Run list files test
  await testListFiles('test/');
  
  // Run deletion test
  await testDeleteFile(uploadedKey);
  
  // Clean up the local test file
  try {
    fs.unlinkSync(testFilePath);
    console.log(`\nCleaned up local test file: ${testFilePath}`);
  } catch (error) {
    console.error(`\nFailed to clean up local test file: ${error}`);
  }
  
  console.log('\n=== Test Summary ===');
  console.log('All tests completed. Check the logs above for any errors.');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in test execution:', error);
  process.exit(1);
});