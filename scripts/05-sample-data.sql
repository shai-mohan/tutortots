-- Insert sample tutors (for testing purposes)
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  verified,
  subjects,
  bio,
  rating,
  total_ratings
) VALUES 
(
  gen_random_uuid(),
  'Dr. Sarah Johnson',
  'sarah.johnson@imail.sunway.edu.my',
  'tutor',
  true,
  ARRAY['Mathematics', 'Statistics', 'Calculus'],
  'PhD in Mathematics with 10+ years of teaching experience. Specializing in advanced calculus and statistical analysis.',
  4.8,
  25
),
(
  gen_random_uuid(),
  'Prof. Michael Chen',
  'michael.chen@imail.sunway.edu.my',
  'tutor',
  true,
  ARRAY['Physics', 'Engineering', 'Quantum Mechanics'],
  'Professor of Physics with expertise in quantum mechanics and engineering applications. Published researcher.',
  4.9,
  18
),
(
  gen_random_uuid(),
  'Dr. Emily Rodriguez',
  'emily.rodriguez@imail.sunway.edu.my',
  'tutor',
  true,
  ARRAY['Chemistry', 'Organic Chemistry', 'Biochemistry'],
  'Chemistry professor with focus on organic chemistry and biochemistry. Passionate about making complex concepts simple.',
  4.7,
  32
),
(
  gen_random_uuid(),
  'John Smith',
  'john.smith@imail.sunway.edu.my',
  'tutor',
  true,
  ARRAY['Computer Science', 'Programming', 'Data Structures'],
  'Senior Computer Science student with strong programming skills. Experienced in Java, Python, and web development.',
  4.6,
  15
);

-- Insert sample students (for testing purposes)
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  verified,
  academic_year
) VALUES 
(
  gen_random_uuid(),
  'Alice Wong',
  'alice.wong@imail.sunway.edu.my',
  'student',
  true,
  'Year 2'
),
(
  gen_random_uuid(),
  'Bob Lee',
  'bob.lee@imail.sunway.edu.my',
  'student',
  true,
  'Year 3'
),
(
  gen_random_uuid(),
  'Carol Tan',
  'carol.tan@imail.sunway.edu.my',
  'student',
  true,
  'Year 1'
);
