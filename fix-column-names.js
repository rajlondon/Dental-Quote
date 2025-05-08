// Script to fix column names for special_offers
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

try {
  console.log('Fixing column names in special_offers table...');
  
  // SQL to fix column names to match Drizzle schema
  const sql = `
    -- First check if terms_conditions exists, if so rename it to terms_and_conditions
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'terms_conditions'
      ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'terms_and_conditions'
      ) THEN
        ALTER TABLE special_offers 
        RENAME COLUMN terms_conditions TO terms_and_conditions;
        RAISE NOTICE 'Column renamed from terms_conditions to terms_and_conditions';
      ELSE
        RAISE NOTICE 'No column rename needed';
      END IF;
    END $$;
    
    -- Add missing columns that might be missing based on schema.ts
    DO $$ 
    BEGIN
      -- Add termsAndConditions field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'terms_and_conditions'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN terms_and_conditions TEXT;
        RAISE NOTICE 'Added terms_and_conditions column';
      END IF;
      
      -- Add badge_text field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'badge_text'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN badge_text VARCHAR(50);
        RAISE NOTICE 'Added badge_text column';
      END IF;
      
      -- Add display_on_homepage field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'display_on_homepage'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN display_on_homepage BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added display_on_homepage column';
      END IF;
      
      -- Add featured field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'featured'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN featured BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added featured column';
      END IF;
      
      -- Add sort_order field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'sort_order'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE 'Added sort_order column';
      END IF;
      
      -- Add min_treatment_count field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'min_treatment_count'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN min_treatment_count INTEGER DEFAULT 1;
        RAISE NOTICE 'Added min_treatment_count column';
      END IF;
      
      -- Add max_discount_amount field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'max_discount_amount'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN max_discount_amount DECIMAL(10, 2);
        RAISE NOTICE 'Added max_discount_amount column';
      END IF;
      
      -- Add image_url field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'image_url'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN image_url VARCHAR(255);
        RAISE NOTICE 'Added image_url column';
      END IF;
      
      -- Add status field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'status'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'Added status column';
      END IF;
      
      -- Add created_by field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'created_by'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN created_by INTEGER;
        RAISE NOTICE 'Added created_by column';
      END IF;
      
      -- Add approved_by field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'approved_by'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN approved_by INTEGER;
        RAISE NOTICE 'Added approved_by column';
      END IF;
      
      -- Add is_active field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'is_active'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column';
      END IF;
    END $$;
  `;

  // Execute SQL directly for simple schema changes
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  pool.query(sql)
    .then((result) => {
      console.log('✅ Special offers table column names fixed successfully');
      console.log(result);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error fixing column names:', err);
      process.exit(1);
    });
  
} catch (error) {
  console.error('❌ Error executing schema fixes:', error);
  process.exit(1);
}