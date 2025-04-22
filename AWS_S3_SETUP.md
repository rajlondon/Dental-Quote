# AWS S3 Setup for MyDentalFly Production Environment

This document provides comprehensive instructions for setting up AWS S3 storage for the MyDentalFly production environment. Follow these steps to ensure secure and reliable cloud storage for sensitive patient documents.

## 1. AWS Account Setup

### 1.1 Create an AWS Account (if you don't have one)
1. Go to [AWS Sign Up](https://portal.aws.amazon.com/billing/signup)
2. Follow the signup process, which requires:
   - Email address
   - Password
   - AWS account name
   - Payment information (credit card)
   - Identity verification
   - Support plan selection (Free tier is sufficient to start)

### 1.2 Enable Multi-Factor Authentication (MFA)
For enhanced security of your root account:
1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Click on your account name in the top right and select "Security credentials"
3. Under "Multi-factor authentication (MFA)", click "Assign MFA device"
4. Follow the prompts to set up MFA using either:
   - Virtual MFA device (like Google Authenticator)
   - Hardware MFA device
   - U2F security key

## 2. Create an S3 Bucket

### 2.1 Navigate to S3 Service
1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Search for "S3" in the services search bar
3. Select "S3" from the results

### 2.2 Create a Bucket
1. Click "Create bucket"
2. Configure the bucket:
   - **Bucket name**: Choose a globally unique name (e.g., `mydentalfly-documents-prod`)
   - **AWS Region**: Select a region close to your user base (e.g., `eu-west-2` for UK/Europe)
   - **Object Ownership**: Select "ACLs disabled" (recommended)
   - **Block Public Access settings**: Keep all boxes checked to block all public access
   - **Bucket Versioning**: Enable (keeps multiple versions of objects)
   - **Default encryption**: Enable server-side encryption with Amazon S3-managed keys (SSE-S3)
   - **Advanced settings**: 
     - Enable Object Lock (optional, provides extra protection against deletion)

3. Click "Create bucket"

### 2.3 Configure Lifecycle Rules (Optional)
For cost optimization:
1. Navigate to your bucket
2. Click the "Management" tab
3. Under "Lifecycle rules", click "Create lifecycle rule"
4. Create rules for:
   - Transitioning older objects to cheaper storage classes
   - Deleting temporary objects after a certain period
   - Example: Move objects older than 90 days to Glacier storage

## 3. Set Up IAM User for Application Access

### 3.1 Create an IAM User
1. In the AWS Management Console, search for "IAM"
2. Select "Users" from the left navigation
3. Click "Add users"
4. Configure the user:
   - **User name**: `mydentalfly-app-user`
   - **Access key - Programmatic access**: Check this option
   - **Console access**: Not required for the application

5. Click "Next: Permissions"

### 3.2 Set Up Permissions
1. Click "Create group"
2. Name the group `mydentalfly-app-access`
3. Filter policies and attach:
   - `AmazonS3ReadOnlyAccess` (for read operations)
   
4. Click "Create user group"
5. Select the newly created group
6. Click "Next: Tags"
7. Add tags (optional but recommended):
   - Key: `Project`, Value: `MyDentalFly`
   - Key: `Environment`, Value: `Production`
   
8. Click "Next: Review"
9. Click "Create user"

### 3.3 Create a Custom IAM Policy for Restricted S3 Access
For better security, create a policy that only allows access to your specific bucket:

1. In IAM, navigate to "Policies" 
2. Click "Create policy"
3. Select the JSON tab and paste the following (replace `BUCKET_NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::BUCKET_NAME/*",
        "arn:aws:s3:::BUCKET_NAME"
      ]
    }
  ]
}
```

4. Click "Next"
5. Name the policy `MyDentalFlyS3Access`
6. Add a description: "Custom policy for MyDentalFly application to access S3 bucket"
7. Click "Create policy"
8. Return to the IAM user created earlier
9. Remove the broader S3 read-only policy
10. Attach the custom policy you just created

### 3.4 Save Access Keys
After creating the user, you'll be shown:
- Access key ID
- Secret access key

⚠️ **IMPORTANT**: Download the CSV file and store it securely. This is the only time you'll see the secret access key.

## 4. Configure CORS (If Needed)

If your application will access S3 directly from the browser:

1. Navigate to your S3 bucket
2. Click the "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the following configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://mydentalfly.com", "https://www.mydentalfly.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

6. Adjust the allowed origins to match your production domain
7. Click "Save changes"

## 5. Application Configuration

### 5.1 Environment Variables
Add these environment variables to your production environment:

```env
# General environment setting
NODE_ENV=production

# Storage configuration
STORAGE_PROVIDER=aws-s3
S3_BUCKET_NAME=mydentalfly-documents-prod
S3_REGION=eu-west-2
S3_ACCESS_KEY=YOUR_ACCESS_KEY_ID
S3_SECRET_KEY=YOUR_SECRET_ACCESS_KEY
```

### 5.2 Testing the Connection
After deployment, verify the S3 integration by:
1. Uploading a test file through the application
2. Verifying the file appears in the S3 bucket
3. Checking that you can download/view the file in the application

## 6. Security Best Practices

### 6.1 Key Rotation
Rotate your access keys regularly:
1. Create a new access key
2. Update your application with the new key
3. Verify everything works
4. Delete the old access key

### 6.2 Monitoring
Enable monitoring and alerts:
1. Set up AWS CloudTrail to log all API calls
2. Configure S3 server access logging
3. Set up alerts for unusual activity patterns 

### 6.3 Data Protection
Implement additional protection:
1. Enable S3 Object Lock for critical patient data
2. Enable versioning to prevent accidental deletions
3. Configure backup and recovery procedures

## 7. Cost Management

### 7.1 Budget Alerts
1. Go to AWS Budgets
2. Create a budget for S3 usage
3. Set up alerts when costs reach certain thresholds

### 7.2 Storage Classes
Use appropriate storage classes:
- **Standard**: For frequently accessed files
- **Infrequent Access**: For files accessed less than once a month
- **Glacier**: For archival purposes (retrieval takes hours)

## 8. Troubleshooting Common Issues

### Authentication Failures
- Verify access key and secret key are correct
- Check if IAM user has necessary permissions
- Ensure IAM user is active and not deleted

### Access Denied Errors
- Verify bucket policies and CORS settings
- Check IAM permissions match your requirements
- Ensure bucket has proper ownership settings

### URL Generation Issues
- Check if signed URL expiration times are appropriate
- Verify region settings match your bucket's region
- Confirm content types are properly set during upload

## 9. Testing in Development Environment

Before going to production, test with the development toggle:
1. Set `NODE_ENV=development` and `STORAGE_PROVIDER=aws-s3` to manually test S3 integration
2. Switch back to `STORAGE_PROVIDER=local` for normal development
3. Document any issues that arise during testing

---

For additional assistance or updates to this documentation, please contact the MyDentalFly development team.