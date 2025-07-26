// Fix for auth.ts seeding issue
const fs = require('fs');

// Read the current auth.ts file
let authContent = fs.readFileSync('server/auth.ts', 'utf8');

// Replace problematic SQL with proper syntax
authContent = authContent.replace(
  /INSERT INTO users.*VALUES.*\$1.*\$2.*\$3/g,
  'INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, status) VALUES ($1, $2, $3, $4, $5, $6, $7)'
);

// Also fix any other parameterized queries
authContent = authContent.replace(
  /SELECT \* FROM users WHERE email = \$1/g,
  'SELECT * FROM users WHERE email = $1'
);

// Write the fixed content back
fs.writeFileSync('server/auth.ts', authContent);
console.log('Fixed auth.ts seeding queries');
