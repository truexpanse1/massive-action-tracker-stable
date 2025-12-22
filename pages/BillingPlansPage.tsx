// BillingPlansPage.tsx - Plan management and billing

import React, { useState, useEffect } from 'react';
import { User } from '../src/types';
import { getUserSubscription, getUsageSummary, PLAN_LIMITS } from '../src/services/subscriptionService';
import UpgradeModal from '../components/UpgradeModal';

interface BillingPlansPageProps {
  user: User;
}

const BillingPlansPage: React.FC<BillingPlansPageProps> = ({ user }) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    setIsLoading(true);
    const [subData, usageData] = await Promise.all([
      getUserSubscription(user.id),
      getUsageSummary(user.id),
    ]);
    setSubscription(subData);
    setUsage(usageData);
    setIsLoading(false);
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-light-bg dark:bg-brand-ink flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-bg dark:bg-brand-ink p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-light-text dark:text-white mb-2">
            Billing & Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription and view usage details
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                  Current Plan
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getPlanBadgeColor(subscription?.plan_tier || 'pro')}`}>
                  {(subscription?.plan_tier || 'pro').toUpperCase()}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {subscription?.status === 'active' ? 'Active subscription' : 'Inactive'}
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Change Plan
            </button>
          </div>

          {/* Usage Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Avatars */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Buyer Avatars
                </span>
                <span className="text-sm font-bold text-brand-light-text dark:text-white">
                  {usage?.avatars.current || 0} / {usage?.avatars.max || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getProgressColor(usage?.avatars.percentage || 0)}`}
                  style={{ width: `${Math.min(usage?.avatars.percentage || 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Posts */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Posts This Month
                </span>
                <span className="text-sm font-bold text-brand-light-text dark:text-white">
                  {usage?.posts.current || 0} / {usage?.posts.max || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getProgressColor(usage?.posts.percentage || 0)}`}
                  style={{ width: `${Math.min(usage?.posts.percentage || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Resets on {usage?.posts.resetsOn || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Comparison Table */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 mb-6">
          <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-6">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Starter<br /><span className="text-xs font-normal">${PLAN_LIMITS.starter.price}/mo</span>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-purple-600">
                    Pro<br /><span className="text-xs font-normal">${PLAN_LIMITS.pro.price}/mo</span>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-blue-600">
                    Agency<br /><span className="text-xs font-normal">${PLAN_LIMITS.agency.price}/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Buyer Avatars</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">{PLAN_LIMITS.starter.max_avatars}</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">{PLAN_LIMITS.pro.max_avatars}</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Posts per Month</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">{PLAN_LIMITS.starter.max_posts_per_month}</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">{PLAN_LIMITS.pro.max_posts_per_month}</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">User Seats</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">{PLAN_LIMITS.starter.max_users}</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">{PLAN_LIMITS.pro.max_users}</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">{PLAN_LIMITS.agency.max_users}</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Scorecard Dashboard</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">Basic</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">✓ Full</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">✓ Full</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Social Media ROI Tracking</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">—</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">✓</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">Priority Support</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-700 dark:text-gray-300">—</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">✓</td>
                  <td className="py-3 px-4 text-sm text-center font-semibold text-gray-700 dark:text-gray-300">✓ Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Info */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6">
          <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-4">
            Billing Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Billing Cycle</span>
              <span className="font-semibold text-brand-light-text dark:text-white">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Period</span>
              <span className="font-semibold text-brand-light-text dark:text-white">
                {subscription?.billing_cycle_start ? new Date(subscription.billing_cycle_start).toLocaleDateString() : 'N/A'} - {subscription?.billing_cycle_end ? new Date(subscription.billing_cycle_end).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Next Reset</span>
              <span className="font-semibold text-brand-light-text dark:text-white">
                {subscription?.next_reset_date ? new Date(subscription.next_reset_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Save 20%</strong> by switching to annual billing!
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan_tier || 'pro'}
      />
    </div>
  );
};

export default BillingPlansPage;
