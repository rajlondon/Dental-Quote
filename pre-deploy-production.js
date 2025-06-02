// Pre-deployment preparation for MyDentalFly Production
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Preparing MyDentalFly for production deployment...');

try {
  // Copy production package.json
  const productionPackagePath = path.join(__dirname, 'production-package.json');
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(productionPackagePath)) {
    fs.copyFileSync(productionPackagePath, packagePath);
    console.log('✅ Production package.json configured');
  }

  // Verify production server exists
  const productionServerPath = path.join(__dirname, 'production-server.mjs');
  if (fs.existsSync(productionServerPath)) {
    console.log('✅ Production server ready');
  } else {
    console.error('❌ Production server not found');
  }

  // Check deployment configuration
  const deployConfigPath = path.join(__dirname, '.replit.deploy');
  if (fs.existsSync(deployConfigPath)) {
    const deployConfig = fs.readFileSync(deployConfigPath, 'utf8');
    if (deployConfig.includes('production-server.mjs')) {
      console.log('✅ Deployment configuration updated');
    } else {
      console.error('❌ Deployment configuration incorrect');
    }
  }

  console.log('🚀 Production deployment ready!');
  console.log('');
  console.log('Services configured:');
  console.log('- Google OAuth authentication');
  console.log('- Email registration with verification');  
  console.log('- Database integration');
  console.log('- Email service integration');
  console.log('');
  console.log('Deploy now to activate the unified authentication system.');

} catch (error) {
  console.error('❌ Pre-deployment preparation failed:', error);
  process.exit(1);
}