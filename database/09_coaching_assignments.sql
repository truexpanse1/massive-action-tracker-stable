-- ============================================
-- COACHING ASSIGNMENTS SYSTEM
-- Manager-to-Client Accountability Feature
-- ============================================

-- Table: coaching_shared_notes
-- Stores notes that managers share with specific clients
CREATE TABLE IF NOT EXISTS coaching_shared_notes (
  id BIGSERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: coaching_assignments
-- Action items that managers assign to clients
CREATE TABLE IF NOT EXISTS coaching_assignments (
  id BIGSERIAL PRIMARY KEY,
  company_id UUID NOT NULL,
  manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  completion_note TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coaching_shared_notes_manager ON coaching_shared_notes(manager_id);
CREATE INDEX IF NOT EXISTS idx_coaching_shared_notes_client ON coaching_shared_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_coaching_shared_notes_company ON coaching_shared_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_coaching_shared_notes_created ON coaching_shared_notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coaching_assignments_manager ON coaching_assignments(manager_id);
CREATE INDEX IF NOT EXISTS idx_coaching_assignments_client ON coaching_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_coaching_assignments_company ON coaching_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_coaching_assignments_due_date ON coaching_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_coaching_assignments_status ON coaching_assignments(status);

-- Enable Row Level Security
ALTER TABLE coaching_shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: coaching_shared_notes
-- ============================================

-- Managers can view notes they created
CREATE POLICY "Managers can view their shared notes"
  ON coaching_shared_notes FOR SELECT
  USING (auth.uid() = manager_id);

-- Clients can view notes shared with them
CREATE POLICY "Clients can view notes shared with them"
  ON coaching_shared_notes FOR SELECT
  USING (auth.uid() = client_id);

-- Managers can create shared notes
CREATE POLICY "Managers can create shared notes"
  ON coaching_shared_notes FOR INSERT
  WITH CHECK (
    auth.uid() = manager_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Manager', 'Admin')
    )
  );

-- Managers can update their shared notes
CREATE POLICY "Managers can update their shared notes"
  ON coaching_shared_notes FOR UPDATE
  USING (auth.uid() = manager_id);

-- Clients can mark notes as read
CREATE POLICY "Clients can mark notes as read"
  ON coaching_shared_notes FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Managers can delete their shared notes
CREATE POLICY "Managers can delete their shared notes"
  ON coaching_shared_notes FOR DELETE
  USING (auth.uid() = manager_id);

-- ============================================
-- RLS POLICIES: coaching_assignments
-- ============================================

-- Managers can view assignments they created
CREATE POLICY "Managers can view their assignments"
  ON coaching_assignments FOR SELECT
  USING (auth.uid() = manager_id);

-- Clients can view assignments assigned to them
CREATE POLICY "Clients can view their assignments"
  ON coaching_assignments FOR SELECT
  USING (auth.uid() = client_id);

-- Managers can create assignments
CREATE POLICY "Managers can create assignments"
  ON coaching_assignments FOR INSERT
  WITH CHECK (
    auth.uid() = manager_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('Manager', 'Admin')
    )
  );

-- Managers can update their assignments
CREATE POLICY "Managers can update their assignments"
  ON coaching_assignments FOR UPDATE
  USING (auth.uid() = manager_id);

-- Clients can update status and completion notes
CREATE POLICY "Clients can update assignment status"
  ON coaching_assignments FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (
    auth.uid() = client_id
    -- Only allow clients to update these fields
    AND (
      OLD.title = NEW.title
      AND OLD.description = NEW.description
      AND OLD.due_date = NEW.due_date
      AND OLD.priority = NEW.priority
      AND OLD.manager_id = NEW.manager_id
      AND OLD.client_id = NEW.client_id
    )
  );

-- Managers can delete assignments
CREATE POLICY "Managers can delete assignments"
  ON coaching_assignments FOR DELETE
  USING (auth.uid() = manager_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE coaching_shared_notes IS 'Notes that managers share with specific clients for coaching and feedback';
COMMENT ON TABLE coaching_assignments IS 'Action items that managers assign to clients, visible in client day view';

COMMENT ON COLUMN coaching_assignments.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN coaching_assignments.status IS 'Status: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN coaching_assignments.completion_note IS 'Optional note from client when marking as completed';
