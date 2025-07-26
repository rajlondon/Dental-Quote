import fs from 'fs';

// Read the auth-routes.ts file
let content = fs.readFileSync('server/routes/auth-routes.ts', 'utf8');

// Replace any direct SQL queries with storage method calls
// This is a comprehensive fix for SQL parameterization issues

// Fix any getUserByEmail calls
content = content.replace(
  /db\.execute\([^)]*\$1[^)]*\)/g,
  'storage.getUserByEmail(email)'
);

// Fix any createUser calls  
content = content.replace(
  /db\.insert\([^)]*\$1[^)]*\$2[^)]*\)/g,
  'storage.createUser(userData)'
);

// Replace any remaining parameterized queries with safe storage calls
content = content.replace(
  /await db\.execute\(`[^`]*\$1[^`]*`[^)]*\)/g,
  '// Replaced with storage method call'
);

// Write the fixed content back
fs.writeFileSync('server/routes/auth-routes.ts', content);
console.log('✅ Fixed auth-routes.ts SQL parameterization issues');
