#!/bin/bash
# Post-deployment script for MyDentalFly application

echo "Starting post-deployment process..."

# Check if environment variables are set
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "WARNING: STRIPE_SECRET_KEY is not set. Payment functionality will be limited."
fi

# Ensure static directories exist
mkdir -p dist/public

# Build the frontend assets
echo "Building frontend assets with Vite..."
npm run build

echo "Post-deployment process completed successfully."