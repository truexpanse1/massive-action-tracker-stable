// components/ContentPreviewModal.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { GeneratedContent } from '../src/marketingTypes';
import SocialMediaSettingsModal from './SocialMediaSettingsModal';

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: GeneratedContent;
  onUpdate: () => void;
}

const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({ isOpen, onClose, content, onUpdate }) => {
  const [rating, setRating] = useState<number | null>(content.performance_rating);
  const [isUpdating, setIsUpdating] = useState(false);
  const [socialLinks, setSocialLinks] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSocialLinks();
    }
  }, [isOpen]);

  const fetchSocialLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSocialLinks(data);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ performance_rating: newRating })
        .eq('id', content.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsUsed = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ used: !content.used })
        .eq('id', content.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating used status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    const text = `${content.headline}\n\n${content.body_copy}\n\n${content.call_to_action}`;
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard!');
  };

  const handleQuickLink = (platform: string) => {
    // Copy content to clipboard
    const text = `${content.headline}\n\n${content.body_copy}\n\n${content.call_to_action}`;
    navigator.clipboard.writeText(text);

    // Get the URL for the platform
    let url = '';
    if (!socialLinks) {
      setShowSettingsModal(true);
      return;
    }

    switch (platform) {
      case 'Facebook':
        url = socialLinks.facebook_url || 'https://business.facebook.com/latest/posts';
        break;
      case 'Instagram':
        url = socialLinks.instagram_url || 'https://www.instagram.com/';
        break;
      case 'LinkedIn':
        url = socialLinks.linkedin_url || 'https://www.linkedin.com/feed/';
        break;
      case 'TikTok':
        url = socialLinks.tiktok_url || 'https://www.tiktok.com/creator-center/content';
        break;
    }

    if (!url) {
      setShowSettingsModal(true);
      return;
    }

    // Open in new tab
    window.open(url, '_blank');
    alert(`Content copied! Opening ${platform} dashboard...`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('generated_content')
        .delete()
        .eq('id', content.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  const platformIcons: { [key: string]: string } = {
    Facebook: '📘',
    Instagram: '📷',
    LinkedIn: '💼',
    TikTok: '🎵',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-brand-light-border dark:border-brand-gray p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{platformIcons[content.platform] || '📱'}</span>
                <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                  {content.platform} Ad
                </h2>
                {content.used && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                    POSTED
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {content.campaign_objective && `${content.campaign_objective} • `}
                Created {new Date(content.created_at).toLocaleDateString()}
              </p>
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

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
            {/* Facebook Ad Style Preview */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-brand-light-text dark:text-white">Your Business</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sponsored</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-bold text-lg text-brand-light-text dark:text-white mb-2">
                {content.headline}
              </h4>
              <div className="text-sm text-brand-light-text dark:text-white whitespace-pre-wrap mb-4">
                {content.body_copy}
              </div>
            </div>

            {/* Image */}
            {content.image_url ? (
              <img src={content.image_url} alt="Ad visual" className="w-full border-y border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-8 text-center border-y border-gray-200 dark:border-gray-700">
                <svg className="w-16 h-16 mx-auto text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {content.image_prompt || 'No image generated'}
                </p>
              </div>
            )}

            <div className="p-4">
              <button className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
                {content.call_to_action}
              </button>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">
              Rate Performance (1-10)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRatingChange(num)}
                  disabled={isUpdating}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
                    rating === num
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
            {rating && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Current rating: <span className="font-semibold text-purple-600">{rating}/10</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-brand-light-border dark:border-brand-gray p-6 flex-shrink-0">
          {/* Social Media Quick Links */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-brand-light-text dark:text-white">
                Quick Post To:
              </label>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                ⚙️ Configure Links
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickLink('Facebook')}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <span className="text-xl">📘</span>
                Facebook
              </button>
              <button
                onClick={() => handleQuickLink('Instagram')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <span className="text-xl">📷</span>
                Instagram
              </button>
              <button
                onClick={() => handleQuickLink('LinkedIn')}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <span className="text-xl">💼</span>
                LinkedIn
              </button>
              <button
                onClick={() => handleQuickLink('TikTok')}
                className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <span className="text-xl">🎵</span>
                TikTok
              </button>
            </div>
          </div>

          <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            📋 Copy Text
          </button>
          <button
            onClick={handleMarkAsUsed}
            disabled={isUpdating}
            className={`flex-1 font-semibold py-2 px-4 rounded-lg transition ${
              content.used
                ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {content.used ? '✓ Posted' : '✓ Mark as Posted'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Social Media Settings Modal */}
      <SocialMediaSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={fetchSocialLinks}
      />
    </div>
  );
};

export default ContentPreviewModal;
