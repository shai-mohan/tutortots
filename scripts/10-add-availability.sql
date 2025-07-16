-- Create availability table for tutors
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_subject ON tutor_availability(tutor_id, subject);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_active ON tutor_availability(is_active);

-- Enable RLS
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tutors can manage their own availability" ON tutor_availability
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Students can view tutor availability" ON tutor_availability
  FOR SELECT USING (is_active = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tutor_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_tutor_availability_updated_at
  BEFORE UPDATE ON tutor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_availability_updated_at();
