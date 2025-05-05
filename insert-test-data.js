// Script to insert test data for the Treatment Plan Module
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function insertTestData() {
  console.log('Inserting test data for Treatment Plan Module...');
  
  // Connect to the database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // We know we have a clinic with ID 1
    const clinicId = 1;
    console.log(`Using clinic ID: ${clinicId}`);
    
    // We know we have a patient with ID 45 (patient@mydentalfly.com)
    const patientId = 45;
    console.log(`Using patient ID: ${patientId}`);
    
    // Insert sample packages if they don't exist yet
    const existingPackagesResult = await pool.query('SELECT COUNT(*) FROM packages');
    
    if (parseInt(existingPackagesResult.rows[0].count) === 0) {
      console.log('Inserting sample packages...');
      
      // Sample packages
      const packages = [
        {
          id: uuidv4(),
          clinic_id: clinicId,
          name: 'Complete Smile Makeover',
          description: 'Full dental restoration package including cleaning, whitening, and veneers for a complete smile transformation.',
          procedure_code: 'SMILE_MAKEOVER',
          price: '1499.99',
          currency: 'GBP',
          is_active: true,
          includes_hotel: true,
          hotel_details: JSON.stringify({
            nights: 5,
            hotelName: 'Grand Dental Resort',
            roomType: 'Deluxe',
            mealsIncluded: true
          }),
          treatment_duration: 7,
          featured_on_homepage: true,
          admin_approved: true
        },
        {
          id: uuidv4(),
          clinic_id: clinicId,
          name: 'All-on-4 Dental Implants',
          description: 'Complete arch restoration with just 4 implants. Includes consultation, surgery, and follow-up care.',
          procedure_code: 'ALL_ON_4',
          price: '3999.99',
          currency: 'GBP',
          is_active: true,
          includes_hotel: true,
          hotel_details: JSON.stringify({
            nights: 7,
            hotelName: 'Implant Recovery Suite',
            roomType: 'Premium',
            mealsIncluded: true,
            transferIncluded: true
          }),
          includes_flight: true,
          flight_details: JSON.stringify({
            class: 'Economy',
            departureAirport: 'LHR',
            returnAirport: 'LHR',
            allowedBaggage: '23kg'
          }),
          treatment_duration: 10,
          featured_on_homepage: true,
          admin_approved: true
        },
        {
          id: uuidv4(),
          clinic_id: clinicId,
          name: 'Basic Dental Checkup',
          description: 'Comprehensive dental examination including X-rays and cleaning.',
          procedure_code: 'BASIC_CHECKUP',
          price: '179.99',
          currency: 'GBP',
          is_active: true,
          treatment_duration: 1,
          featured_on_homepage: false,
          admin_approved: true
        }
      ];
      
      for (const pkg of packages) {
        await pool.query(`
          INSERT INTO packages (
            id, clinic_id, name, description, procedure_code, price, currency,
            is_active, includes_hotel, hotel_details, includes_flight, flight_details,
            treatment_duration, featured_on_homepage, admin_approved
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, 
            $8, $9, $10, $11, $12,
            $13, $14, $15
          )
        `, [
          pkg.id, pkg.clinic_id, pkg.name, pkg.description, pkg.procedure_code, pkg.price, pkg.currency,
          pkg.is_active, pkg.includes_hotel, pkg.hotel_details, pkg.includes_flight || false, pkg.flight_details || null,
          pkg.treatment_duration, pkg.featured_on_homepage, pkg.admin_approved
        ]);
      }
      
      console.log(`✅ Inserted ${packages.length} sample packages`);
    } else {
      console.log(`ℹ️ Found ${existingPackagesResult.rows[0].count} existing packages, skipping insertion`);
    }
    
    // Insert sample treatment lines if they don't exist yet
    const existingTreatmentLinesResult = await pool.query('SELECT COUNT(*) FROM treatment_lines');
    
    if (parseInt(existingTreatmentLinesResult.rows[0].count) === 0) {
      console.log('Inserting sample treatment lines...');
      
      // Get the package IDs we just inserted
      const packagesResult = await pool.query('SELECT id FROM packages LIMIT 3');
      const packageIds = packagesResult.rows.map(row => row.id);
      
      // Generate a quote ID
      const quoteId = uuidv4();
      
      // Sample treatment lines
      const treatmentLines = [
        {
          id: uuidv4(),
          clinic_id: clinicId,
          patient_id: patientId,
          quote_id: quoteId,
          procedure_code: 'TEETH_CLEANING',
          description: 'Professional teeth cleaning and polishing',
          quantity: 1,
          unit_price: '89.99',
          is_package: false,
          status: 'confirmed'
        },
        {
          id: uuidv4(),
          clinic_id: clinicId,
          patient_id: patientId,
          quote_id: quoteId,
          procedure_code: 'SMILE_MAKEOVER',
          description: 'Complete Smile Makeover Package',
          quantity: 1,
          unit_price: '1499.99',
          is_package: true,
          package_id: packageIds[0],
          status: 'confirmed',
          patient_notes: 'I prefer less invasive options if possible'
        },
        {
          id: uuidv4(),
          clinic_id: clinicId,
          patient_id: patientId,
          quote_id: quoteId,
          procedure_code: 'WHITENING',
          description: 'Professional teeth whitening treatment',
          quantity: 1,
          unit_price: '249.99',
          is_package: false,
          status: 'draft'
        }
      ];
      
      for (const line of treatmentLines) {
        await pool.query(`
          INSERT INTO treatment_lines (
            id, clinic_id, patient_id, quote_id, procedure_code, description,
            quantity, unit_price, is_package, package_id, status, patient_notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12
          )
        `, [
          line.id, line.clinic_id, line.patient_id, line.quote_id, line.procedure_code, line.description,
          line.quantity, line.unit_price, line.is_package, line.package_id || null, line.status, line.patient_notes || null
        ]);
      }
      
      console.log(`✅ Inserted ${treatmentLines.length} sample treatment lines`);
    } else {
      console.log(`ℹ️ Found ${existingTreatmentLinesResult.rows[0].count} existing treatment lines, skipping insertion`);
    }
    
    console.log('✅ Test data insertion completed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
    process.exit(1);
  }
}

// Run the function
insertTestData();