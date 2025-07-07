
const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const { WebSocket } = require('ws');

// Configure WebSocket for Neon Serverless in Node.js environment
if (!globalThis.WebSocket) {
  console.log("Setting up WebSocket for Neon Serverless in Node.js environment");
  globalThis.WebSocket = WebSocket;
}

async function createTestUser() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  // Create a connection pool to the database
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    maxUses: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('🔌 Connected to PostgreSQL database');
    
    // Step 1: Test database connection
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', connectionTest.rows[0].current_time);
    
    // Step 2: Hash password using bcrypt
    const testEmail = 'admin@mydentalfly.com';
    const testPassword = 'Admin123!';
    const saltRounds = 10;
    
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    console.log('✅ Password hashed successfully, length:', hashedPassword.length);
    
    // Step 3: Check if user already exists
    console.log('\n🔍 Checking if user already exists...');
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('👤 User already exists:', existingUser.rows[0].email);
      console.log('📊 User details:');
      console.log('   - ID:', existingUser.rows[0].id);
      console.log('   - Email:', existingUser.rows[0].email);
      console.log('   - Role:', existingUser.rows[0].role);
      console.log('   - Has password:', !!existingUser.rows[0].password_hash);
      
      // Test the existing password
      if (existingUser.rows[0].password_hash) {
        const testResult = await bcrypt.compare(testPassword, existingUser.rows[0].password_hash);
        console.log('🔑 Password test result:', testResult);
      }
      
      return;
    }
    
    // Step 4: Create new user
    console.log('\n➕ Creating new user...');
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at, email_verified, status) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true, 'active') 
       RETURNING id, email, role, first_name, last_name, password_hash`,
      [testEmail, hashedPassword, 'Admin', 'User', 'admin']
    );
    
    const newUser = result.rows[0];
    console.log('✅ User created successfully!');
    console.log('📊 New user details:');
    console.log('   - ID:', newUser.id);
    console.log('   - Email:', newUser.email);
    console.log('   - Role:', newUser.role);
    console.log('   - Name:', newUser.first_name, newUser.last_name);
    console.log('   - Password hash length:', newUser.password_hash?.length);
    
    // Step 5: Test the password immediately
    console.log('\n🔐 Testing password...');
    const testResult = await bcrypt.compare(testPassword, newUser.password_hash);
    console.log('🔑 Password test result:', testResult);
    
    if (testResult) {
      console.log('🎉 SUCCESS! User created and password verified.');
      console.log('🔑 Login credentials:');
      console.log('   - Email:', testEmail);
      console.log('   - Password:', testPassword);
    } else {
      console.log('❌ WARNING: Password test failed. There may be an issue with the password hash.');
    }
    
  } catch (error) {
    console.error('❌ Error during user creation:', error);
    throw error;
  } finally {
    // Close the pool connection
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the function
createTestUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
