// components/AvatarViewModal.tsx
import React from 'react';
import { BuyerAvatar } from '../src/marketingTypes';

interface AvatarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: BuyerAvatar;
}

const AvatarViewModal: React.FC<AvatarViewModalProps> = ({ isOpen, onClose, avatar }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-brand-light-border dark:border-brand-gray p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                {avatar.avatar_image_url ? (
                  <img src={avatar.avatar_image_url} alt={avatar.avatar_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                  {avatar.avatar_name}
                </h2>
                {avatar.industry && (
                  <p className="text-gray-600 dark:text-gray-400">{avatar.industry}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demographics */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">Demographics</h3>
              <div className="space-y-3">
                {avatar.age_range && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Age Range</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.age_range}</p>
                  </div>
                )}
                {avatar.gender && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.gender}</p>
                  </div>
                )}
                {avatar.income_range && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Income Range</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.income_range}</p>
                  </div>
                )}
                {avatar.education && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Education</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.education}</p>
                  </div>
                )}
                {avatar.marital_status && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Marital Status</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.marital_status}</p>
                  </div>
                )}
                {avatar.occupation && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.occupation}</p>
                  </div>
                )}
                {avatar.location && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-brand-light-text dark:text-white font-medium">{avatar.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Goals & Dreams */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">Goals & Dreams</h3>
              {avatar.goals && avatar.goals.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Goals:</p>
                  <ul className="space-y-2">
                    {avatar.goals.map((goal, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span className="flex-1">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {avatar.dreams && avatar.dreams.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dreams:</p>
                  <ul className="space-y-2">
                    {avatar.dreams.map((dream, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✨</span>
                        <span className="flex-1">{dream}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Fears & Pain Points */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">Fears & Pain Points</h3>
              {avatar.fears && avatar.fears.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fears:</p>
                  <ul className="space-y-2">
                    {avatar.fears.map((fear, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-red-500 mt-1">⚠</span>
                        <span className="flex-1">{fear}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {avatar.pain_points && avatar.pain_points.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pain Points:</p>
                  <ul className="space-y-2">
                    {avatar.pain_points.map((pain, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-orange-500 mt-1">⚡</span>
                        <span className="flex-1">{pain}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Buying Behavior */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">Buying Behavior</h3>
              {avatar.buying_triggers && avatar.buying_triggers.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Buying Triggers:</p>
                  <ul className="space-y-2">
                    {avatar.buying_triggers.map((trigger, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-green-600 mt-1">💰</span>
                        <span className="flex-1">{trigger}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {avatar.objections && avatar.objections.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Common Objections:</p>
                  <ul className="space-y-2">
                    {avatar.objections.map((objection, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">🤔</span>
                        <span className="flex-1">{objection}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {avatar.social_platforms && avatar.social_platforms.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Active Platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {avatar.social_platforms.map((platform, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Deep Insights */}
            {avatar.deep_insights && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 md:col-span-2">
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">Deep Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {avatar.deep_insights}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-light-border dark:border-brand-gray p-6 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarViewModal;
