-- Create test users for all three portals
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, status, created_at, last_login_at) 
VALUES 
  ('admin@mydentalfly.com', '$2b$10$rGJZvKvx.lKZlZjXrZeZWu7fzWqZzKGKfGkZvKvx.lKZlZjXrZeZWu', 'Admin', 'User', 'admin', true, 'active', NOW(), NOW()),
  ('clinic@mydentalfly.com', '$2b$10$rGJZvKvx.lKZlZjXrZeZWu7fzWqZzKGKfGkZvKvx.lKZlZjXrZeZWu', 'Clinic', 'Staff', 'clinic_staff', true, 'active', NOW(), NOW()),
  ('patient@mydentalfly.com', '$2b$10$rGJZvKvx.lKZlZjXrZeZWu7fzWqZzKGKfGkZvKvx.lKZlZjXrZeZWu', 'Test', 'Patient', 'patient', true, 'active', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
