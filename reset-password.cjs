/**
 * Test script to reset a user password for testing
 */
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.error('Usage: node reset-password.cjs <email> <new_password>');
    process.exit(1);
  }
  
  // Create a direct pool connection using DATABASE_URL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log(`🔒 Attempting to reset password for ${email}...`);
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password in the database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role',
      [hashedPassword, email]
    );
    
    if (result.rowCount === 0) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }
    
    const user = result.rows[0];
    console.log(`✅ Password reset successful for user:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   New password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

resetPassword();