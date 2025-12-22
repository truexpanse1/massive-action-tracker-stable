// UpgradeModal.tsx - Plan comparison and upgrade prompt

import React from 'react';
import { PLAN_LIMITS } from '../src/services/subscriptionService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'starter' | 'pro' | 'agency' | 'free';
  limitType?: 'avatars' | 'posts' | 'users';
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentPlan, limitType }) => {
  if (!isOpen) return null;

  const plans = [
    {
      tier: 'starter',
      name: 'Starter',
      price: PLAN_LIMITS.starter.price,
      description: 'Perfect for solo entrepreneurs',
      features: [
        `${PLAN_LIMITS.starter.max_avatars} Buyer Avatars`,
        `${PLAN_LIMITS.starter.max_posts_per_month} Posts/Month`,
        `${PLAN_LIMITS.starter.max_users} User Seat`,
        'Basic Analytics',
        'Social Media Quick Links',
        'Performance Ratings',
        'Lead Source Attribution',
      ],
      highlighted: false,
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: PLAN_LIMITS.pro.price,
      description: 'Best for agencies & teams',
      features: [
        `${PLAN_LIMITS.pro.max_avatars} Buyer Avatars`,
        `${PLAN_LIMITS.pro.max_posts_per_month} Posts/Month`,
        `${PLAN_LIMITS.pro.max_users} User Seats`,
        'Advanced Analytics',
        'Full Scorecard Dashboard',
        'Social Media ROI Tracking',
        'Team Collaboration',
        'Priority Support',
      ],
      highlighted: true,
      badge: 'MOST POPULAR',
    },
    {
      tier: 'agency',
      name: 'Agency',
      price: PLAN_LIMITS.agency.price,
      description: 'For power users & enterprises',
      features: [
        'UNLIMITED Avatars',
        'UNLIMITED Posts',
        `${PLAN_LIMITS.agency.max_users} User Seats`,
        'Full Analytics Suite',
        'White-Label Options (Coming Soon)',
        'API Access (Coming Soon)',
        'Dedicated Support',
        'Custom Integrations',
      ],
      highlighted: false,
    },
  ];

  const getLimitMessage = () => {
    switch (limitType) {
      case 'avatars':
        return `You've reached your avatar limit on the ${currentPlan} plan`;
      case 'posts':
        return `You've used all your posts this month on the ${currentPlan} plan`;
      case 'users':
        return `You've reached your user limit on the ${currentPlan} plan`;
      default:
        return `Upgrade your ${currentPlan} plan for more features`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-brand-light-card dark:bg-brand-navy border-b border-brand-light-border dark:border-brand-gray p-6 flex justify-between items-start z-10">
          <div>
            <h2 className="text-3xl font-bold text-brand-light-text dark:text-white mb-2">
              Upgrade Your Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getLimitMessage()}. Choose a plan that fits your needs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.tier === currentPlan;
              const canUpgrade = !isCurrentPlan && (
                (currentPlan === 'starter' && (plan.tier === 'pro' || plan.tier === 'agency')) ||
                (currentPlan === 'pro' && plan.tier === 'agency')
              );

              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-lg border-2 p-6 ${
                    plan.highlighted
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10'
                      : isCurrentPlan
                      ? 'border-gray-400 dark:border-gray-600 opacity-60'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-black text-brand-light-text dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => {
                        alert(`Upgrade to ${plan.name} - Payment integration coming soon!`);
                        onClose();
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                        plan.highlighted
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Annual Plans:</strong> Save 20% when you pay yearly!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              All plans include 7-day free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
