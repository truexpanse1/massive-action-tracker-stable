// components/ContentGeneratorModal.tsx
import React, { useState } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User } from '../src/types';
import { BuyerAvatar } from '../src/marketingTypes';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImage } from '../services/geminiService';
import { canGenerateContent, incrementPostCount } from '../src/services/subscriptionService';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

interface ContentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: BuyerAvatar;
  user: User;
}

type Platform = 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok';
type Framework = 'PAS' | 'BAB' | 'Dream' | 'SocialProof';
type WritingStyle = 'Standard' | 'Dan Kennedy' | 'Sabri Suby';

const ContentGeneratorModal: React.FC<ContentGeneratorModalProps> = ({ isOpen, onClose, avatar, user }) => {
  const [platform, setPlatform] = useState<Platform>('Facebook');
  const [framework, setFramework] = useState<Framework>('PAS');
  const [writingStyle, setWritingStyle] = useState<WritingStyle>('Standard');
  const [objective, setObjective] = useState('');
  const [customObjective, setCustomObjective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    headline: string;
    body: string;
    cta: string;
    imagePrompt: string;
  } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [customImagePrompt, setCustomImagePrompt] = useState<string>('');
  const [imageDescription, setImageDescription] = useState<string>('');

  const frameworks = {
    PAS: {
      name: 'Problem-Agitate-Solution',
      description: 'Hook with a problem, agitate the pain, present your solution',
      icon: '⚠️',
    },
    BAB: {
      name: 'Before-After-Bridge',
      description: 'Show the before state, paint the after picture, bridge with your solution',
      icon: '🌉',
    },
    Dream: {
      name: 'Dream Outcome',
      description: 'Lead with the dream result they want to achieve',
      icon: '✨',
    },
    SocialProof: {
      name: 'Social Proof',
      description: 'Leverage customer success stories and testimonials',
      icon: '⭐',
    },
  };

  const campaignObjectives = [
    { value: 'leads', label: '📞 Generate Leads', icon: '📞' },
    { value: 'sales', label: '💰 Drive Sales', icon: '💰' },
    { value: 'awareness', label: '🎯 Build Awareness', icon: '🎯' },
    { value: 'appointments', label: '📅 Book Appointments', icon: '📅' },
    { value: 'offer', label: '🎁 Promote Offer', icon: '🎁' },
    { value: 'engagement', label: '💬 Increase Engagement', icon: '💬' },
    { value: 'custom', label: '✏️ Custom Objective', icon: '✏️' },
  ];

  const handleGenerate = async () => {
    // Check usage limits
    const check = await canGenerateContent(user.id);
    if (!check.allowed) {
      alert(check.reason || 'Cannot generate content');
      return;
    }

    setIsGenerating(true);
    try {
      const finalObjective = objective === 'custom' ? customObjective : campaignObjectives.find(o => o.value === objective)?.label || '';
      
      // Writing style instructions
      const styleInstructions = {
        'Standard': '',
        'Dan Kennedy': `\n\nWRITING STYLE: Use Dan Kennedy's direct-response approach:\n- Write with bold, attention-grabbing headlines\n- Use specific numbers, dates, and details (never vague claims)\n- Include reason-why explanations for every claim\n- Create urgency and scarcity (limited time, limited availability)\n- Be direct and no-nonsense - cut the fluff\n- Use personality and strong opinions\n- Include proof elements (case studies, testimonials, specific results)\n- Make the call-to-action crystal clear and urgent\n- Don't be afraid of longer copy if it converts`,
        'Sabri Suby': `\n\nWRITING STYLE: Use Sabri Suby's aggressive, results-driven approach:\n- Lead with bold, provocative statements\n- Focus on tangible, measurable outcomes\n- Use urgency and FOMO (fear of missing out)\n- Include social proof and authority\n- Challenge the status quo\n- Be confident and assertive\n- Use short, punchy sentences\n- Create immediate desire for action`
      };

      // Build the prompt for Gemini
      const prompt = `You are an expert copywriter specializing in high-converting ${platform} ads using the ${frameworks[framework].name} framework.${styleInstructions[writingStyle]}

Create a ${platform} ad for a ${avatar.industry || 'business'} targeting this avatar:

Avatar: ${avatar.avatar_name}
Demographics: ${avatar.age_range || 'N/A'} | ${avatar.gender || 'N/A'} | ${avatar.income_range || 'N/A'}
Goals: ${(avatar.goals || []).slice(0, 3).join(', ')}
Fears: ${(avatar.fears || []).slice(0, 3).join(', ')}
Pain Points: ${(avatar.pain_points || []).slice(0, 3).join(', ')}
Buying Triggers: ${(avatar.buying_triggers || []).slice(0, 3).join(', ')}

Campaign Objective: ${finalObjective}
Framework: ${frameworks[framework].name} - ${frameworks[framework].description}
${imageDescription ? `
Image Requirements: ${imageDescription}` : ''}

Return ONLY a JSON object with this exact structure:
{
  "headline": "Attention-grabbing headline (max 60 characters)",
  "body": "Main ad copy (3-5 paragraphs, use line breaks)",
  "cta": "Clear call-to-action (max 30 characters)",
  "imagePrompt": "Detailed prompt for AI image generation${imageDescription ? ' that incorporates: ' + imageDescription : ' showing the transformation or result'}"
}`;

      // Call Gemini AI
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              body: { type: Type.STRING },
              cta: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
            },
            required: ['headline', 'body', 'cta', 'imagePrompt'],
          },
        },
      });

      // Parse the JSON response
      const jsonString = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const content = JSON.parse(jsonString);
      setGeneratedContent(content);
      setGeneratedImages([]); // Reset images when generating new content
      setSelectedImageIndex(null);
      setCustomImagePrompt(content.imagePrompt); // Set initial custom prompt

      // Increment post count
      await incrementPostCount(user.id);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) return;
    
    setIsGeneratingImage(true);
    try {
      // Generate 3 image variations using custom prompt
      const promptToUse = customImagePrompt || generatedContent.imagePrompt;
      const imagePromises = [1, 2, 3].map(() => generateImage(promptToUse, '16:9'));
      const images = await Promise.all(imagePromises);
      setGeneratedImages(images);
      setSelectedImageIndex(null); // Reset selection
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    try {
      const finalObjective = objective === 'custom' ? customObjective : campaignObjectives.find(o => o.value === objective)?.label || '';
      
      const contentData = {
        company_id: user.company_id,
        assigned_to: user.id,
        avatar_id: avatar.id,
        platform,
        content_type: 'Ad',
        headline: generatedContent.headline,
        body_copy: generatedContent.body,
        call_to_action: generatedContent.cta,
        image_prompt: generatedContent.imagePrompt,
        image_url: selectedImageIndex !== null ? generatedImages[selectedImageIndex] : null,
        hook_type: framework,
        campaign_objective: finalObjective,
        used: false,
        performance_rating: null,
        version: 1,
      };

      const { error } = await supabase
        .from('generated_content')
        .insert([contentData]);

      if (error) throw error;

      alert('Content saved to your Content Library!');
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isOpen) return null;

  const canGenerate = platform && framework && (objective !== 'custom' ? objective : customObjective.trim());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-brand-light-border dark:border-brand-gray p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                Generate Content
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                For: <span className="font-semibold text-purple-600">{avatar.avatar_name}</span>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Configuration */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                  1. Select Platform
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['Facebook', 'Instagram', 'LinkedIn', 'TikTok'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-4 py-3 rounded-lg border-2 transition font-semibold ${
                        platform === p
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                  2. Choose Framework
                </h3>
                <div className="space-y-3">
                  {(Object.keys(frameworks) as Framework[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFramework(f)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                        framework === f
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{frameworks[f].icon}</span>
                        <div className="flex-1">
                          <p className={`font-semibold ${framework === f ? 'text-purple-700 dark:text-purple-300' : 'text-brand-light-text dark:text-white'}`}>
                            {frameworks[f].name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {frameworks[f].description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                  3. Writing Style
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['Standard', 'Dan Kennedy', 'Sabri Suby'] as WritingStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setWritingStyle(style)}
                      className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                        writingStyle === style
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 text-brand-light-text dark:text-white'
                      }`}
                    >
                      {style === 'Dan Kennedy' && '📣 '}
                      {style === 'Sabri Suby' && '🔥 '}
                      {style === 'Standard' && '📝 '}
                      {style}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {writingStyle === 'Dan Kennedy' && 'Direct-response, reason-why, urgency-driven copy'}
                  {writingStyle === 'Sabri Suby' && 'Aggressive, results-focused, bold statements'}
                  {writingStyle === 'Standard' && 'Balanced, professional, framework-focused'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                  4. Campaign Objective
                </h3>
                <div className="space-y-2">
                  {campaignObjectives.map((obj) => (
                    <button
                      key={obj.value}
                      onClick={() => setObjective(obj.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition flex items-center gap-3 ${
                        objective === obj.value
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      <span className="text-xl">{obj.icon}</span>
                      <span className="font-semibold">{obj.label.replace(/^[^\s]+ /, '')}</span>
                    </button>
                  ))}
                </div>
                
                {objective === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customObjective}
                      onChange={(e) => setCustomObjective(e.target.value)}
                      placeholder="Enter your custom objective..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-2">
                  5. Image Description (Optional)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Describe what you want in the image, or leave blank for AI to decide
                </p>
                <textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder='e.g., "Include a team cheering for the winner" or "Stressed business owner at desk" or "Before/after transformation split screen"'
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Content
                  </>
                )}
              </button>
            </div>

            {/* Right: Preview */}
            <div>
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                Preview
              </h3>
              
              {!generatedContent ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select platform, framework, and objective, then click "Generate Content"
                  </p>
                </div>
              ) : (
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
                        <p className="font-semibold text-brand-light-text dark:text-white">
                          {avatar.industry || 'Your Business'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sponsored</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-lg text-brand-light-text dark:text-white mb-2">
                      {generatedContent.headline}
                    </h4>
                    <div className="text-sm text-brand-light-text dark:text-white whitespace-pre-wrap mb-4">
                      {generatedContent.body}
                    </div>
                  </div>

            {/* Image */}
            {selectedImageIndex !== null && generatedImages[selectedImageIndex] ? (
              <img src={generatedImages[selectedImageIndex]} alt="Selected" className="w-full border-y border-gray-200 dark:border-gray-700" />
            ) : generatedImages.length > 0 ? (
              <div className="border-y border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm font-semibold text-brand-light-text dark:text-white mb-3 text-center">
                  Choose your favorite image:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {generatedImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative rounded-lg overflow-hidden border-2 transition ${
                        selectedImageIndex === idx
                          ? 'border-purple-600 ring-2 ring-purple-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                      }`}
                    >
                      <img src={img} alt={`Option ${idx + 1}`} className="w-full h-auto" />
                      {selectedImageIndex === idx && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white rounded-lg text-sm font-semibold transition"
                >
                  🔄 Generate 3 New Options
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-8 text-center border-y border-gray-200 dark:border-gray-700">
                <svg className="w-16 h-16 mx-auto text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Customize Image Prompt (Optional):
                  </label>
                  <textarea
                    value={customImagePrompt}
                    onChange={(e) => setCustomImagePrompt(e.target.value)}
                    placeholder="Describe the image you want..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {isGeneratingImage ? 'Generating 3 Options...' : '✨ Generate 3 Image Options'}
                </button>
              </div>
            )}

                  <div className="p-4">
                    <button className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">
                      {generatedContent.cta}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button
                      onClick={() => handleCopy(`${generatedContent.headline}\n\n${generatedContent.body}\n\n${generatedContent.cta}`)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                      Copy Text
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                      Save to Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-light-border dark:border-brand-gray p-6 flex justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-brand-light-text dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Close
          </button>
          {generatedContent && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-brand-light-text dark:text-white rounded-lg transition disabled:opacity-50"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGeneratorModal;
