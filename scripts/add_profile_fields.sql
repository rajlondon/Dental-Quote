-- Add new profile fields to users table

-- Check if columns already exist and add them if they don't
DO $$
BEGIN
    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address VARCHAR(255);
    END IF;

    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth VARCHAR(20);
    END IF;

    -- Add nationality column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'nationality') THEN
        ALTER TABLE users ADD COLUMN nationality VARCHAR(100);
    END IF;

    -- Add preferred_language column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferred_language') THEN
        ALTER TABLE users ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'English';
    END IF;

    -- Add passport_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'passport_number') THEN
        ALTER TABLE users ADD COLUMN passport_number VARCHAR(50);
    END IF;

    -- Add emergency_contact column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'emergency_contact') THEN
        ALTER TABLE users ADD COLUMN emergency_contact JSONB;
    END IF;

    -- Add medical_info column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'medical_info') THEN
        ALTER TABLE users ADD COLUMN medical_info JSONB;
    END IF;

    -- Add profile_complete column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_complete') THEN
        ALTER TABLE users ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
    END IF;

    RAISE NOTICE 'Profile fields added successfully';
END $$;

-- Set default values for emergency contact and medical info
UPDATE users 
SET emergency_contact = '{"name":"","relationship":"","phone":"","email":""}'::JSONB,
    medical_info = '{"allergies":[],"medications":[],"conditions":[],"notes":""}'::JSONB
WHERE emergency_contact IS NULL OR medical_info IS NULL;

-- Update the default for preferred_language
ALTER TABLE users ALTER COLUMN preferred_language SET DEFAULT 'English';

-- Create indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_complete ON users(profile_complete);