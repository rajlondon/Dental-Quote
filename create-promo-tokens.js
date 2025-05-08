// Script to create promo_tokens table
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

try {
  console.log('Creating promo_tokens table...');
  
  // Create quotes and promo_tokens tables
  const sql = `
    -- First create the quotes table
    CREATE TABLE IF NOT EXISTS quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id INTEGER NOT NULL REFERENCES users(id),
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      status VARCHAR(20) DEFAULT 'draft' NOT NULL,
      total_price DECIMAL(10,2) DEFAULT 0,
      currency VARCHAR(3) DEFAULT 'GBP',
      source VARCHAR(20) DEFAULT 'normal',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    -- Then create promo_tokens table
    CREATE TABLE IF NOT EXISTS promo_tokens (
      token VARCHAR(50) PRIMARY KEY,
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      promo_type VARCHAR(20) NOT NULL,
      payload JSONB NOT NULL,
      valid_until DATE NOT NULL,
      display_on_home BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    -- Add specialized fields to quotes table
    DO $$ 
    BEGIN
      -- Add promo_token field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'promo_token'
      ) THEN
        ALTER TABLE quotes 
        ADD COLUMN promo_token VARCHAR(50) REFERENCES promo_tokens(token);
      END IF;
      
      -- Add offer_id field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'offer_id'
      ) THEN
        ALTER TABLE quotes 
        ADD COLUMN offer_id VARCHAR(50);
      END IF;
      
      -- Add package_id field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'package_id'
      ) THEN
        ALTER TABLE quotes 
        ADD COLUMN package_id VARCHAR(50);
      END IF;
    END $$;
  `;

  // Execute SQL directly for simple schema changes
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  pool.query(sql)
    .then(() => {
      console.log('✅ promo_tokens table created successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error creating promo_tokens table:', err);
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error executing schema creation:', error);
  process.exit(1);
}