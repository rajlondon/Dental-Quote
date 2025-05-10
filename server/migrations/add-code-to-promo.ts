/**
 * Migration: Add code column to promo table
 * This adds support for coupon codes alongside the existing slug/token system
 */

import { db, pool } from '../db';

export async function addCodeToPromo() {
  console.log('Starting migration: Adding code column to promo table');

  try {
    // Start a transaction for safety
    await pool.query('BEGIN');
    
    // Check if column already exists
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'promo' AND column_name = 'code'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Add the code column if it doesn't exist
      await pool.query(`
        ALTER TABLE "promo" ADD COLUMN "code" VARCHAR UNIQUE;
      `);
      console.log('Successfully added code column to promo table');
    } else {
      console.log('Code column already exists in promo table');
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    return true;
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

// Execute the migration if this file is run directly
if (require.main === module) {
  addCodeToPromo()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}