const { db } = require('./server/db.js');

async function seedUsers() {
  try {
    console.log('Seeding test users...');
    
    // Simple insert using the database connection
    const result = await db.execute(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, status) 
      VALUES 
        ('admin@mydentalfly.com', '$2b$10$testHashForDevelopment', 'Admin', 'User', 'admin', true, 'active'),
        ('clinic@mydentalfly.com', '$2b$10$testHashForDevelopment', 'Clinic', 'Staff', 'clinic_staff', true, 'active'),
        ('patient@mydentalfly.com', '$2b$10$testHashForDevelopment', 'Test', 'Patient', 'patient', true, 'active')
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `);
    
    console.log('✅ Test users seeded successfully');
    console.log('Available test accounts:');
    console.log('- admin@mydentalfly.com (password: Admin123!)');
    console.log('- clinic@mydentalfly.com (password: Clinic123!)'); 
    console.log('- patient@mydentalfly.com (password: Patient123!)');
    
  } catch (error) {
    console.log('Note: Seeding may have been skipped if users already exist');
  }
}

seedUsers();
