-- Update feedback table to make rating optional and add comment field
ALTER TABLE feedback 
ALTER COLUMN rating DROP NOT NULL;

-- Add comment field if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'feedback' AND column_name = 'comment') THEN
        ALTER TABLE feedback ADD COLUMN comment TEXT;
    END IF;
END $$;

-- Update the check constraint to allow either rating or comment (or both)
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_rating_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_content_check 
CHECK (rating IS NOT NULL OR comment IS NOT NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_session_rating ON feedback(session_id, rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
