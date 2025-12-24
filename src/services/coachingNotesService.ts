/**
 * Coaching Notes Service
 * Handles all database operations for coaching notes/journal entries
 */

import { supabase } from './supabaseClient';

export interface CoachingNote {
  id: string;
  user_id: string;
  company_id: string;
  session_date: string;
  title: string;
  topic_focus?: string;
  key_takeaways: string;
  action_items: ActionItem[];
  tags: string[];
  resources: Resource[];
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  text: string;
  completed: boolean;
  added_to_targets: boolean;
}

export interface Resource {
  type: 'link' | 'file' | 'video';
  url: string;
  title: string;
}

/**
 * Fetch all coaching notes for a user
 */
export async function fetchCoachingNotes(userId: string): Promise<CoachingNote[]> {
  const { data, error } = await supabase
    .from('coaching_notes')
    .select('*')
    .eq('user_id', userId)
    .order('session_date', { ascending: false });

  if (error) {
    console.error('Error fetching coaching notes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch coaching notes for a specific date
 */
export async function fetchCoachingNotesByDate(userId: string, date: string): Promise<CoachingNote[]> {
  const { data, error } = await supabase
    .from('coaching_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('session_date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coaching notes by date:', error);
    throw error;
  }

  return data || [];
}

/**
 * Search coaching notes by keyword
 */
export async function searchCoachingNotes(userId: string, searchTerm: string): Promise<CoachingNote[]> {
  const { data, error } = await supabase
    .from('coaching_notes')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${searchTerm}%,topic_focus.ilike.%${searchTerm}%,key_takeaways.ilike.%${searchTerm}%`)
    .order('session_date', { ascending: false });

  if (error) {
    console.error('Error searching coaching notes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new coaching note
 */
export async function createCoachingNote(note: Omit<CoachingNote, 'id' | 'created_at' | 'updated_at'>): Promise<CoachingNote> {
  const { data, error } = await supabase
    .from('coaching_notes')
    .insert({
      user_id: note.user_id,
      company_id: note.company_id,
      session_date: note.session_date,
      title: note.title,
      topic_focus: note.topic_focus,
      key_takeaways: note.key_takeaways,
      action_items: note.action_items,
      tags: note.tags,
      resources: note.resources,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating coaching note:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing coaching note
 */
export async function updateCoachingNote(id: string, updates: Partial<CoachingNote>): Promise<CoachingNote> {
  const { data, error } = await supabase
    .from('coaching_notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coaching note:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a coaching note
 */
export async function deleteCoachingNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('coaching_notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting coaching note:', error);
    throw error;
  }
}

/**
 * Get dates that have coaching notes (for calendar highlighting)
 */
export async function getCoachingNoteDates(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('coaching_notes')
    .select('session_date')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching coaching note dates:', error);
    throw error;
  }

  // Extract unique dates
  const dates = data?.map(note => note.session_date) || [];
  return Array.from(new Set(dates));
}

/**
 * Mark an action item as added to targets
 */
export async function markActionItemAddedToTargets(noteId: string, actionItemIndex: number): Promise<void> {
  // Fetch the note first
  const { data: note, error: fetchError } = await supabase
    .from('coaching_notes')
    .select('action_items')
    .eq('id', noteId)
    .single();

  if (fetchError || !note) {
    console.error('Error fetching note for action item update:', fetchError);
    throw fetchError;
  }

  // Update the specific action item
  const updatedActionItems = [...note.action_items];
  if (updatedActionItems[actionItemIndex]) {
    updatedActionItems[actionItemIndex].added_to_targets = true;
  }

  // Save back to database
  const { error: updateError } = await supabase
    .from('coaching_notes')
    .update({ action_items: updatedActionItems })
    .eq('id', noteId);

  if (updateError) {
    console.error('Error updating action item:', updateError);
    throw updateError;
  }
}

export default {
  fetchCoachingNotes,
  fetchCoachingNotesByDate,
  searchCoachingNotes,
  createCoachingNote,
  updateCoachingNote,
  deleteCoachingNote,
  getCoachingNoteDates,
  markActionItemAddedToTargets,
};
