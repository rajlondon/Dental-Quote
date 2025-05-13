/**
 * Migration script for adding promo code fields to quotes table
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading migration file...');
    const migrationFile = path.join(__dirname, 'scripts', 'migrations', 'add-promo-fields-to-quotes.sql');
    const migrationSql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration...');
    console.log(migrationSql);
    
    await client.query(migrationSql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();