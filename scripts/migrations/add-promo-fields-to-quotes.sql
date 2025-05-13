-- Migration to add promo code fields to quotes table
-- This adds fields to store promo code information when applied to a quote

-- Add promo_code field (the actual code string, like "WELCOME20")
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);

-- Add promo_type field (percentage or fixed)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS promo_type VARCHAR(20) CHECK (promo_type IN ('percentage', 'fixed'));

-- Add promo_value field (the discount amount/percentage)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS promo_value DECIMAL(10,2);

-- Add promo_applied_at field (timestamp when promo was applied)
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS promo_applied_at TIMESTAMP;

-- Note: promoId field already exists in quotes table as referenced in schema.ts
-- ALTER TABLE quotes
-- ADD COLUMN IF NOT EXISTS promo_id UUID REFERENCES promos(id);

-- Update the quotes table to set not null constraints on existing fields
-- This ensures all quotes have these values properly set
ALTER TABLE quotes
ALTER COLUMN discount SET DEFAULT 0,
ALTER COLUMN subtotal SET DEFAULT 0,
ALTER COLUMN total SET DEFAULT 0;

-- Add an index to improve query performance when searching by promo_code
CREATE INDEX IF NOT EXISTS quotes_promo_code_idx ON quotes(promo_code);