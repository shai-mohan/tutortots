-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all verified profiles" ON profiles
  FOR SELECT USING (verified = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can do everything with profiles
CREATE POLICY "Admins can do everything with profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (
    tutor_id = auth.uid() OR 
    student_id = auth.uid()
  );

CREATE POLICY "Students can create sessions" ON sessions
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Tutors can update their sessions" ON sessions
  FOR UPDATE USING (
    tutor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'tutor'
    )
  );

-- Feedback policies
CREATE POLICY "Users can view feedback for their sessions" ON feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = feedback.session_id AND 
      (sessions.tutor_id = auth.uid() OR sessions.student_id = auth.uid())
    )
  );

CREATE POLICY "Students can create feedback for completed sessions" ON feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = feedback.session_id AND 
      sessions.student_id = auth.uid() AND
      sessions.status = 'completed'
    )
  );
