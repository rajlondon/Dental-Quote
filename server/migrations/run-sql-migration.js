/**
 * Simple SQL migration runner
 * Usage: node run-sql-migration.js path/to/migration.sql
 */
import fs from 'fs';
import path from 'path';
import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import ws from 'ws';

// Initialize dotenv
dotenv.config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  if (!process.argv[2]) {
    console.error('Please provide a migration file path');
    process.exit(1);
  }

  // Handle relative or absolute path
  const migrationPath = process.argv[2].startsWith('/') 
    ? process.argv[2] 
    : path.resolve(__dirname, process.argv[2]);
    
  console.log(`Running migration: ${migrationPath}`);

  // Check if file exists
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  // Read migration SQL
  const sql = fs.readFileSync(migrationPath, 'utf8');
  console.log(`Migration SQL:\n${sql}`);

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Run migration in a transaction
    await pool.query('BEGIN');
    const result = await pool.query(sql);
    await pool.query('COMMIT');
    
    console.log('Migration completed successfully');
    console.log('Result:', result);
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});