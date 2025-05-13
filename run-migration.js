/**
 * Migration script for adding promo code fields to quotes table
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading migration file...');
    const migrationFile = join(__dirname, 'scripts', 'migrations', 'add-promo-fields-to-quotes.sql');
    const migrationSql = readFileSync(migrationFile, 'utf8');
    
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