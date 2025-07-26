import fs from 'fs';

let content = fs.readFileSync('server/simple-memory-auth.ts', 'utf8');

// Find and replace the user endpoint with working code
const userEndpointPattern = /router\.get\('\/user',[\s\S]*?^}\);/m;
const newUserEndpoint = `router.get('/user', (req, res) => {
  console.log('🚨 FIXED USER ENDPOINT HIT!');
  console.log('Session data:', req.session);
  
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  
  // Find user by ID from our in-memory storage
  const user = Array.from(users.values()).find(u => u.id === req.session.userId);
  
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }
  
  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      clinicId: user.clinicId
    }
  });
});`;

content = content.replace(userEndpointPattern, newUserEndpoint);
fs.writeFileSync('server/simple-memory-auth.ts', content);
console.log('✅ Fixed user endpoint manually');
