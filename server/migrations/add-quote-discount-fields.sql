-- Add promotional code fields to quote_requests table

-- First, check if columns already exist to avoid errors
DO $$
BEGIN
    -- Add promo_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quote_requests' AND column_name='promo_id') THEN
        ALTER TABLE quote_requests ADD COLUMN promo_id UUID;
    END IF;

    -- Add promo_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quote_requests' AND column_name='promo_code') THEN
        ALTER TABLE quote_requests ADD COLUMN promo_code VARCHAR(50);
    END IF;

    -- Add discount_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quote_requests' AND column_name='discount_type') THEN
        ALTER TABLE quote_requests ADD COLUMN discount_type VARCHAR(20);
    END IF;

    -- Add discount_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quote_requests' AND column_name='discount_value') THEN
        ALTER TABLE quote_requests ADD COLUMN discount_value DECIMAL(10, 2);
    END IF;

    -- Add subtotal column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quote_requests' AND column_name='subtotal') THEN
        ALTER TABLE quote_requests ADD COLUMN subtotal DECIMAL(10, 2);
    END IF;

    -- Add total_after_discount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quote_requests' AND column_name='total_after_discount') THEN
        ALTER TABLE quote_requests ADD COLUMN total_after_discount DECIMAL(10, 2);
    END IF;

    RAISE NOTICE 'Quote_requests table updated with promo code and discount fields';
END
$$;