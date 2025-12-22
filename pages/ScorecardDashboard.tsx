// ScorecardDashboard.tsx - Analytics dashboard for Dream Client Studio

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User } from '../src/types';
import { BuyerAvatar } from '../src/marketingTypes';
import SocialMediaROIChart from '../components/SocialMediaROIChart';

interface ScorecardDashboardProps {
  user: User;
}

interface OverviewStats {
  totalAvatars: number;
  totalContentGenerated: number;
  totalContentPosted: number;
  overallAvgRating: number | null;
}

interface AvatarStats {
  avatar: BuyerAvatar;
  contentGenerated: number;
  contentPosted: number;
  avgRating: number | null;
}

interface FrameworkStats {
  framework: string;
  count: number;
  avgRating: number | null;
}

interface PlatformStats {
  platform: string;
  count: number;
  avgRating: number | null;
}

type DateRange = '7days' | '30days' | '90days' | 'all';

const ScorecardDashboard: React.FC<ScorecardDashboardProps> = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalAvatars: 0,
    totalContentGenerated: 0,
    totalContentPosted: 0,
    overallAvgRating: null,
  });
  const [avatarStats, setAvatarStats] = useState<AvatarStats[]>([]);
  const [frameworkStats, setFrameworkStats] = useState<FrameworkStats[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, [user.id, dateRange]);

  const getDateFilter = (): string | null => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sevenDaysAgo.toISOString();
      case '30days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return thirtyDaysAgo.toISOString();
      case '90days':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return ninetyDaysAgo.toISOString();
      case 'all':
        return null;
    }
  };

  const fetchAllStats = async () => {
    setIsLoading(true);
    try {
      const dateFilter = getDateFilter();

      // Fetch all avatars
      const { data: avatars, error: avatarsError } = await supabase
        .from('buyer_avatars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (avatarsError) throw avatarsError;

      // Fetch all content with date filter
      let contentQuery = supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user.id);

      if (dateFilter) {
        contentQuery = contentQuery.gte('created_at', dateFilter);
      }

      const { data: content, error: contentError } = await contentQuery;

      if (contentError) throw contentError;

      // Calculate overview stats
      const totalAvatars = avatars?.length || 0;
      const totalContentGenerated = content?.length || 0;
      const postedContent = content?.filter(c => c.used) || [];
      const totalContentPosted = postedContent.length;

      const ratingsArray = postedContent
        .map(c => c.performance_rating)
        .filter(r => r !== null && r !== undefined);
      const overallAvgRating = ratingsArray.length > 0
        ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
        : null;

      setOverviewStats({
        totalAvatars,
        totalContentGenerated,
        totalContentPosted,
        overallAvgRating,
      });

      // Calculate avatar stats
      const avatarStatsData: AvatarStats[] = (avatars || []).map(avatar => {
        const avatarContent = content?.filter(c => c.avatar_id === avatar.id) || [];
        const avatarPosted = avatarContent.filter(c => c.used);
        const avatarRatings = avatarPosted
          .map(c => c.performance_rating)
          .filter(r => r !== null && r !== undefined);
        
        return {
          avatar,
          contentGenerated: avatarContent.length,
          contentPosted: avatarPosted.length,
          avgRating: avatarRatings.length > 0
            ? avatarRatings.reduce((sum, r) => sum + r, 0) / avatarRatings.length
            : null,
        };
      });

      setAvatarStats(avatarStatsData);

      // Calculate framework stats
      const frameworkMap = new Map<string, { count: number; ratings: number[] }>();
      content?.forEach(c => {
        if (c.framework) {
          const existing = frameworkMap.get(c.framework) || { count: 0, ratings: [] };
          existing.count++;
          if (c.used && c.performance_rating !== null && c.performance_rating !== undefined) {
            existing.ratings.push(c.performance_rating);
          }
          frameworkMap.set(c.framework, existing);
        }
      });

      const frameworkStatsData: FrameworkStats[] = Array.from(frameworkMap.entries()).map(([framework, data]) => ({
        framework,
        count: data.count,
        avgRating: data.ratings.length > 0
          ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
          : null,
      }));

      setFrameworkStats(frameworkStatsData);

      // Calculate platform stats
      const platformMap = new Map<string, { count: number; ratings: number[] }>();
      content?.forEach(c => {
        if (c.platform) {
          const existing = platformMap.get(c.platform) || { count: 0, ratings: [] };
          existing.count++;
          if (c.used && c.performance_rating !== null && c.performance_rating !== undefined) {
            existing.ratings.push(c.performance_rating);
          }
          platformMap.set(c.platform, existing);
        }
      });

      const platformStatsData: PlatformStats[] = Array.from(platformMap.entries()).map(([platform, data]) => ({
        platform,
        count: data.count,
        avgRating: data.ratings.length > 0
          ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
          : null,
      }));

      setPlatformStats(platformStatsData);

    } catch (error) {
      console.error('Error fetching scorecard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">
            📊 Dream Client Studio Scorecard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analytics & Performance Insights
          </p>
        </div>

        {/* Date Selector (synced with EOD Report) */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 rounded-lg border border-brand-light-border dark:border-brand-gray bg-brand-light-card dark:bg-brand-navy text-brand-light-text dark:text-white font-semibold cursor-pointer"
          />
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
          >
            Today
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Total Avatars
              </p>
              <p className="text-4xl font-black text-purple-600 dark:text-purple-400">
                {overviewStats.totalAvatars}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Buyer personas created
              </p>
            </div>

            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Content Generated
              </p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                {overviewStats.totalContentGenerated}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total posts created
              </p>
            </div>

            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Content Posted
              </p>
              <p className="text-4xl font-black text-green-600 dark:text-green-400">
                {overviewStats.totalContentPosted}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {overviewStats.totalContentGenerated > 0
                  ? `${Math.round((overviewStats.totalContentPosted / overviewStats.totalContentGenerated) * 100)}% usage rate`
                  : 'No content yet'}
              </p>
            </div>

            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Avg Performance
              </p>
              <p className="text-4xl font-black text-yellow-600 dark:text-yellow-400">
                {overviewStats.overallAvgRating !== null
                  ? overviewStats.overallAvgRating.toFixed(1)
                  : '-'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {overviewStats.totalContentPosted > 0 ? 'out of 10' : 'No ratings yet'}
              </p>
            </div>
          </div>

          {/* Social Media ROI Chart */}
          <SocialMediaROIChart user={user} />

          {/* Removed sections for simplicity:
          - Avatar Performance Table
          - Framework Performance
          - Platform Performance
          
          Focus: Activity tracking (Posts, HVCO Downloads, Leads)
          */}


      )}
    </div>
  );
};

export default ScorecardDashboard;
