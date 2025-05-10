import fs from 'fs';
import path from 'path';
import { pool } from '../db';
import log from '../utils/logger';

/**
 * Runs all migration files on server start
 */
export async function runMigrations() {
  try {
    log.info('Running database migrations...');
    
    // Get all migration SQL files
    const migrationsDir = path.join(__dirname);
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => path.join(migrationsDir, file))
      .sort(); // Ensure files are executed in alphabetical order
    
    log.info(`Found ${sqlFiles.length} migration files to execute`);
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Get already executed migrations
    const { rows } = await pool.query('SELECT filename FROM migrations');
    const executedMigrations = new Set(rows.map(row => row.filename));
    
    // Execute each migration file if not already executed
    for (const sqlFile of sqlFiles) {
      const filename = path.basename(sqlFile);
      
      if (executedMigrations.has(filename)) {
        log.info(`Migration ${filename} already executed, skipping`);
        continue;
      }
      
      log.info(`Executing migration: ${filename}`);
      
      // Read and execute the SQL file
      const sql = fs.readFileSync(sqlFile, 'utf8');
      await pool.query(sql);
      
      // Record that this migration was executed
      await pool.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
      
      log.info(`Migration ${filename} executed successfully`);
    }
    
    log.info('All migrations completed successfully');
  } catch (error) {
    log.error('Error running migrations:', error);
    throw error; // Re-throw to allow the caller to handle it
  }
}