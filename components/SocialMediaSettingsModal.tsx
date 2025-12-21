import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';

interface SocialMediaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface SocialMediaLinks {
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  tiktok_url: string;
}

const SocialMediaSettingsModal: React.FC<SocialMediaSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [links, setLinks] = useState<SocialMediaLinks>({
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    tiktok_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLinks({
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          linkedin_url: data.linkedin_url || '',
          tiktok_url: data.tiktok_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's company_id
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData) throw new Error('User data not found');

      // Upsert social media links
      const { error } = await supabase
        .from('social_media_links')
        .upsert({
          user_id: user.id,
          company_id: userData.company_id,
          ...links,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      alert('Social media links saved successfully!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving social media links:', error);
      alert('Failed to save social media links');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
            Social Media Dashboard Links
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add your social media dashboard URLs for quick access when posting content. Click the platform icons in your content preview to instantly open your dashboard with content copied to clipboard!
          </p>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Facebook */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-brand-light-text dark:text-white mb-2">
                  <span className="text-2xl">📘</span>
                  Facebook Business Suite
                </label>
                <input
                  type="url"
                  value={links.facebook_url}
                  onChange={(e) => setLinks({ ...links, facebook_url: e.target.value })}
                  placeholder="https://business.facebook.com/latest/posts"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: https://business.facebook.com/latest/posts
                </p>
              </div>

              {/* Instagram */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-brand-light-text dark:text-white mb-2">
                  <span className="text-2xl">📷</span>
                  Instagram Creator Studio
                </label>
                <input
                  type="url"
                  value={links.instagram_url}
                  onChange={(e) => setLinks({ ...links, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: https://www.instagram.com/ or https://business.facebook.com/creatorstudio
                </p>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-brand-light-text dark:text-white mb-2">
                  <span className="text-2xl">💼</span>
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={links.linkedin_url}
                  onChange={(e) => setLinks({ ...links, linkedin_url: e.target.value })}
                  placeholder="https://www.linkedin.com/feed/"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: https://www.linkedin.com/feed/
                </p>
              </div>

              {/* TikTok */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-brand-light-text dark:text-white mb-2">
                  <span className="text-2xl">🎵</span>
                  TikTok Creator Center
                </label>
                <input
                  type="url"
                  value={links.tiktok_url}
                  onChange={(e) => setLinks({ ...links, tiktok_url: e.target.value })}
                  placeholder="https://www.tiktok.com/creator-center/content"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: https://www.tiktok.com/creator-center/content
                </p>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-brand-light-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Links'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSettingsModal;
