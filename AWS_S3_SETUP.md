# AWS S3 Setup Guide for MyDentalFly

This guide provides detailed instructions for setting up AWS S3 storage for the MyDentalFly application.

## Prerequisites

- An AWS account
- Admin access to create IAM users and S3 buckets
- Basic familiarity with AWS services

## Step 1: Create an S3 Bucket

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to the S3 service
3. Click "Create bucket"
4. Enter bucket details:
   - **Bucket name**: `mydentalfly-documents-prod` (or your preferred name)
   - **AWS Region**: `eu-north-1` (Stockholm) - or your preferred region
   - **Block all public access**: Keep this enabled for security (recommended)
   - **Bucket versioning**: Enable if you want version control for documents
   - **Default encryption**: Enable Server-side encryption with Amazon S3 managed keys (SSE-S3)
5. Click "Create bucket"

## Step 2: Create an IAM User

1. Navigate to IAM (Identity and Access Management) in the AWS Console
2. Click "Users" and then "Add user"
3. Enter a name (e.g., `mydentalfly-s3-access`)
4. Select "Access key - Programmatic access" as the AWS credential type
5. Click "Next: Permissions"
6. Choose "Attach policies directly"
7. **Do not** attach any policies yet - we'll create a custom one in the next step
8. Click through "Next" until you can create the user
9. **Important**: Download the CSV file containing the access key and secret key

## Step 3: Create a Custom IAM Policy

1. In the IAM console, go to "Policies" and click "Create policy"
2. Select the JSON tab and replace the content with this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::mydentalfly-documents-prod/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::mydentalfly-documents-prod"
        }
    ]
}
```

3. Replace `mydentalfly-documents-prod` with your actual bucket name if different
4. Click "Next" and give the policy a name (e.g., `MyDentalFlyS3Access`)
5. Provide a description (e.g., "Access policy for MyDentalFly application to S3 bucket")
6. Click "Create policy"

## Step 4: Attach the Policy to Your IAM User

1. Go back to "Users" in the IAM console
2. Select your user (e.g., `mydentalfly-s3-access`)
3. Click "Add permissions"
4. Select "Attach existing policies directly"
5. Search for and select the policy you just created (e.g., `MyDentalFlyS3Access`)
6. Click "Next" and then "Add permissions"

## Step 5: Configure Bucket CORS (if needed)

If your application uploads files directly from the browser to S3:

1. Go to your S3 bucket
2. Click on the "Permissions" tab
3. Scroll down to the "Cross-origin resource sharing (CORS)" section
4. Click "Edit" and add the following configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://your-domain.com",
            "https://www.your-domain.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

5. Replace `your-domain.com` with your actual domain
6. Click "Save changes"

## Step 6: Configure MyDentalFly Environment Variables

Set the following environment variables in your Replit Secrets:

1. `S3_ACCESS_KEY` - Your IAM user's access key
2. `S3_SECRET_KEY` - Your IAM user's secret key
3. `S3_REGION` - The AWS region (e.g., `eu-north-1`)
4. `S3_BUCKET_NAME` - Your bucket name (e.g., `mydentalfly-documents-prod`)

## Step 7: Verify the Configuration

Verify that your configuration is working correctly by running the storage test utility:

```bash
STORAGE_PROVIDER=aws-s3 npx tsx server/tests/storage-test.ts
```

## Troubleshooting

### Access Denied Errors

If you see "Access Denied" errors:

1. **Verify IAM Policy**: Ensure the policy is correctly attached to your IAM user
2. **Check Resource Names**: Make sure the bucket name in the policy matches your actual bucket name
3. **Verify Credentials**: Double-check that you're using the correct access key and secret key
4. **Bucket Policy**: Check if there's a bucket policy that might be restricting access
5. **Block Public Access**: If you're trying to access the files via public URLs, check the "Block Public Access" settings

### Common Permission Issues

- **s3:PutObject** - Required for uploading files
- **s3:GetObject** - Required for downloading files
- **s3:DeleteObject** - Required for deleting files
- **s3:ListBucket** - Required for listing files in the bucket

For each of these, ensure that your policy grants the permission on the correct resource:
- For object operations (`PutObject`, `GetObject`, `DeleteObject`), the resource should be `arn:aws:s3:::bucket-name/*`
- For bucket operations (`ListBucket`), the resource should be `arn:aws:s3:::bucket-name`

## Security Best Practices

1. **Least Privilege**: The IAM policy above follows the principle of least privilege by only granting the specific permissions needed
2. **Use IAM Roles for EC2/Lambda**: If deploying to AWS compute services, use IAM roles instead of access keys
3. **Rotate Credentials**: Regularly rotate your access keys
4. **Enable MFA**: Enable Multi-Factor Authentication for your AWS account
5. **Monitor Access**: Enable CloudTrail and S3 access logging to monitor access to your bucket
6. **Encrypt Data**: Ensure server-side encryption is enabled for your bucket

## Production Configuration

For production environments:

1. Set `NODE_ENV=production` - This will enable automatic use of S3 storage
2. Ensure all environment variables are properly set
3. Consider setting up a CloudFront distribution for better performance
