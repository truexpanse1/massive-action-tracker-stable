// DreamClientStudioStats.tsx - Shows Dream Client Studio activity in EOD Report

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User } from '../src/types';

interface DreamClientStudioStatsProps {
  userId: string;
  selectedDate: Date;
}

interface DailyStats {
  contentGenerated: number;
  contentPosted: number;
  avatarsCreated: number;
  avgRating: number | null;
}

const DreamClientStudioStats: React.FC<DreamClientStudioStatsProps> = ({ userId, selectedDate }) => {
  const [stats, setStats] = useState<DailyStats>({
    contentGenerated: 0,
    contentPosted: 0,
    avatarsCreated: 0,
    avgRating: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyStats();
  }, [userId, selectedDate]);

  const fetchDailyStats = async () => {
    setIsLoading(true);
    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const startOfDay = `${dateKey}T00:00:00`;
      const endOfDay = `${dateKey}T23:59:59`;

      // Fetch content generated today
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('id, used, performance_rating')
        .eq('user_id', userId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (contentError) throw contentError;

      // Fetch avatars created today
      const { data: avatarData, error: avatarError } = await supabase
        .from('buyer_avatars')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (avatarError) throw avatarError;

      // Calculate stats
      const contentGenerated = contentData?.length || 0;
      const postedContent = contentData?.filter(c => c.used) || [];
      const contentPosted = postedContent.length;
      
      // Calculate average rating for posted content
      const ratingsArray = postedContent
        .map(c => c.performance_rating)
        .filter(r => r !== null && r !== undefined);
      const avgRating = ratingsArray.length > 0
        ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
        : null;

      const avatarsCreated = avatarData?.length || 0;

      setStats({
        contentGenerated,
        contentPosted,
        avatarsCreated,
        avgRating,
      });
    } catch (error) {
      console.error('Error fetching Dream Client Studio stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show the section if there's no activity
  if (!isLoading && stats.contentGenerated === 0 && stats.avatarsCreated === 0) {
    return null;
  }

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white flex items-center gap-2">
            🎨 Dream Client Studio
          </h2>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Content Creation Activity
          </p>
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // This will be handled by the parent component to switch views
            const event = new CustomEvent('navigate-to-content-library');
            window.dispatchEvent(event);
          }}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold text-sm flex items-center gap-1"
        >
          View Library →
        </a>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Content Generated */}
          <div className="bg-brand-light-bg dark:bg-brand-gray/20 p-4 rounded-lg">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Content Generated
            </p>
            <p className="text-3xl font-black text-brand-light-text dark:text-white">
              {stats.contentGenerated}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.contentGenerated === 1 ? 'post' : 'posts'}
            </p>
          </div>

          {/* Content Posted */}
          <div className="bg-brand-light-bg dark:bg-brand-gray/20 p-4 rounded-lg">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Content Posted
            </p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">
              {stats.contentPosted}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.contentPosted === 1 ? 'post' : 'posts'}
            </p>
          </div>

          {/* Avatars Created */}
          <div className="bg-brand-light-bg dark:bg-brand-gray/20 p-4 rounded-lg">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Avatars Created
            </p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {stats.avatarsCreated}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.avatarsCreated === 1 ? 'avatar' : 'avatars'}
            </p>
          </div>

          {/* Average Rating */}
          <div className="bg-brand-light-bg dark:bg-brand-gray/20 p-4 rounded-lg">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Avg Performance
            </p>
            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
              {stats.avgRating !== null ? stats.avgRating.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.contentPosted > 0 ? 'out of 10' : 'no ratings'}
            </p>
          </div>
        </div>
      )}

      {/* Massive Actions Summary */}
      {!isLoading && (stats.contentGenerated > 0 || stats.avatarsCreated > 0) && (
        <div className="mt-4 pt-4 border-t border-brand-light-border dark:border-brand-gray">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-brand-light-text dark:text-white">
                {stats.contentGenerated + stats.avatarsCreated}
              </span>{' '}
              massive actions from Dream Client Studio
            </p>
            {stats.contentPosted > 0 && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-semibold">
                ✓ {stats.contentPosted} Posted
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamClientStudioStats;
