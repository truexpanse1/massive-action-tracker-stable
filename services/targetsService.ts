/**
 * Targets Service - localStorage First
 * Simple, reliable storage for user's massive action targets
 */

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
 * Fetch user's current targets from localStorage
 */
export async function fetchUserTargets(userId: string): Promise<UserTargets | null> {
  try {
    console.log('[Targets] Fetching targets for user:', userId);
    const key = `${STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      console.log('[Targets] No targets found in localStorage');
      return null;
    }
    
    const targets = JSON.parse(stored);
    console.log('[Targets] Loaded targets from localStorage:', targets);
    return targets;
  } catch (error) {
    console.error('[Targets] Error fetching targets:', error);
    return null;
  }
}

/**
 * Save user's targets to localStorage
 */
export async function saveUserTargets(targets: UserTargets): Promise<UserTargets> {
  try {
    console.log('[Targets] Saving targets:', targets);
    
    const targetsWithTimestamp: UserTargets = {
      ...targets,
      created_at: targets.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const key = `${STORAGE_KEY}_${targets.user_id}`;
    localStorage.setItem(key, JSON.stringify(targetsWithTimestamp));
    
    console.log('[Targets] ✅ Successfully saved targets to localStorage');
    return targetsWithTimestamp;
  } catch (error) {
    console.error('[Targets] ❌ Error saving targets:', error);
    throw new Error('Failed to save targets: ' + (error as Error).message);
  }
}

/**
 * Delete user's targets from localStorage
 */
export async function deleteUserTargets(userId: string): Promise<void> {
  try {
    console.log('[Targets] Deleting targets for user:', userId);
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
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
