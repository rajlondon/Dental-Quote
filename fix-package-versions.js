import fs from 'fs';

// Fix the package.json with correct versions
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Fix the incorrect Stripe version
packageJson.dependencies['@stripe/react-stripe-js'] = '^3.7.0';
packageJson.dependencies['@stripe/stripe-js'] = '^4.8.0';

// Write the corrected package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Package versions corrected for deployment');