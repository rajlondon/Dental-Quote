import fs from 'fs';

let content = fs.readFileSync('server/simple-memory-auth.ts', 'utf8');

// Remove ALL existing user route definitions (including broken ones)
content = content.replace(/router\.get\(['"`]\/user['"`][\s\S]*?^\}\);?$/gm, '');
content = content.replace(/router\.get\(['"`]\/current-user['"`][\s\S]*?^\}\);?$/gm, '');

// Add ONE working user endpoint at the very end
content += `

// THE working user endpoint for frontend
router.get('/user', (req, res) => {
  console.log('🎯 FINAL USER ENDPOINT HIT!');
  console.log('Session check:', !!req.session?.userId);
  
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
console.log('✅ Forced user endpoint fix');
