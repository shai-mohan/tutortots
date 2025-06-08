-- Create admin user if not exists
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  
  IF admin_id IS NULL THEN
    -- Generate a UUID for admin
    admin_id := gen_random_uuid();
    
    -- Insert admin profile
    INSERT INTO profiles (
      id,
      name,
      email,
      role,
      verified,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      'System Administrator',
      'admin@imail.sunway.edu.my',
      'admin',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Admin user created with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', admin_id;
  END IF;
END $$;
