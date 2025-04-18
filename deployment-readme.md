# MyDentalFly Deployment Guide

## Required Environment Variables

For the deployment to work correctly, you need to expose the following secrets to your deployment:

1. **STRIPE_SECRET_KEY** - Your Stripe secret key (starts with `sk_`)
2. **STRIPE_PUBLIC_KEY** - Your Stripe publishable key (starts with `pk_`)
3. **VITE_STRIPE_PUBLIC_KEY** - Same as STRIPE_PUBLIC_KEY, but with VITE_ prefix

## How to Set Up Deployment Secrets

1. Go to Tools → Secrets
2. For each of the above secrets:
   - Create or edit the secret with the proper value
   - **IMPORTANT:** Toggle "Expose to Deployments" to ON
3. Alternatively, in the Deployments panel, add each key/value under Environment variables

## Troubleshooting

If you see HTTP ERROR 502 on your domains, check:

1. Deployment logs for error messages
2. Ensure all required secrets are properly exposed to the deployment
3. Check that the app builds correctly locally before deploying

## Health Checks

The deployment health check looks for a server that successfully starts and responds to requests. If your app crashes on startup due to missing environment variables, the health check will fail, resulting in 502 errors.