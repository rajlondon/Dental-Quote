/**
 * MyDentalFly Production Deployment Script
 * Primary Domain: mydentalfly.co.uk
 * Redirect Domain: mydentalfly.com
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing MyDentalFly for production deployment...');

// Production environment variables
const productionEnv = {
  NODE_ENV: 'production',
  PRIMARY_DOMAIN: 'mydentalfly.co.uk',
  REDIRECT_DOMAIN: 'mydentalfly.com',
  PORT: process.env.PORT || 5000,
  // Keep all existing secrets
  DATABASE_URL: process.env.DATABASE_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  VITE_STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY,
  MAILJET_API_KEY: process.env.MAILJET_API_KEY,
  MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET || 'mydentalfly-production-secret-' + Date.now()
};

console.log('✅ Production environment configured');
console.log('🎯 Primary domain: mydentalfly.co.uk');
console.log('🔄 Redirect domain: mydentalfly.com');
console.log('');
console.log('🌟 Ready for deployment!');
console.log('');
console.log('Next steps:');
console.log('1. Click the "Deploy" button in Replit');
console.log('2. Configure DNS for your domains');
console.log('3. SSL certificates will be auto-provisioned');

module.exports = productionEnv;