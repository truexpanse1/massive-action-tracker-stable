import { supabase } from './supabaseClient';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CoachingSharedNote {
  id: string;
  company_id: string;
  manager_id: string;
  client_id: string;
  title: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachingAssignment {
  id: string;
  company_id: string;
  manager_id: string;
  client_id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completion_note: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// COACHING SHARED NOTES
// ============================================

/**
 * Fetch all shared notes for a specific client
 */
export async function fetchClientSharedNotes(clientId: string): Promise<CoachingSharedNote[]> {
  const { data, error } = await supabase
    .from('coaching_shared_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shared notes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all shared notes created by a manager
 */
export async function fetchManagerSharedNotes(managerId: string): Promise<CoachingSharedNote[]> {
  const { data, error } = await supabase
    .from('coaching_shared_notes')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching manager notes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new shared note
 */
export async function createSharedNote(
  note: Omit<CoachingSharedNote, 'id' | 'is_read' | 'read_at' | 'created_at' | 'updated_at'>
): Promise<CoachingSharedNote> {
  const { data, error } = await supabase
    .from('coaching_shared_notes')
    .insert(note)
    .select()
    .single();

  if (error) {
    console.error('Error creating shared note:', error);
    throw error;
  }

  return data;
}

/**
 * Mark a shared note as read
 */
export async function markNoteAsRead(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('coaching_shared_notes')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', noteId);

  if (error) {
    console.error('Error marking note as read:', error);
    throw error;
  }
}

/**
 * Delete a shared note
 */
export async function deleteSharedNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('coaching_shared_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting shared note:', error);
    throw error;
  }
}

// ============================================
// COACHING ASSIGNMENTS
// ============================================

/**
 * Fetch all assignments for a specific client
 */
export async function fetchClientAssignments(clientId: string): Promise<CoachingAssignment[]> {
  const { data, error } = await supabase
    .from('coaching_assignments')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching client assignments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all assignments created by a manager
 */
export async function fetchManagerAssignments(managerId: string): Promise<CoachingAssignment[]> {
  const { data, error } = await supabase
    .from('coaching_assignments')
    .select('*')
    .eq('manager_id', managerId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching manager assignments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch assignments for a specific client by a specific manager
 */
export async function fetchClientAssignmentsByManager(
  managerId: string,
  clientId: string
): Promise<CoachingAssignment[]> {
  const { data, error } = await supabase
    .from('coaching_assignments')
    .select('*')
    .eq('manager_id', managerId)
    .eq('client_id', clientId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching client assignments by manager:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  assignment: Omit<CoachingAssignment, 'id' | 'status' | 'completion_note' | 'completed_at' | 'created_at' | 'updated_at'>
): Promise<CoachingAssignment> {
  const { data, error } = await supabase
    .from('coaching_assignments')
    .insert(assignment)
    .select()
    .single();

  if (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }

  return data;
}

/**
 * Update assignment status (for clients)
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  completionNote?: string
): Promise<void> {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  if (completionNote) {
    updates.completion_note = completionNote;
  }

  const { error } = await supabase
    .from('coaching_assignments')
    .update(updates)
    .eq('id', assignmentId);

  if (error) {
    console.error('Error updating assignment status:', error);
    throw error;
  }
}

/**
 * Update assignment (for managers - full control)
 */
export async function updateAssignment(
  assignmentId: string,
  updates: Partial<CoachingAssignment>
): Promise<CoachingAssignment> {
  const { data, error } = await supabase
    .from('coaching_assignments')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from('coaching_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

/**
 * Get assignment completion stats for a client
 */
export async function getClientCompletionStats(clientId: string): Promise<{
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  overdue: number;
}> {
  const { data, error } = await supabase
    .from('coaching_assignments')
    .select('status, due_date')
    .eq('client_id', clientId);

  if (error) {
    console.error('Error fetching completion stats:', error);
    throw error;
  }

  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total: data.length,
    completed: 0,
    pending: 0,
    in_progress: 0,
    overdue: 0,
  };

  data.forEach((assignment) => {
    if (assignment.status === 'completed') {
      stats.completed++;
    } else if (assignment.status === 'pending') {
      stats.pending++;
      if (assignment.due_date < today) {
        stats.overdue++;
      }
    } else if (assignment.status === 'in_progress') {
      stats.in_progress++;
      if (assignment.due_date < today) {
        stats.overdue++;
      }
    }
  });

  return stats;
}
