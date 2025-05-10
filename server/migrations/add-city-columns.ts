import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Migration to add city code and name to treatment packages and special offers
 * This supports the new city filtering functionality
 */
export async function addCityColumns() {
  console.log('Running migration: add-city-columns');
  
  try {
    // Add city columns to treatment_packages table
    await db.execute(sql`
      ALTER TABLE treatment_packages 
      ADD COLUMN IF NOT EXISTS city_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS city_name VARCHAR(100)
    `);
    
    console.log('Added city columns to treatment_packages table');
    
    // Add city columns to special_offers table
    await db.execute(sql`
      ALTER TABLE special_offers 
      ADD COLUMN IF NOT EXISTS city_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS city_name VARCHAR(100)
    `);
    
    console.log('Added city columns to special_offers table');
    
    // Add indexes for faster city-based filtering
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_treatment_packages_city_code ON treatment_packages (city_code)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_special_offers_city_code ON special_offers (city_code)`);
    
    console.log('Created indexes for city_code columns');
    
    return { success: true, message: 'Successfully added city columns to tables' };
  } catch (error) {
    console.error('Error adding city columns:', error);
    return { success: false, message: 'Failed to add city columns', error };
  }
}