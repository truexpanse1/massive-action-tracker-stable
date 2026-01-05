-- ============================================
-- SAVED AI CONTENT TABLE
-- Stores user-generated AI content from templates
-- ============================================

-- Table: saved_ai_content
-- Stores AI-generated content created by users
CREATE TABLE IF NOT EXISTS saved_ai_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  content_date DATE NOT NULL DEFAULT CURRENT_DATE,
  template_type VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content_text TEXT NOT NULL,
  content_html TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_user ON saved_ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_company ON saved_ai_content(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_date ON saved_ai_content(content_date);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_template ON saved_ai_content(template_type);
CREATE INDEX IF NOT EXISTS idx_saved_ai_content_created ON saved_ai_content(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_ai_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: saved_ai_content
-- ============================================

-- Users can view their own saved content
CREATE POLICY "Users can view their own saved content"
  ON saved_ai_content FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own saved content
CREATE POLICY "Users can insert their own saved content"
  ON saved_ai_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved content
CREATE POLICY "Users can update their own saved content"
  ON saved_ai_content FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own saved content
CREATE POLICY "Users can delete their own saved content"
  ON saved_ai_content FOR DELETE
  USING (auth.uid() = user_id);

-- Managers can view all saved content in their company
CREATE POLICY "Managers can view company saved content"
  ON saved_ai_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.company_id = saved_ai_content.company_id
      AND users.role IN ('Manager', 'Admin')
    )
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE saved_ai_content IS 'Stores AI-generated content created by users from templates';
COMMENT ON COLUMN saved_ai_content.content_date IS 'Date associated with the content (defaults to creation date)';
COMMENT ON COLUMN saved_ai_content.template_type IS 'Type of template used (e.g., Prospect Research Assistant, LinkedIn Post)';
COMMENT ON COLUMN saved_ai_content.title IS 'User-provided or auto-generated title for the content';
COMMENT ON COLUMN saved_ai_content.content_text IS 'Plain text version of the generated content';
COMMENT ON COLUMN saved_ai_content.content_html IS 'Optional HTML version of the content';
COMMENT ON COLUMN saved_ai_content.tags IS 'Optional tags for categorization and search';
