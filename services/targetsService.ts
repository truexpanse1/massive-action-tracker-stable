/**
 * Targets Service
 * Handles database operations for user's massive action targets
 * Falls back to localStorage if Supabase is unavailable
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

const STORAGE_KEY = 'mat_user_targets';

/**
 * Fetch user's current targets
 * Falls back to localStorage if Supabase fails
 */
export async function fetchUserTargets(userId: string): Promise<UserTargets | null> {
  try {
    const { data, error } = await supabase
      .from('user_targets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no targets exist yet, return null (not an error)
      if (error.code === 'PGRST116') {
        console.log('No targets found in database, checking localStorage...');
        return getTargetsFromLocalStorage(userId);
      }
      console.error('Supabase error fetching targets:', error);
      // Fall back to localStorage
      return getTargetsFromLocalStorage(userId);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user targets:', error);
    // Fall back to localStorage
    return getTargetsFromLocalStorage(userId);
  }
}

/**
 * Save or update user's targets
 * Falls back to localStorage if Supabase fails
 */
export async function saveUserTargets(targets: Omit<UserTargets, 'id' | 'created_at' | 'updated_at'>): Promise<UserTargets> {
  try {
    // Check if targets already exist
    const existing = await fetchUserTargets(targets.user_id);

    if (existing && existing.id) {
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
        console.error('Supabase error updating targets:', error);
        // Fall back to localStorage
        return saveTargetsToLocalStorage(targets);
      }

      // Also save to localStorage as backup
      saveTargetsToLocalStorage(targets);
      return data;
    } else {
      // Create new targets
      const { data, error } = await supabase
        .from('user_targets')
        .insert(targets)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating targets:', error);
        // Fall back to localStorage
        return saveTargetsToLocalStorage(targets);
      }

      // Also save to localStorage as backup
      saveTargetsToLocalStorage(targets);
      return data;
    }
  } catch (error) {
    console.error('Error saving user targets:', error);
    // Fall back to localStorage
    return saveTargetsToLocalStorage(targets);
  }
}

/**
 * Delete user's targets
 */
export async function deleteUserTargets(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_targets')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user targets:', error);
    }

    // Also delete from localStorage
    deleteTargetsFromLocalStorage(userId);
  } catch (error) {
    console.error('Error deleting user targets:', error);
    deleteTargetsFromLocalStorage(userId);
  }
}

/**
 * Get targets from localStorage
 */
function getTargetsFromLocalStorage(userId: string): UserTargets | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      console.log('Loaded targets from localStorage');
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Save targets to localStorage
 */
function saveTargetsToLocalStorage(targets: Omit<UserTargets, 'id' | 'created_at' | 'updated_at'>): UserTargets {
  try {
    const targetsWithTimestamp: UserTargets = {
      ...targets,
      id: 'local-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_KEY}_${targets.user_id}`, JSON.stringify(targetsWithTimestamp));
    console.log('Saved targets to localStorage');
    return targetsWithTimestamp;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save targets to localStorage');
  }
}

/**
 * Delete targets from localStorage
 */
function deleteTargetsFromLocalStorage(userId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
    console.log('Deleted targets from localStorage');
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
  }
}

export default {
  fetchUserTargets,
  saveUserTargets,
  deleteUserTargets,
};
