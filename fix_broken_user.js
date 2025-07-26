import fs from 'fs';

let content = fs.readFileSync('server/simple-memory-auth.ts', 'utf8');

// Remove all existing user endpoints
content = content.replace(/router\.get\(['"]\/user['"][\s\S]*?^\}\);$/gm, '');

// Add our working user endpoint at the end
content += `
// Working user endpoint that frontend needs
router.get('/user', (req, res) => {
  console.log('🚨 FIXED USER ENDPOINT WORKING!');
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  return res.json({
    success: true,
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
      role: req.session.userRole,
      firstName: "User",
      lastName: "Name"
    }
  });
});
`;

fs.writeFileSync('server/simple-memory-auth.ts', content);
console.log('✅ Fixed broken user endpoint');
