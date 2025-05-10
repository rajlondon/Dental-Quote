-- Add discount fields to the quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0.00;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0.00;

-- Add promo_id field to track which promo was applied
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS promo_id UUID REFERENCES promos(id) ON DELETE SET NULL;

-- Update existing quotes to set the subtotal = total_price where subtotal is null
UPDATE quotes
SET subtotal = total_price
WHERE subtotal IS NULL;

-- Create an index on promo_id for performance
CREATE INDEX IF NOT EXISTS idx_quotes_promo_id ON quotes (promo_id);