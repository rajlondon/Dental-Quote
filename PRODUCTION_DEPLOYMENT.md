# MyDentalFly Production Deployment Guide

This guide outlines the steps to deploy MyDentalFly to production with all security features enabled. It covers environment configuration, deployment procedures, and verification steps.

## 1. Environment Variables Setup

### 1.1 Production Environment Variables

The application distinguishes between development and production environments using the `NODE_ENV` environment variable.

```
NODE_ENV=production
```

When set to `production`:
- Error logging becomes more selective (only errors and critical issues)
- AWS S3 storage is used by default (if configured)
- Additional security measures are activated

All required environment variables are documented in the `.env.production.example` file. Copy this file to create your actual production configuration:

```bash
cp .env.production.example .env.production
```

Then edit `.env.production` with your actual values.

### 1.2 Secure Storage of Credentials

For Replit deployment:
1. Go to your Replit project
2. Click on "Secrets" (lock icon) in the Tools panel
3. Add each environment variable from `.env.production` as a secret

For other hosting providers:
- Use their dedicated environment variables or secrets management system
- Avoid storing secrets in configuration files that might be committed to the repository

## 2. Storage Configuration

### 2.1 Storage Provider Selection

The application automatically selects the storage provider based on environment:

- **Development**: Uses local file storage by default
- **Production**: Uses AWS S3 by default (if configured)

You can override this behavior with the `STORAGE_PROVIDER` environment variable:

```
# Force AWS S3 even in development
STORAGE_PROVIDER=aws-s3

# Force local storage even in production
STORAGE_PROVIDER=local
```

### 2.2 AWS S3 Setup

Follow the detailed instructions in the `AWS_S3_SETUP.md` document to:
1. Create an AWS account
2. Set up a dedicated S3 bucket
3. Configure proper security settings
4. Create an IAM user with restricted permissions
5. Set up the necessary environment variables

## 3. Database Setup

The application uses PostgreSQL for data storage. In production:

1. Use a managed PostgreSQL service (AWS RDS, Neon, etc.)
2. Configure the `DATABASE_URL` environment variable
3. Ensure database backups are automated
4. Consider setting up read replicas for high-traffic scenarios

## 4. Testing Before Deployment

### 4.1 Test Environment Toggle

Before production deployment, test the environment toggle functionality:

1. Set `NODE_ENV=production` but keep a local development database
2. Test that the application functions correctly with the production settings
3. Verify that error logging and monitoring are working

### 4.2 AWS S3 Integration Testing

Verify the S3 integration is working correctly by running the storage test utility:

```bash
npx tsx server/tests/storage-test.ts
```

This will perform a series of tests:
- Configuration verification
- File upload
- Signed URL generation
- File listing
- File deletion

All tests should pass before proceeding to production deployment.

## 5. Deployment Process

### 5.1 Deployment on Replit

1. Ensure all environment variables are set in Replit Secrets
2. Set the deployment command to:
   ```
   NODE_ENV=production node index.js
   ```
3. Deploy using the Replit deployment interface

### 5.2 Post-Deployment Verification

After deployment, perform these verification steps:

1. **User Authentication**: Test login, registration, and password reset
2. **File Uploads**: Test document upload to ensure S3 integration works
3. **Email Sending**: Verify that transactional emails are being sent
4. **Payment Processing**: Test Stripe integration with a test card
5. **Error Logging**: Intentionally trigger errors to ensure they're logged properly

## 6. Environment Toggle Usage

### 6.1 How the Environment Toggle Works

The environment toggle system serves these purposes:

1. **Local Development**: 
   - Uses local storage for files
   - Provides detailed error logs
   - May use mock services for testing

2. **Production Environment**:
   - Uses AWS S3 for file storage
   - Implements stricter security
   - Logs only significant errors
   - Uses live payment processing

### 6.2 Storage Provider Behavior

The system follows these rules for storage provider selection:

1. If `STORAGE_PROVIDER` is explicitly set, that value is used
2. Otherwise, if `NODE_ENV=production`, AWS S3 is used (if configured)
3. If not production or S3 is not configured, local storage is used as fallback

This allows for:
- Easy local development without cloud storage
- Automatic use of cloud storage in production
- Fallback to local storage if cloud configuration is missing

## 7. Error Handling in Production

In production, error handling is enhanced:

1. All errors are logged with contextual information
2. Sensitive error details are not exposed to users
3. Critical errors can be set to trigger notifications
4. Error logs include component, operation, and severity

## 8. Security Best Practices

### 8.1 Environment Variables Security

- Never commit `.env` files to the repository
- Rotate API keys and secrets regularly
- Use different API keys for development and production
- Apply the principle of least privilege for all API access keys

### 8.2 Data Protection

- Ensure patient data is encrypted in transit and at rest
- Implement proper access controls for sensitive documents
- Follow GDPR requirements for patient information
- Set up automatic data backups

## 9. Monitoring and Maintenance

### 9.1 Application Monitoring

- Set up uptime monitoring for the production deployment
- Monitor API rate limits and usage
- Check S3 storage usage regularly
- Verify database performance and growth

### 9.2 Regular Maintenance

- Schedule regular security updates
- Perform periodic security audits
- Review and rotate API keys and credentials
- Check for outdated dependencies

## 10. GDPR Compliance

For European operations, ensure GDPR compliance:

1. Implement proper consent mechanisms for data collection
2. Provide a way for users to download or delete their data
3. Document all data processing activities
4. Establish a data breach notification process
5. Ensure all third-party services are GDPR compliant

## 11. Scaling Considerations

As the application grows:

1. Consider implementing a CDN for static assets
2. Set up database connection pooling
3. Configure caching strategies for frequently accessed data
4. Monitor API rate limits for external services (Stripe, AWS, etc.)
5. Consider horizontal scaling options for high-traffic scenarios