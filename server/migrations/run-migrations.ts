import { addCityColumns } from './add-city-columns';
import { db } from '../db';

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
      // Add future migrations here
    ];
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      const result = await migration.fn();
      
      if (result.success) {
        console.log(`✅ Migration ${migration.name} completed successfully`);
      } else {
        console.error(`❌ Migration ${migration.name} failed:`, result.message);
        if (result.error) {
          console.error(result.error);
        }
      }
    }
    
    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration process failed:', error);
  } finally {
    // Close the database connection
    await db.end();
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