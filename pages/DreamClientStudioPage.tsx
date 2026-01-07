// Dream Client Studio Page - Sidebar + Detail View + Content Planning Layout
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
  const [selectedAvatar, setSelectedAvatar] = useState<BuyerAvatar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'starter' | 'pro' | 'agency' | 'free'>('pro');

  useEffect(() => {
    fetchAvatars();
    fetchSubscription();
  }, [user]);

  // Auto-select first avatar when avatars load
  useEffect(() => {
    if (avatars.length > 0 && !selectedAvatar) {
      setSelectedAvatar(avatars[0]);
    }
  }, [avatars]);

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

  const handleAvatarCreated = () => {
    fetchAvatars();
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-brand-light-bg dark:bg-brand-ink">
      {/* Header */}
      <div className="bg-brand-light-card dark:bg-brand-navy border-b border-brand-light-border dark:border-brand-gray p-4 sm:p-6">
        <div className="max-w-[2000px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-light-text dark:text-white mb-2">
              Dream Client Studio
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Create detailed dream client profiles and generate high-converting content that attracts your ideal clients.
            </p>
          </div>
          <button
            onClick={async () => {
              const check = await canCreateAvatar(user.id);
              if (check.allowed) {
                setShowCreateModal(true);
                setLimitMessage(null);
              } else {
                setLimitMessage(check.reason || 'Cannot create dream client');
                setShowUpgradeModal(true);
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Dream Client
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && avatars.length === 0 && (
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-3">
              Create Your First Dream Client Profile
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
              Create Dream Client
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Layout: Sidebar + Detail + Content Planning */}
      {!isLoading && avatars.length > 0 && (
        <div className="max-w-[2000px] mx-auto p-3 sm:p-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Dream Client List */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray overflow-hidden sticky top-6">
                <div className="p-4 border-b border-brand-light-border dark:border-brand-gray">
                  <h3 className="font-semibold text-brand-light-text dark:text-white">Dream Clients</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{avatars.length} profile{avatars.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-full p-4 text-left transition-colors border-l-4 ${
                        selectedAvatar?.id === avatar.id
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          {avatar.avatar_image_url ? (
                            <img src={avatar.avatar_image_url} alt={avatar.avatar_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-brand-light-text dark:text-white truncate text-sm">
                            {avatar.avatar_name}
                          </h4>
                          {avatar.industry && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                              {avatar.industry}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Saved Content (0)
                          </p>
                        </div>
                        <svg 
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Panel - Selected Avatar Details */}
            {selectedAvatar && (
              <div className="flex-1 min-w-0">
                <AvatarDetailPanel 
                  avatar={selectedAvatar} 
                  user={user} 
                  onRefresh={fetchAvatars}
                  onAvatarUpdated={(updatedAvatar) => {
                    setSelectedAvatar(updatedAvatar);
                    fetchAvatars();
                  }}
                />
              </div>
            )}

            {/* Right Panel - Content Planning */}
            {selectedAvatar && (
              <div className="w-96 flex-shrink-0">
                <ContentPlanningPanel avatar={selectedAvatar} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Avatar Modal */}
      <AvatarBuilderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleAvatarCreated}
        user={user}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
        limitMessage={limitMessage || undefined}
      />
    </div>
  );
};

// Content Planning Panel Component
interface ContentPlanningPanelProps {
  avatar: BuyerAvatar;
}

const ContentPlanningPanel: React.FC<ContentPlanningPanelProps> = ({ avatar }) => {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<Array<{text: string, cpc?: number}>>([]);
  const [offers, setOffers] = useState<string[]>([]);
  const [highValueOffers, setHighValueOffers] = useState<string[]>([]);
  const [newHeadline, setNewHeadline] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [newHighValueOffer, setNewHighValueOffer] = useState('');

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border-2 border-purple-500 overflow-hidden sticky top-6">
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
        <h3 className="font-bold text-brand-light-text dark:text-white">Content Planning</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ad copy & keyword strategy</p>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-4 space-y-6">
        {/* Powerful Headlines */}
        <div>
          <h4 className="font-semibold text-brand-light-text dark:text-white mb-2 text-sm">Powerful Headlines:</h4>
          <div className="space-y-2 mb-2">
            {headlines.map((headline, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                <span className="text-purple-600">•</span>
                <span className="flex-1 text-gray-700 dark:text-gray-300">{headline}</span>
                <button 
                  onClick={() => setHeadlines(headlines.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHeadline}
              onChange={(e) => setNewHeadline(e.target.value)}
              placeholder="Add headline..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newHeadline.trim()) {
                  setHeadlines([...headlines, newHeadline.trim()]);
                  setNewHeadline('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newHeadline.trim()) {
                  setHeadlines([...headlines, newHeadline.trim()]);
                  setNewHeadline('');
                }
              }}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <h4 className="font-semibold text-brand-light-text dark:text-white mb-2 text-sm">Keywords:</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">For ad targeting & CPC tracking</p>
          <div className="space-y-2 mb-2">
            {keywords.map((keyword, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                <span className="flex-1 text-gray-700 dark:text-gray-300">{keyword.text}</span>
                {keyword.cpc && (
                  <span className="text-xs text-green-600 dark:text-green-400">${keyword.cpc}</span>
                )}
                <button 
                  onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newKeyword.trim()) {
                  setKeywords([...keywords, { text: newKeyword.trim() }]);
                  setNewKeyword('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newKeyword.trim()) {
                  setKeywords([...keywords, { text: newKeyword.trim() }]);
                  setNewKeyword('');
                }
              }}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Offers */}
        <div>
          <h4 className="font-semibold text-brand-light-text dark:text-white mb-2 text-sm">Offers:</h4>
          <div className="space-y-2 mb-2">
            {offers.map((offer, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                <span className="text-purple-600">•</span>
                <span className="flex-1 text-gray-700 dark:text-gray-300">{offer}</span>
                <button 
                  onClick={() => setOffers(offers.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newOffer}
              onChange={(e) => setNewOffer(e.target.value)}
              placeholder="Add offer..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newOffer.trim()) {
                  setOffers([...offers, newOffer.trim()]);
                  setNewOffer('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newOffer.trim()) {
                  setOffers([...offers, newOffer.trim()]);
                  setNewOffer('');
                }
              }}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* High Value Content Offers */}
        <div>
          <h4 className="font-semibold text-brand-light-text dark:text-white mb-2 text-sm">High Value Content Offers:</h4>
          <div className="space-y-2 mb-2">
            {highValueOffers.map((offer, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                <span className="text-purple-600">•</span>
                <span className="flex-1 text-gray-700 dark:text-gray-300">{offer}</span>
                <button 
                  onClick={() => setHighValueOffers(highValueOffers.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHighValueOffer}
              onChange={(e) => setNewHighValueOffer(e.target.value)}
              placeholder="Add high value offer..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newHighValueOffer.trim()) {
                  setHighValueOffers([...highValueOffers, newHighValueOffer.trim()]);
                  setNewHighValueOffer('');
                }
              }}
            />
            <button
              onClick={() => {
                if (newHighValueOffer.trim()) {
                  setHighValueOffers([...highValueOffers, newHighValueOffer.trim()]);
                  setNewHighValueOffer('');
                }
              }}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* New Content Section Placeholder */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-brand-light-text dark:text-white mb-2 text-sm">New Content Section</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Avatar Detail Panel Component
interface AvatarDetailPanelProps {
  avatar: BuyerAvatar;
  user: User;
  onRefresh: () => void;
  onAvatarUpdated: (avatar: BuyerAvatar) => void;
}

const AvatarDetailPanel: React.FC<AvatarDetailPanelProps> = ({ avatar, user, onRefresh, onAvatarUpdated }) => {
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
      alert('Failed to delete dream client. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray">
      {/* Avatar Header */}
      <div className="p-6 border-b border-brand-light-border dark:border-brand-gray">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            {avatar.avatar_image_url ? (
              <img src={avatar.avatar_image_url} alt={avatar.avatar_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-1">
              {avatar.avatar_name}
            </h2>
            {avatar.industry && (
              <p className="text-gray-600 dark:text-gray-400">
                {avatar.industry}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Details */}
      <div className="p-6 space-y-6">
        {/* Demographics */}
        <div className="grid grid-cols-2 gap-4">
          {avatar.age_range && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Age</p>
              <p className="text-brand-light-text dark:text-white font-medium">{avatar.age_range}</p>
            </div>
          )}
          {avatar.income_range && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Income</p>
              <p className="text-brand-light-text dark:text-white font-medium">{avatar.income_range}</p>
            </div>
          )}
        </div>

        {/* Top Goals */}
        {avatar.goals && avatar.goals.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-brand-light-text dark:text-white mb-3">Top Goals:</h3>
            <ul className="space-y-2">
              {avatar.goals.map((goal, idx) => (
                <li key={idx} className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="flex-1">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Fears */}
        {avatar.fears && avatar.fears.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-brand-light-text dark:text-white mb-3">Top Fears:</h3>
            <ul className="space-y-2">
              {avatar.fears.map((fear, idx) => (
                <li key={idx} className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="flex-1">{fear}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button 
            onClick={() => setShowContentGenerator(true)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Generate Content
          </button>
          <button 
            onClick={() => setShowViewModal(true)}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            View Full
          </button>
          <button 
            onClick={() => setShowEditModal(true)}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Edit
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 border border-red-200 dark:border-red-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Avatar
        </button>
      </div>

      {/* Saved Content List */}
      <div className="border-t border-brand-light-border dark:border-brand-gray">
        <SavedContentList avatarId={avatar.id} />
      </div>

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
