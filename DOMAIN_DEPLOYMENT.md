# MyDentalFly Domain Deployment Guide

This document provides instructions for deploying the MyDentalFly landing page to your domains (mydentalfly.com and mydentalfly.co.uk).

## How the Domain Deployment Works

We've created a special deployment configuration that:

1. Uses a standalone landing page server with no dependencies
2. Bypasses the main React application for domain deployments
3. Provides a health check endpoint at `/api/health`
4. Does not require any environment variables (like Stripe keys)

## Deployment Steps

1. Make sure `dist/start.mjs` contains our standalone server code
2. Click the "Deploy" button in the Replit interface
3. In the deployment logs, look for the message about the server starting
4. Verify that the deployment shows as "Healthy" in the deployments tab
5. Check your domains to ensure they're loading properly

## Troubleshooting

If you encounter a 502 error on your domains:

1. Check the deployment logs for errors
2. Make sure the health check endpoint (`/api/health`) is properly responding
3. Verify that the server is listening on the correct port (`process.env.PORT`)

## Making Changes to the Landing Page

If you need to update the landing page, you can edit the HTML directly in `dist/start.mjs`. The HTML is stored in the `landingPage` string variable.

## Future Full Application Deployment

When you're ready to deploy the full React application:

1. Make sure all required secrets are exposed to the deployment environment:
   - Go to Tools → Secrets
   - For each secret (STRIPE_SECRET_KEY, etc.):
     - Toggle "Expose to Deployments" to ON
   - Or add them directly in the Deployments panel under "Environment Variables"

2. Fix any Vite path issues in the React application
3. Deploy the full application instead of the landing page

## Support

If you continue to experience issues with the domain deployment, please contact support for further assistance.