/**
 * Targets Service
 * Handles database operations for user's massive action targets
 */

import { supabase } from './supabaseClient';

export interface UserTargets {
  id?: string;
  user_id: string;
  company_id: string;
  annual_revenue: number;
  avg_sale_amount: number;
  close_rate: number;
  show_rate: number;
  contact_to_appt_rate: number;
  call_to_contact_rate: number;
  daily_calls: number;
  daily_contacts: number;
  daily_appts: number;
  daily_demos: number;
  daily_deals: number;
  daily_revenue: number;
  weekly_revenue: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch user's current targets
 */
export async function fetchUserTargets(userId: string): Promise<UserTargets | null> {
  const { data, error } = await supabase
    .from('user_targets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no targets exist yet, return null (not an error)
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user targets:', error);
    throw error;
  }

  return data;
}

/**
 * Save or update user's targets
 */
export async function saveUserTargets(targets: Omit<UserTargets, 'id' | 'created_at' | 'updated_at'>): Promise<UserTargets> {
  // Check if targets already exist
  const existing = await fetchUserTargets(targets.user_id);

  if (existing) {
    // Update existing targets
    const { data, error } = await supabase
      .from('user_targets')
      .update({
        ...targets,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targets.user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user targets:', error);
      throw error;
    }

    return data;
  } else {
    // Create new targets
    const { data, error } = await supabase
      .from('user_targets')
      .insert(targets)
      .select()
      .single();

    if (error) {
      console.error('Error creating user targets:', error);
      throw error;
    }

    return data;
  }
}

/**
 * Delete user's targets
 */
export async function deleteUserTargets(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_targets')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting user targets:', error);
    throw error;
  }
}

export default {
  fetchUserTargets,
  saveUserTargets,
  deleteUserTargets,
};
