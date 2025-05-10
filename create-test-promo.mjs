/**
 * Test script to create a promo code for testing
 */
import 'dotenv/config';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

async function createTestPromo() {
  // Create a PostgreSQL client
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create a test promo with a code
    const promoId = uuidv4();
    const testCode = "WELCOME20";
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // Valid for 1 year

    // First check if a promo with this code already exists
    const checkResult = await pool.query(
      'SELECT * FROM promos WHERE code = $1',
      [testCode]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`Promo code ${testCode} already exists with ID: ${checkResult.rows[0].id}`);
      return checkResult.rows[0];
    }

    // Insert the promo
    const promoResult = await pool.query(
      `INSERT INTO promos (
        id, slug, code, title, description, promo_type, discount_type, discount_value,
        hero_image_url, start_date, end_date, is_active, city_code, country_code,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        promoId,                                          // id
        'welcome-discount',                               // slug
        testCode,                                         // code
        'Welcome Discount',                               // title
        'Special welcome discount for new patients',      // description
        'OFFER',                                          // promo_type
        'PERCENT',                                        // discount_type
        '20',                                             // discount_value (20%)
        'https://placehold.co/600x400/e9f5ff/4299e1/png?text=Welcome+Discount', // hero_image_url
        now,                                              // start_date
        endDate,                                          // end_date
        true,                                             // is_active
        'IST',                                            // city_code (Istanbul)
        'TR',                                             // country_code (Turkey)
        now,                                              // created_at
        now                                               // updated_at
      ]
    );

    const promo = promoResult.rows[0];
    console.log(`Created test promo code: ${testCode} with ID: ${promo.id}`);

    // Now connect this promo to all clinics
    const clinicsResult = await pool.query('SELECT id FROM clinics');
    const clinics = clinicsResult.rows;

    // If there are no clinics, create a default one
    if (clinics.length === 0) {
      console.log('No clinics found - creating a default clinic');
      const clinicId = '1';
      await pool.query(
        `INSERT INTO clinics (id, name, city, country) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO NOTHING`,
        [clinicId, 'Default Clinic', 'Istanbul', 'Turkey']
      );
      clinics.push({ id: clinicId });
    }

    // Connect the promo to each clinic
    for (const clinic of clinics) {
      const promoClinicId = uuidv4();
      await pool.query(
        `INSERT INTO promo_clinics (id, promo_id, clinic_id, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (promo_id, clinic_id) DO NOTHING`,
        [promoClinicId, promoId, clinic.id, now]
      );
      console.log(`Connected promo to clinic ${clinic.id}`);
    }

    console.log('Setup complete - test promo code ready to use');
    return promo;
  } catch (error) {
    console.error('Error setting up test promo code:', error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the setup function
createTestPromo()
  .then(() => console.log('Test promo created successfully!'))
  .catch(err => {
    console.error('Failed to create test promo:', err);
    process.exit(1);
  });