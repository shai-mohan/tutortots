-- Update feedback table to include comment field and make rating optional for text-only feedback
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS comment TEXT,
ALTER COLUMN rating DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_tutor_lookup ON feedback(session_id);

-- Update RLS policies for feedback
DROP POLICY IF EXISTS "Students can create feedback for completed sessions" ON feedback;
DROP POLICY IF EXISTS "Users can view feedback for their sessions" ON feedback;

-- Allow students to create feedback for their completed sessions
CREATE POLICY "Students can create feedback for completed sessions" ON feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = feedback.session_id AND 
      sessions.student_id = auth.uid() AND
      sessions.status = 'completed'
    )
  );

-- Allow tutors and students to view feedback for their sessions
CREATE POLICY "Users can view feedback for their sessions" ON feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = feedback.session_id AND 
      (sessions.tutor_id = auth.uid() OR sessions.student_id = auth.uid())
    )
  );
