-- Create saved_ai_content table
CREATE TABLE IF NOT EXISTS saved_ai_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  content_date DATE NOT NULL,
  template_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content_text TEXT NOT NULL,
  content_html TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_user_id ON saved_ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_company_id ON saved_ai_content(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_date ON saved_ai_content(content_date);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_created_at ON saved_ai_content(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_ai_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved content"
  ON saved_ai_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved content"
  ON saved_ai_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved content"
  ON saved_ai_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved content"
  ON saved_ai_content FOR DELETE
  USING (auth.uid() = user_id);
