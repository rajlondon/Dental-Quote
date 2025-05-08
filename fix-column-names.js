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
      
      -- Add approved_at field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'approved_at'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN approved_at TIMESTAMP;
        RAISE NOTICE 'Added approved_at column';
      END IF;
      
      -- Add created_at field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'created_at'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
      END IF;
      
      -- Add updated_at field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column';
      END IF;
      
      -- Add start_date field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'start_date'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added start_date column';
      END IF;
      
      -- Add end_date field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'end_date'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN end_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');
        RAISE NOTICE 'Added end_date column';
      END IF;
      
      -- Add rejection_reason field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'rejection_reason'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN rejection_reason TEXT;
        RAISE NOTICE 'Added rejection_reason column';
      END IF;
      
      -- Add admin_reviewed_at field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'admin_reviewed_at'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN admin_reviewed_at TIMESTAMP;
        RAISE NOTICE 'Added admin_reviewed_at column';
      END IF;
      
      -- Add valid_until field if it doesn't exist (alias for end_date)
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'valid_until'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN valid_until TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');
        RAISE NOTICE 'Added valid_until column';
      END IF;
      
      -- Add commission_percentage field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'commission_percentage'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN commission_percentage INTEGER;
        RAISE NOTICE 'Added commission_percentage column';
      END IF;
      
      -- Add promotion_level field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'promotion_level'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN promotion_level VARCHAR(50);
        RAISE NOTICE 'Added promotion_level column';
      END IF;
      
      -- Add homepage_display field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'homepage_display'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN homepage_display BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added homepage_display column';
      END IF;
      
      -- Add banner_image field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'banner_image'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN banner_image VARCHAR(255);
        RAISE NOTICE 'Added banner_image column';
      END IF;
      
      -- Add admin_approved field if it doesn't exist
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'special_offers' 
        AND column_name = 'admin_approved'
      ) THEN
        ALTER TABLE special_offers 
        ADD COLUMN admin_approved BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added admin_approved column';
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