// components/SavedContentList.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { GeneratedContent } from '../src/marketingTypes';
import ContentPreviewModal from './ContentPreviewModal';

interface SavedContentListProps {
  avatarId: string;
}

const SavedContentList: React.FC<SavedContentListProps> = ({ avatarId }) => {
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const platformIcons: { [key: string]: string } = {
    Facebook: '📘',
    Instagram: '📷',
    LinkedIn: '💼',
    TikTok: '🎵',
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('avatar_id', avatarId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [avatarId]);

  const handleOpenContent = (item: GeneratedContent) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  const handleUpdate = () => {
    fetchContent();
  };

  const handleRatingChange = async (contentId: string, newRating: number) => {
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ performance_rating: newRating })
        .eq('id', contentId);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Failed to update rating');
    }
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No content generated yet. Click "Generate Content" to create your first post!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
          Saved Content ({content.length})
        </h4>
        {content.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-purple-400 dark:hover:border-purple-600 transition"
          >
            <div className="flex items-center gap-3">
              {/* Platform Icon */}
              <div className="flex-shrink-0">
                <span className="text-2xl">{platformIcons[item.platform] || '📱'}</span>
              </div>

              {/* Headline */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-light-text dark:text-white truncate">
                  {item.headline}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                  {item.campaign_objective && ` • ${item.campaign_objective}`}
                </p>
              </div>

              {/* Rating Dropdown */}
              <div className="flex-shrink-0">
                <select
                  value={item.performance_rating || ''}
                  onChange={(e) => handleRatingChange(item.id, parseInt(e.target.value))}
                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">Rate</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      ⭐ {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Open Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleOpenContent(item)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition"
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Preview Modal */}
      {selectedContent && (
        <ContentPreviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={selectedContent}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default SavedContentList;
