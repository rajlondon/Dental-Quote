import fs from 'fs';

let content = fs.readFileSync('server/index.ts', 'utf8');

// Replace the session configuration with development-friendly settings
const newSessionConfig = `// Session configuration (add before passport)
app.use(
  session({
    secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key",
    resave: false,
    saveUninitialized: true, // Changed to true for development
    cookie: {
      secure: false, // Changed to false for development (HTTP)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);`;

// Replace the session config
content = content.replace(
  /\/\/ Session configuration[\s\S]*?\),\n\);/,
  newSessionConfig
);

fs.writeFileSync('server/index.ts', content);
console.log('✅ Fixed session configuration for development');
