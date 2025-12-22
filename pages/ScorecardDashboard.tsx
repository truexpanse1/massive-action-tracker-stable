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

        {/* Date Range Filter */}
        <div className="flex gap-2">
          {[
            { value: '7days' as DateRange, label: 'Last 7 Days' },
            { value: '30days' as DateRange, label: 'Last 30 Days' },
            { value: '90days' as DateRange, label: 'Last 90 Days' },
            { value: 'all' as DateRange, label: 'All Time' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                dateRange === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
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

          {/* Avatar Performance Table */}
          <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
              🎯 Avatar Performance
            </h2>
            
            {avatarStats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No avatars created yet. Create your first buyer persona to see performance data!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-light-border dark:border-brand-gray">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Avatar Name
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Content Generated
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Content Posted
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Avg Rating
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Usage Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {avatarStats
                      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
                      .map(stat => {
                        const usageRate = stat.contentGenerated > 0
                          ? Math.round((stat.contentPosted / stat.contentGenerated) * 100)
                          : 0;
                        
                        return (
                          <tr
                            key={stat.avatar.id}
                            className="border-b border-brand-light-border dark:border-brand-gray hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-semibold text-brand-light-text dark:text-white">
                                  {stat.avatar.avatar_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {stat.avatar.industry || 'No industry'}
                                </p>
                              </div>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="text-lg font-bold text-brand-light-text dark:text-white">
                                {stat.contentGenerated}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {stat.contentPosted}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              {stat.avgRating !== null ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                    {stat.avgRating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">/10</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="text-center py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${usageRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-brand-light-text dark:text-white">
                                  {usageRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Framework & Platform Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Framework Analysis */}
            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
                🎨 Framework Performance
              </h2>
              
              {frameworkStats.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No content generated yet. Start creating posts to see framework performance!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {frameworkStats
                    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
                    .map(stat => {
                      const frameworkNames: Record<string, string> = {
                        'PAS': 'Problem-Agitate-Solution',
                        'BAB': 'Before-After-Bridge',
                        'Dream': 'Dream Outcome',
                        'SocialProof': 'Social Proof',
                      };
                      
                      const maxCount = Math.max(...frameworkStats.map(s => s.count));
                      const widthPercent = (stat.count / maxCount) * 100;
                      
                      return (
                        <div key={stat.framework} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-brand-light-text dark:text-white">
                              {frameworkNames[stat.framework] || stat.framework}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {stat.count} {stat.count === 1 ? 'post' : 'posts'}
                              </span>
                              {stat.avgRating !== null && (
                                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                  {stat.avgRating.toFixed(1)}/10
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-purple-600 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                              style={{ width: `${widthPercent}%` }}
                            >
                              {widthPercent > 20 && (
                                <span className="text-xs font-bold text-white">
                                  {stat.count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Platform Performance */}
            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
                📱 Platform Performance
              </h2>
              
              {platformStats.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No content generated yet. Start creating posts to see platform performance!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {platformStats
                    .sort((a, b) => b.count - a.count)
                    .map(stat => {
                      const platformEmojis: Record<string, string> = {
                        'Facebook': '👥',
                        'Instagram': '📷',
                        'LinkedIn': '💼',
                        'TikTok': '🎵',
                      };
                      
                      const maxCount = Math.max(...platformStats.map(s => s.count));
                      const widthPercent = (stat.count / maxCount) * 100;
                      
                      return (
                        <div key={stat.platform} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-brand-light-text dark:text-white flex items-center gap-2">
                              <span>{platformEmojis[stat.platform] || '📱'}</span>
                              {stat.platform}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {stat.count} {stat.count === 1 ? 'post' : 'posts'}
                              </span>
                              {stat.avgRating !== null && (
                                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                  {stat.avgRating.toFixed(1)}/10
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all flex items-center justify-end pr-2"
                              style={{ width: `${widthPercent}%` }}
                            >
                              {widthPercent > 20 && (
                                <span className="text-xs font-bold text-white">
                                  {stat.count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Best Performing Content */}
          <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
              ⭐ Top Performing Content
            </h2>
            
            {overviewStats.totalContentPosted === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No posted content with ratings yet. Mark content as posted and rate it to see top performers!
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Top performing content showcase coming soon! This will display your highest-rated posts.
                </p>
              </div>
            )}
          </div>

          {/* Social Media ROI Chart */}
          <SocialMediaROIChart user={user} />

          {/* Insights & Recommendations */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg text-white">
            <h2 className="text-xl font-bold mb-3">
              💡 AI Insights (Coming Soon)
            </h2>
            <div className="space-y-2 text-sm opacity-90">
              <p>• Personalized recommendations based on your posting patterns</p>
              <p>• Best times to post for maximum engagement</p>
              <p>• Framework suggestions tailored to each avatar</p>
              <p>• Platform optimization tips based on your performance data</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScorecardDashboard;
