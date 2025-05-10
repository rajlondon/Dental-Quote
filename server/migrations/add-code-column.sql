-- Add a code column to the promos table for coupon codes
ALTER TABLE promos
ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Add a unique constraint to ensure codes are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_promos_code ON promos (code)
WHERE code IS NOT NULL;

-- Update existing promos with default codes based on their title
UPDATE promos
SET code = UPPER(REPLACE(SUBSTRING(title FROM 1 FOR 10), ' ', ''))
WHERE code IS NULL;