// UsageWidget.tsx - Display usage stats in header

import React, { useState, useEffect } from 'react';
import { getUsageSummary } from '../src/services/subscriptionService';
import { User } from '../src/types';

interface UsageWidgetProps {
  user: User;
  onUpgradeClick: () => void;
}

const UsageWidget: React.FC<UsageWidgetProps> = ({ user, onUpgradeClick }) => {
  const [usage, setUsage] = useState<{
    avatars: { current: number; max: number; percentage: number };
    posts: { current: number; max: number; percentage: number; resetsOn: string };
    plan: string;
    canUpgrade: boolean;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, [user.id]);

  const fetchUsage = async () => {
    const summary = await getUsageSummary(user.id);
    setUsage(summary);
  };

  if (!usage) return null;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-gray-500';
      case 'pro':
        return 'bg-purple-600';
      case 'agency':
        return 'bg-blue-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="relative">
      {/* Compact View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray hover:border-purple-600 dark:hover:border-purple-600 transition"
      >
        <div className={`px-2 py-0.5 rounded text-xs font-bold text-white ${getPlanBadgeColor(usage.plan)}`}>
          {usage.plan.toUpperCase()}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-brand-light-text dark:text-white">
            {usage.avatars.current}/{usage.avatars.max}
          </span>
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="absolute right-0 mt-2 w-80 bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-brand-light-text dark:text-white">
              Your Usage
            </h3>
            <div className={`px-2 py-1 rounded text-xs font-bold text-white ${getPlanBadgeColor(usage.plan)}`}>
              {usage.plan.toUpperCase()} PLAN
            </div>
          </div>

          {/* Dream Clients Usage */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Dream Clients
              </span>
              <span className="text-sm font-bold text-brand-light-text dark:text-white">
                {usage.avatars.current} / {usage.avatars.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(usage.avatars.percentage)}`}
                style={{ width: `${Math.min(usage.avatars.percentage, 100)}%` }}
              />
            </div>
            {usage.avatars.percentage >= 90 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                ⚠️ Almost at limit!
              </p>
            )}
          </div>

          {/* Posts Usage */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Posts This Month
              </span>
              <span className="text-sm font-bold text-brand-light-text dark:text-white">
                {usage.posts.current} / {usage.posts.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(usage.posts.percentage)}`}
                style={{ width: `${Math.min(usage.posts.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Resets on {usage.posts.resetsOn}
            </p>
            {usage.posts.percentage >= 90 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                ⚠️ Almost at limit!
              </p>
            )}
          </div>

          {/* Upgrade Button */}
          {usage.canUpgrade && (
            <button
              onClick={() => {
                setIsExpanded(false);
                onUpgradeClick();
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Upgrade Plan
            </button>
          )}

          {/* View Details Link */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            View Detailed Analytics →
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageWidget;
