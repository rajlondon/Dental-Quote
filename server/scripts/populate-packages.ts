import { db } from '../db';
import { treatmentPackages, packageTreatments, packageInclusions } from '../../shared/schema';
import { hardcodedTreatmentPackages } from '../routes/treatment-package-routes';
import { sql } from 'drizzle-orm';

async function populatePackages() {
  console.log('🚀 Starting database population...');
  
  try {
    // Create tables first (if they don't exist)
    console.log('📋 Creating tables if they don\'t exist...');
    
    // Insert packages (will create table if needed)
    console.log('✅ Tables ready, inserting data...');
    
    // Insert packages one by one
    for (const pkg of hardcodedTreatmentPackages) {
      try {
        await db.insert(treatmentPackages).values({
          id: pkg.id,
          name: pkg.title,
          description: pkg.description,
          packagePrice: pkg.price.toString(),
          originalPrice: pkg.originalPrice?.toString() || pkg.price.toString(),
          clinicId: 1
        });
        
        console.log(`✅ Inserted package: ${pkg.title}`);
      } catch (error) {
        console.log(`⚠️  Package ${pkg.title} might already exist, skipping...`);
      }
    }
    
    console.log('🎉 Database population complete!');
  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

populatePackages();
