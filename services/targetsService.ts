/**
 * Targets Service - Supabase Storage
 * Persistent storage for user's massive action targets across sessions
 */

import { supabase } from '../src/services/supabaseClient';

const STORAGE_KEY = 'mat_user_targets';

export interface UserTargets {
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
 * Fetch user's current targets from Supabase
 */
export async function fetchUserTargets(userId: string): Promise<UserTargets | null> {
  try {
    console.log('[Targets] Fetching targets for user:', userId);
    
    // Try Supabase first
    const { data, error } = await supabase
      .from('user_targets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No targets found
        console.log('[Targets] No targets found in Supabase');
        return null;
      }
      console.error('[Targets] Supabase error:', error);
      return null;
    }

    if (data) {
      console.log('[Targets] Loaded targets from Supabase:', data);
      return data;
    }

    console.log('[Targets] No targets found');
    return null;
  } catch (error) {
    console.error('[Targets] Error fetching targets:', error);
    return null;
  }
}

/**
 * Save user's targets to Supabase
 */
export async function saveUserTargets(targets: UserTargets): Promise<UserTargets> {
  try {
    console.log('[Targets] Saving targets:', targets);
    
    const targetsWithTimestamp: UserTargets = {
      ...targets,
      created_at: targets.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('user_targets')
      .upsert(targetsWithTimestamp, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('[Targets] Supabase error:', error);
      throw new Error('Failed to save targets: ' + error.message);
    }

    console.log('[Targets] ✅ Successfully saved targets to Supabase');
    return data;
  } catch (error) {
    console.error('[Targets] ❌ Error saving targets:', error);
    throw new Error('Failed to save targets: ' + (error as Error).message);
  }
}

/**
 * Delete user's targets from Supabase
 */
export async function deleteUserTargets(userId: string): Promise<void> {
  try {
    console.log('[Targets] Deleting targets for user:', userId);
    
    const { error } = await supabase
      .from('user_targets')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[Targets] Error deleting:', error);
      throw error;
    }

    console.log('[Targets] ✅ Successfully deleted targets');
  } catch (error) {
    console.error('[Targets] ❌ Error deleting targets:', error);
  }
}

export default {
  fetchUserTargets,
  saveUserTargets,
  deleteUserTargets,
};
