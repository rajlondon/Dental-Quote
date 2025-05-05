// Simple script to push schema changes
import { execSync } from 'child_process';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

try {
  console.log('Pushing schema changes to database...');
  
  // Create tables for treatment plans module
  const sql = `
    CREATE TABLE IF NOT EXISTS packages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(255),
      procedure_code VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'GBP',
      is_active BOOLEAN DEFAULT TRUE,
      includes_hotel BOOLEAN DEFAULT FALSE,
      hotel_details JSONB,
      includes_flight BOOLEAN DEFAULT FALSE,
      flight_details JSONB,
      treatment_duration INTEGER,
      featured_on_homepage BOOLEAN DEFAULT FALSE,
      admin_approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS treatment_lines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clinic_id INTEGER NOT NULL REFERENCES clinics(id),
      patient_id INTEGER NOT NULL REFERENCES users(id),
      quote_id UUID NOT NULL,
      procedure_code VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER DEFAULT 1 NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      is_package BOOLEAN DEFAULT FALSE,
      package_id UUID REFERENCES packages(id),
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
      console.log('✅ Treatment Plans tables created successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error creating tables:', err);
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error executing schema push:', error);
  process.exit(1);
}