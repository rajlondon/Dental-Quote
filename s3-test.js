// S3 Connection Test Script
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Get bucket and region from environment variables
const bucket = process.env.S3_BUCKET_NAME;
const region = process.env.S3_REGION || 'eu-north-1';
const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;

console.log('== S3 Connection Test ==');
console.log(`Bucket: ${bucket}`);
console.log(`Region: ${region}`);
console.log(`Access Key exists: ${!!accessKey}`);
console.log(`Secret Key exists: ${!!secretKey}`);

if (!bucket || !accessKey || !secretKey) {
  console.error('Missing required S3 configuration');
  process.exit(1);
}

// Initialize S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  }
});

console.log('S3 client initialized');

async function runTest() {
  try {
    // 1. Test bucket access by listing objects
    console.log('\nTesting bucket access (ListObjectsV2)...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 5
    });
    
    const listResult = await s3Client.send(listCommand);
    console.log(`Success! Found ${listResult.Contents?.length || 0} objects in bucket.`);
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('First few objects:');
      listResult.Contents.slice(0, 3).forEach(item => {
        console.log(` - ${item.Key} (${item.Size} bytes)`);
      });
    }
    
    // 2. Test file upload
    console.log('\nTesting file upload (PutObject)...');
    const testContent = 'This is a test file from MyDentalFly application ' + new Date().toISOString();
    const testKey = `test-file-${Date.now()}.txt`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    });
    
    await s3Client.send(uploadCommand);
    console.log(`Success! Test file uploaded with key: ${testKey}`);
    
    // 3. Test signed URL generation
    console.log('\nTesting signed URL generation...');
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: testKey
    });
    
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    console.log(`Success! Generated signed URL: ${signedUrl}`);
    
    console.log('\n✅ All S3 tests passed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ S3 test failed:');
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return false;
  }
}

runTest()
  .then(result => {
    console.log(`\nTest completed with ${result ? 'SUCCESS' : 'FAILURE'}`);
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });