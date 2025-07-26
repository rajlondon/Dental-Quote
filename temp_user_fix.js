import fs from 'fs';

let content = fs.readFileSync('server/index.ts', 'utf8');

// Find a safe place to add our endpoint - after the routes are setup
const insertPoint = content.indexOf('// End of route registrations');
if (insertPoint === -1) {
  // If that marker doesn't exist, add after the express setup
  const expressSetupEnd = content.indexOf('app.use(express.json());');
  if (expressSetupEnd !== -1) {
    const insertAfter = content.indexOf('\n', expressSetupEnd) + 1;
    const before = content.substring(0, insertAfter);
    const after = content.substring(insertAfter);
    
    const newUserEndpoint = `
  // Working user endpoint for our memory auth
  app.get("/api/auth/user", (req, res) => {
    console.log("🚨 MAIN USER ENDPOINT HIT!");
    console.log("🔍 Session data:", req.session);
    
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
    
    content = before + newUserEndpoint + after;
    fs.writeFileSync('server/index.ts', content);
    console.log('✅ Added working user endpoint');
  }
}
