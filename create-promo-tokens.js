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
  
  // Create all needed tables for promo functionality
  const sql = `
    -- First create the special_offers table
    CREATE TABLE IF NOT EXISTS special_offers (
      id VARCHAR(50) PRIMARY KEY,
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      discount_type VARCHAR(20) NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      applicable_treatments JSONB,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      promo_code VARCHAR(50) UNIQUE,
      terms_conditions TEXT,
      banner_image VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      admin_approved BOOLEAN DEFAULT TRUE,
      commission_percentage INTEGER,
      promotion_level VARCHAR(50),
      homepage_display BOOLEAN DEFAULT FALSE,
      max_uses INTEGER DEFAULT NULL,
      used_count INTEGER DEFAULT 0,
      bonus JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      admin_reviewed_at TIMESTAMP,
      treatment_price_gbp DECIMAL(10,2),
      treatment_price_usd DECIMAL(10,2)
    );

    -- Create the standardized_treatments table
    CREATE TABLE IF NOT EXISTS standardized_treatments (
      code VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      base_price_gbp DECIMAL(10,2) NOT NULL,
      base_price_usd DECIMAL(10,2) NOT NULL,
      procedure_time_minutes INTEGER,
      recovery_time_days INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- Create treatment_packages table
    CREATE TABLE IF NOT EXISTS treatment_packages (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      items JSONB NOT NULL,
      total_price_gbp DECIMAL(10,2) NOT NULL,
      total_price_usd DECIMAL(10,2) NOT NULL,
      discount_pct INTEGER,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    -- Create the quotes table
    CREATE TABLE IF NOT EXISTS quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id INTEGER NOT NULL REFERENCES users(id),
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      status VARCHAR(20) DEFAULT 'draft' NOT NULL,
      total_price DECIMAL(10,2) DEFAULT 0,
      currency VARCHAR(3) DEFAULT 'GBP',
      source VARCHAR(20) DEFAULT 'normal',
      offer_id VARCHAR(50),
      package_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    -- Create promo_tokens table
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
    END $$;

    -- Create treatment_lines table if it doesn't exist
    CREATE TABLE IF NOT EXISTS treatment_lines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      patient_id INTEGER NOT NULL REFERENCES users(id),
      quote_id UUID NOT NULL,
      procedure_code VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER DEFAULT 1 NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      base_price_gbp DECIMAL(10,2),
      is_package BOOLEAN DEFAULT FALSE,
      package_id VARCHAR(50),
      is_locked BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'draft' NOT NULL,
      patient_notes TEXT,
      clinic_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
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