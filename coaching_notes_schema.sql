-- Coaching Notes Table
-- Stores coaching session notes, key takeaways, and action items

CREATE TABLE IF NOT EXISTS coaching_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  session_date DATE NOT NULL,
  title TEXT NOT NULL,
  topic_focus TEXT,
  key_takeaways TEXT NOT NULL,
  action_items JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coaching_notes_user_id ON coaching_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_notes_company_id ON coaching_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_coaching_notes_session_date ON coaching_notes(session_date);
CREATE INDEX IF NOT EXISTS idx_coaching_notes_tags ON coaching_notes USING GIN(tags);

-- Full-text search index for searching notes
CREATE INDEX IF NOT EXISTS idx_coaching_notes_search ON coaching_notes USING GIN(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(topic_focus, '') || ' ' || coalesce(key_takeaways, ''))
);

-- Enable Row Level Security
ALTER TABLE coaching_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own coaching notes"
  ON coaching_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching notes"
  ON coaching_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching notes"
  ON coaching_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching notes"
  ON coaching_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Managers can view all coaching notes in their company
CREATE POLICY "Managers can view company coaching notes"
  ON coaching_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.company_id = coaching_notes.company_id
      AND users.role IN ('Manager', 'Admin')
    )
  );

COMMENT ON TABLE coaching_notes IS 'Stores coaching session notes, key takeaways, and actionable items for speed of implementation';
COMMENT ON COLUMN coaching_notes.action_items IS 'Array of action items: [{"text": "Call 50 prospects", "completed": false, "added_to_targets": false}]';
COMMENT ON COLUMN coaching_notes.resources IS 'Array of resources: [{"type": "link", "url": "https://...", "title": "Resource Title"}]';
