-- Add document fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qualification_document_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qualification_document_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qualification_document_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS qualification_document_size INTEGER;

-- Create documents table for better organization (optional)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('qualification', 'student_id', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upload their own documents" ON documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin' AND verified = true
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
