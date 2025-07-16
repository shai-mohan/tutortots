-- Add profile photo fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_size INTEGER;

-- Create profile_photos table for better organization (optional)
CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_name TEXT NOT NULL,
  photo_type TEXT NOT NULL,
  photo_size INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profile_photos table
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

-- Profile photos policies
CREATE POLICY "Users can view their own photos" ON profile_photos
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upload their own photos" ON profile_photos
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own photos" ON profile_photos
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own photos" ON profile_photos
  FOR DELETE USING (user_id = auth.uid());

-- Allow public viewing of profile photos for verified users
CREATE POLICY "Public can view photos of verified users" ON profile_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = user_id AND verified = true
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_current ON profile_photos(user_id, is_current);
