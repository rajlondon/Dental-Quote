import { addCityColumns } from './add-city-columns';
import { addCodeToPromo } from './add-code-to-promo';
import { db, pool } from '../db';

/**
 * Migration runner that executes all migrations in sequence
 */
async function runMigrations() {
  console.log('Starting migrations...');
  
  try {
    // Check database connection
    await db.execute('SELECT 1');
    console.log('Database connection successful');
    
    // Run migrations in sequence
    const migrations = [
      { name: 'addCityColumns', fn: addCityColumns },
      { name: 'addCodeToPromo', fn: addCodeToPromo },
      // Add future migrations here
    ];
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      try {
        const result = await migration.fn();
        console.log(`✅ Migration ${migration.name} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} failed:`, error.message || 'Unknown error');
        console.error(error);
      }
    }
    
    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration process failed:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run migrations when executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
}

export { runMigrations };