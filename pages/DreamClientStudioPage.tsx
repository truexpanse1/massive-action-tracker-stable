// pages/DreamClientStudioPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User } from '../src/types';
import { BuyerAvatar } from '../src/marketingTypes';
import AvatarBuilderModal from '../components/AvatarBuilderModal';
import ContentGeneratorModal from '../components/ContentGeneratorModal';
import SavedContentList from '../components/SavedContentList';
import AvatarViewModal from '../components/AvatarViewModal';
import { canCreateAvatar, getUserSubscription } from '../src/services/subscriptionService';
import UpgradeModal from '../components/UpgradeModal';

interface DreamClientStudioPageProps {
  user: User;
}

const DreamClientStudioPage: React.FC<DreamClientStudioPageProps> = ({ user }) => {
  const [avatars, setAvatars] = useState<BuyerAvatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'starter' | 'pro' | 'agency' | 'free'>('pro');

  useEffect(() => {
    fetchAvatars();
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    const subscription = await getUserSubscription(user.id);
    if (subscription) {
      setCurrentPlan(subscription.plan_tier as any);
    }
  };

  const fetchAvatars = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('buyer_avatars')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply RBAC filtering
      if (user.role === 'admin') {
        query = query.eq('company_id', user.company_id);
      } else {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvatars(data || []);
    } catch (error) {
      console.error('Error fetching avatars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-bg dark:bg-brand-ink p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-light-text dark:text-white mb-2">
              Dream Client Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create detailed buyer avatars and generate high-converting content that attracts your ideal clients.
            </p>
          </div>
          <button
            onClick={async () => {
              const check = await canCreateAvatar(user.id);
              if (check.allowed) {
                setShowCreateModal(true);
                setLimitMessage(null);
              } else {
                setLimitMessage(check.reason || 'Cannot create avatar');
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Dream Avatar
          </button>
        </div>
      </div>

      {/* Limit Message */}
      {limitMessage && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">
                  Limit Reached
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {limitMessage}
                </p>
                <button
                  onClick={() => {
                    setShowUpgradeModal(true);
                    setLimitMessage(null);
                  }}
                  className="mt-3 text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline"
                >
                  View Plans & Upgrade →
                </button>
              </div>
              <button
                onClick={() => setLimitMessage(null)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 ml-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && avatars.length === 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-3">
              Create Your First Dream Client Avatar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Build a detailed profile of your ideal client to generate laser-focused content that attracts quality leads.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Dream Avatar
            </button>
          </div>
        </div>
      )}

      {/* Avatar Grid */}
      {!isLoading && avatars.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatars.map((avatar) => (
              <AvatarCard key={avatar.id} avatar={avatar} onRefresh={fetchAvatars} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Create Avatar Modal */}
      <AvatarBuilderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchAvatars}
        user={user}
      />
    </div>
  );
};

// Avatar Card Component
interface AvatarCardProps {
  avatar: BuyerAvatar;
  onRefresh: () => void;
  user: User;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, user, onRefresh }) => {
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('buyer_avatars')
        .update({ is_active: false })
        .eq('id', avatar.id);

      if (error) throw error;
      
      setShowDeleteConfirm(false);
      onRefresh();
    } catch (error) {
      console.error('Error deleting avatar:', error);
      alert('Failed to delete avatar. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-500">
      {/* Avatar Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
          {avatar.avatar_image_url ? (
            <img src={avatar.avatar_image_url} alt={avatar.avatar_name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-brand-light-text dark:text-white truncate mb-1">
            {avatar.avatar_name}
          </h3>
          {avatar.industry && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {avatar.industry}
            </p>
          )}
        </div>
      </div>

      {/* Demographics */}
      <div className="space-y-2 mb-4">
        {avatar.age_range && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Age:</span>
            <span className="text-brand-light-text dark:text-white font-medium">{avatar.age_range}</span>
          </div>
        )}
        {avatar.income_range && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Income:</span>
            <span className="text-brand-light-text dark:text-white font-medium">{avatar.income_range}</span>
          </div>
        )}
      </div>

      {/* Top Goals */}
      {avatar.goals && avatar.goals.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Top Goals:</p>
          <ul className="space-y-1">
            {avatar.goals.slice(0, 3).map((goal, idx) => (
              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span className="flex-1">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Fears */}
      {avatar.fears && avatar.fears.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Top Fears:</p>
          <ul className="space-y-1">
            {avatar.fears.slice(0, 3).map((fear, idx) => (
              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="flex-1">{fear}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => setShowContentGenerator(true)}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
        >
          Generate Content
        </button>
        <button 
          onClick={() => setShowViewModal(true)}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
        >
          View Full
        </button>
        <button 
          onClick={() => setShowEditModal(true)}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
        >
          Edit
        </button>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2 border border-red-200 dark:border-red-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Avatar
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-3">
              Delete Avatar?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{avatar.avatar_name}</strong>? This will also delete all associated content. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Content List */}
      <SavedContentList avatarId={avatar.id} />

      {/* View Full Modal */}
      <AvatarViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        avatar={avatar}
      />

      {/* Edit Modal */}
      <AvatarBuilderModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          onRefresh();
        }}
        user={user}
        existingAvatar={avatar}
      />

      {/* Content Generator Modal */}
      {showContentGenerator && (
        <ContentGeneratorModal
          isOpen={showContentGenerator}
          onClose={() => setShowContentGenerator(false)}
          avatar={avatar}
          user={user}
        />
      )}
    </div>
  );
};

export default DreamClientStudioPage;
