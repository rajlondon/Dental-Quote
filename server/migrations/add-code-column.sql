-- Add code column to promos table
ALTER TABLE "promos" ADD COLUMN IF NOT EXISTS "code" VARCHAR(50) UNIQUE;