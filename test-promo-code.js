/**
 * Test script to create a promo code for testing
 */
require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function setupTestPromoCode() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Creating test promotional code...');
    
    // Create a promo with a specific code
    const promoResult = await pool.query(`
      INSERT INTO promos (
        id, title, description, image_url, is_active, start_date, end_date,
        discount_type, discount_value, code, city_code
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      ON CONFLICT (code) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        discount_type = EXCLUDED.discount_type,
        discount_value = EXCLUDED.discount_value
      RETURNING *
    `, [
      uuidv4(),
      'Welcome Discount 20%',
      'Get 20% off your first dental treatment quote with this promo code.',
      'https://source.unsplash.com/random/800x600/?smile',
      true,
      new Date(),
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      'PERCENT',
      20,
      'WELCOME20',
      'IST' // Istanbul city code
    ]);
    
    console.log('Created promo:', promoResult.rows[0]);
    
    // Associate promo with all clinics for testing purposes
    // First, get all clinic IDs
    const clinicsResult = await pool.query(`
      SELECT id FROM clinics
    `);
    
    if (clinicsResult.rows.length > 0) {
      const promoId = promoResult.rows[0].id;
      
      for (const clinic of clinicsResult.rows) {
        // Check if association already exists
        const existingAssoc = await pool.query(`
          SELECT * FROM promo_clinics 
          WHERE promo_id = $1 AND clinic_id = $2
        `, [promoId, clinic.id]);
        
        if (existingAssoc.rows.length === 0) {
          // Create association if it doesn't exist
          await pool.query(`
            INSERT INTO promo_clinics (promo_id, clinic_id)
            VALUES ($1, $2)
          `, [promoId, clinic.id]);
          
          console.log(`Associated promo with clinic ID: ${clinic.id}`);
        } else {
          console.log(`Promo already associated with clinic ID: ${clinic.id}`);
        }
      }
    }
    
    console.log('\nPromo code successfully created and associated with clinics.');
    console.log('You can now test the coupon code: WELCOME20');
    
  } catch (error) {
    console.error('Error creating test promo code:', error);
  } finally {
    await pool.end();
  }
}

setupTestPromoCode().catch(console.error);