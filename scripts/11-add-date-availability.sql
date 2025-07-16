-- Add date-specific availability fields to existing table
ALTER TABLE tutor_availability ADD COLUMN IF NOT EXISTS availability_type TEXT DEFAULT 'recurring' CHECK (availability_type IN ('recurring', 'specific_date'));
ALTER TABLE tutor_availability ADD COLUMN IF NOT EXISTS specific_date DATE;

-- Update the constraint to allow either day_of_week OR specific_date
ALTER TABLE tutor_availability DROP CONSTRAINT IF EXISTS tutor_availability_day_of_week_check;
ALTER TABLE tutor_availability ADD CONSTRAINT tutor_availability_schedule_check 
CHECK (
  (availability_type = 'recurring' AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
  (availability_type = 'specific_date' AND specific_date IS NOT NULL AND day_of_week IS NULL)
);

-- Make day_of_week nullable for specific date entries
ALTER TABLE tutor_availability ALTER COLUMN day_of_week DROP NOT NULL;

-- Add index for specific date queries
CREATE INDEX IF NOT EXISTS idx_tutor_availability_specific_date ON tutor_availability(tutor_id, specific_date);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_type ON tutor_availability(availability_type);

-- Update RLS policies to handle both types
DROP POLICY IF EXISTS "Students can view tutor availability" ON tutor_availability;
CREATE POLICY "Students can view tutor availability" ON tutor_availability
  FOR SELECT USING (
    is_active = true AND 
    (
      availability_type = 'recurring' OR 
      (availability_type = 'specific_date' AND specific_date >= CURRENT_DATE)
    )
  );
