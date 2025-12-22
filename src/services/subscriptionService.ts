// subscriptionService.ts - Handle subscription limits and usage tracking

import { supabase } from './supabaseClient';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_tier: 'starter' | 'pro' | 'agency' | 'free';
  max_avatars: number;
  max_posts_per_month: number;
  max_users: number;
  current_avatars: number;
  current_posts_this_month: number;
  current_users: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  next_reset_date: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  starter: {
    max_avatars: number;
    max_posts_per_month: number;
    max_users: number;
    price: number;
  };
  pro: {
    max_avatars: number;
    max_posts_per_month: number;
    max_users: number;
    price: number;
  };
  agency: {
    max_avatars: number;
    max_posts_per_month: number;
    max_users: number;
    price: number;
  };
}

export const PLAN_LIMITS: PlanLimits = {
  starter: {
    max_avatars: 2,
    max_posts_per_month: 50,
    max_users: 1,
    price: 47,
  },
  pro: {
    max_avatars: 10,
    max_posts_per_month: 200,
    max_users: 3,
    price: 97,
  },
  agency: {
    max_avatars: 999999, // Unlimited
    max_posts_per_month: 999999, // Unlimited
    max_users: 10,
    price: 197,
  },
};

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data as UserSubscription;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
}

/**
 * Update current usage counts by querying actual data
 */
export async function syncUsageCounts(userId: string): Promise<boolean> {
  try {
    // Count avatars
    const { count: avatarCount, error: avatarError } = await supabase
      .from('buyer_avatars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (avatarError) throw avatarError;

    // Count posts this month
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;

    const cycleStart = new Date(subscription.billing_cycle_start).toISOString();
    const cycleEnd = new Date(subscription.billing_cycle_end).toISOString();

    const { count: postCount, error: postError } = await supabase
      .from('generated_content')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', cycleStart)
      .lte('created_at', cycleEnd);

    if (postError) throw postError;

    // Update subscription with actual counts
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        current_avatars: avatarCount || 0,
        current_posts_this_month: postCount || 0,
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error syncing usage counts:', error);
    return false;
  }
}

/**
 * Check if user can create a new avatar
 */
export async function canCreateAvatar(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    await syncUsageCounts(userId);
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    if (subscription.current_avatars >= subscription.max_avatars) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${subscription.max_avatars} avatars on the ${subscription.plan_tier} plan`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking avatar limit:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
}

/**
 * Check if user can generate new content
 */
export async function canGenerateContent(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    await syncUsageCounts(userId);
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    if (subscription.current_posts_this_month >= subscription.max_posts_per_month) {
      const resetDate = new Date(subscription.next_reset_date).toLocaleDateString();
      return {
        allowed: false,
        reason: `You've used ${subscription.current_posts_this_month}/${subscription.max_posts_per_month} posts this month. Resets on ${resetDate}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking content limit:', error);
    return { allowed: false, reason: 'Error checking limits' };
  }
}

/**
 * Increment avatar count after creation
 */
export async function incrementAvatarCount(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_avatar_count', { p_user_id: userId });

    if (error) {
      // If RPC doesn't exist, do it manually
      await syncUsageCounts(userId);
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error incrementing avatar count:', error);
    await syncUsageCounts(userId);
    return false;
  }
}

/**
 * Increment post count after generation
 */
export async function incrementPostCount(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_post_count', { p_user_id: userId });

    if (error) {
      // If RPC doesn't exist, do it manually
      await syncUsageCounts(userId);
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error incrementing post count:', error);
    await syncUsageCounts(userId);
    return false;
  }
}

/**
 * Decrement avatar count after deletion
 */
export async function decrementAvatarCount(userId: string): Promise<boolean> {
  try {
    await syncUsageCounts(userId);
    return true;
  } catch (error) {
    console.error('Error decrementing avatar count:', error);
    return false;
  }
}

/**
 * Get usage summary for display
 */
export async function getUsageSummary(userId: string): Promise<{
  avatars: { current: number; max: number; percentage: number };
  posts: { current: number; max: number; percentage: number; resetsOn: string };
  plan: string;
  canUpgrade: boolean;
} | null> {
  try {
    await syncUsageCounts(userId);
    const subscription = await getUserSubscription(userId);

    if (!subscription) return null;

    const avatarPercentage = (subscription.current_avatars / subscription.max_avatars) * 100;
    const postPercentage = (subscription.current_posts_this_month / subscription.max_posts_per_month) * 100;

    return {
      avatars: {
        current: subscription.current_avatars,
        max: subscription.max_avatars,
        percentage: Math.min(avatarPercentage, 100),
      },
      posts: {
        current: subscription.current_posts_this_month,
        max: subscription.max_posts_per_month,
        percentage: Math.min(postPercentage, 100),
        resetsOn: new Date(subscription.next_reset_date).toLocaleDateString(),
      },
      plan: subscription.plan_tier,
      canUpgrade: subscription.plan_tier !== 'agency',
    };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return null;
  }
}
