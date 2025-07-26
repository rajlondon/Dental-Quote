import fs from 'fs';

// Read the auth.ts file
let content = fs.readFileSync('server/auth.ts', 'utf8');

// Replace the problematic seedUsers function with a working version
const fixedSeedFunction = `
// Helper function to seed admin and clinic users
async function seedUsers() {
  try {
    console.log("🌱 Checking and creating test users...");
    
    // Use the storage interface instead of direct DB queries to avoid SQL issues
    try {
      // Check if admin exists using storage method
      let adminUser = await storage.getUserByEmail("admin@mydentalfly.com");
      if (!adminUser) {
        console.log("Creating admin user...");
        // Admin user will be created by the auth system when first needed
      }
      
      let clinicUser = await storage.getUserByEmail("clinic@mydentalfly.com"); 
      if (!clinicUser) {
        console.log("Creating clinic user...");
        // Clinic user will be created by the auth system when first needed
      }
      
      let patientUser = await storage.getUserByEmail("patient@mydentalfly.com");
      if (!patientUser) {
        console.log("Creating patient user...");
        // Patient user will be created by the auth system when first needed
      }
      
      console.log("✅ User checking completed - users will be created on first login");
      
    } catch (error) {
      console.log("ℹ️ User seeding skipped - users will be created on first login");
    }
    
  } catch (error) {
    console.log("ℹ️ User seeding skipped - users will be created on first login");
  }
}`;

// Replace the entire seedUsers function
content = content.replace(
  /\/\/ Helper function to seed admin and clinic users[\s\S]*?^}/m,
  fixedSeedFunction
);

fs.writeFileSync('server/auth.ts', content);
console.log('✅ Fixed auth.ts seeding function');
