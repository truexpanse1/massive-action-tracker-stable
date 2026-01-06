import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  contentTemplates,
  toneOptions,
  generateDreamClientContent,
  validateReadingLevel,
  type DreamClientContentRequest
} from '../services/dreamClientContentService';
import { BuyerAvatar } from '../types';

interface DreamClientContentGeneratorProps {
  onContentGenerated?: (content: string) => void;
}

const DreamClientContentGenerator: React.FC<DreamClientContentGeneratorProps> = ({
  onContentGenerated
}) => {
  const [dreamClients, setDreamClients] = useState<BuyerAvatar[]>([]);
  const [selectedDreamClient, setSelectedDreamClient] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('friendly');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');
  const [specificOffer, setSpecificOffer] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [readingLevel, setReadingLevel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load dream clients on mount
  useEffect(() => {
    loadDreamClients();
  }, []);

  const loadDreamClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('buyer_avatars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setDreamClients(data);
        if (data.length > 0 && !selectedDreamClient) {
          setSelectedDreamClient(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading dream clients:', err);
      setError('Failed to load dream client profiles');
    }
  };

  const handleGenerate = async () => {
    if (!selectedDreamClient || !selectedContentType) {
      setError('Please select a dream client and content type');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');
    setReadingLevel(null);

    try {
      const request: DreamClientContentRequest = {
        dreamClientId: selectedDreamClient,
        contentType: selectedContentType,
        tone: selectedTone,
        additionalInstructions: additionalInstructions || undefined,
        specificOffer: specificOffer || undefined,
      };

      const content = await generateDreamClientContent(request);
      setGeneratedContent(content);

      // Validate reading level
      const validation = validateReadingLevel(content);
      setReadingLevel(validation);

      if (onContentGenerated) {
        onContentGenerated(content);
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  const handleSaveContent = async () => {
    if (!generatedContent) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save content');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData?.company_id) {
        alert('Company ID not found');
        return;
      }

      const selectedTemplate = contentTemplates.find(t => t.id === selectedContentType);
      const title = generatedContent.substring(0, 60) + (generatedContent.length > 60 ? '...' : '');

      const { error } = await supabase
        .from('saved_ai_content')
        .insert({
          user_id: user.id,
          company_id: userData.company_id,
          content_date: new Date().toISOString().split('T')[0],
          template_type: selectedTemplate?.name || 'Dream Client Content',
          title: title,
          content_text: generatedContent,
          tags: [selectedTemplate?.name || 'dream-client-content', selectedTone]
        });

      if (error) throw error;

      alert('Content saved successfully!');
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Failed to save content');
    }
  };

  const filteredTemplates = selectedCategory === 'all'
    ? contentTemplates
    : contentTemplates.filter(t => t.category === selectedCategory);

  const selectedDreamClientData = dreamClients.find(dc => dc.id === selectedDreamClient);

  return (
    <div className="dream-client-content-generator">
      <div className="bg-white dark:bg-brand-navy p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Dream Client Content Generator
        </h2>

        {/* Dream Client Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Dream Client Profile
          </label>
          <select
            value={selectedDreamClient}
            onChange={(e) => setSelectedDreamClient(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a dream client...</option>
            {dreamClients.map(dc => (
              <option key={dc.id} value={dc.id}>
                {dc.avatar_name} ({dc.industry})
              </option>
            ))}
          </select>

          {selectedDreamClientData && (
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Industry:</strong> {selectedDreamClientData.industry}</p>
                <p><strong>Occupation:</strong> {selectedDreamClientData.occupation}</p>
                <p><strong>Age:</strong> {selectedDreamClientData.age_range}</p>
                {selectedDreamClientData.pain_points && selectedDreamClientData.pain_points.length > 0 && (
                  <p><strong>Top Pain:</strong> {selectedDreamClientData.pain_points[0]}</p>
                )}
              </div>
            </div>
          )}

          {dreamClients.length === 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              ℹ️ No dream clients found. Create one in the Dream Client Studio first.
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('ads')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'ads'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📱 Ads
            </button>
            <button
              onClick={() => setSelectedCategory('email')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📧 Email
            </button>
            <button
              onClick={() => setSelectedCategory('social')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'social'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              💬 Social
            </button>
            <button
              onClick={() => setSelectedCategory('pages')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'pages'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🌐 Pages
            </button>
          </div>
        </div>

        {/* Content Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Content Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedContentType(template.id)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  selectedContentType === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Writing Tone
          </label>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {toneOptions.map(tone => (
              <option key={tone.value} value={tone.value}>
                {tone.label} - {tone.description}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="Any specific details, angles, or points to include..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Specific Offer (for offer-related content) */}
        {(selectedContentType === 'email_offer' || selectedContentType === 'long_form_ad') && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Specific Offer Details (Optional)
            </label>
            <textarea
              value={specificOffer}
              onChange={(e) => setSpecificOffer(e.target.value)}
              placeholder="What are you offering? Price? Bonuses? Guarantee?"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-brand-gray text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!selectedDreamClient || !selectedContentType || isGenerating}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
        >
          {isGenerating ? 'Generating Content...' : '🚀 Generate Content'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Generated Content Display */}
        {generatedContent && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated Content
              </h3>
              {readingLevel && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  readingLevel.valid
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                }`}>
                  {readingLevel.emoji} {readingLevel.message}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-brand-gray rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {generatedContent}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                📋 Copy to Clipboard
              </button>
              <button
                onClick={handleSaveContent}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                💾 Save to Library
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamClientContentGenerator;
