// Content Planning Panel - AI-Powered Content Generation
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { BuyerAvatar } from '../src/marketingTypes';
import { GoogleGenAI } from '@google/genai';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

interface ContentPlanningPanelProps {
  avatar: BuyerAvatar;
}

interface ContentPlanningData {
  id?: string;
  avatar_id: string;
  headlines: string[];
  keywords: Array<{ text: string; cpc?: number }>;
  offers: string[];
  high_value_offers: string[];
}

const ContentPlanningPanel: React.FC<ContentPlanningPanelProps> = ({ avatar }) => {
  const [data, setData] = useState<ContentPlanningData>({
    avatar_id: avatar.id,
    headlines: [],
    keywords: [],
    offers: [],
    high_value_offers: [],
  });
  
  const [isGenerating, setIsGenerating] = useState({
    headlines: false,
    keywords: false,
    offers: false,
    hvcos: false,
  });

  const [newItems, setNewItems] = useState({
    headline: '',
    keyword: '',
    keywordCpc: '',
    offer: '',
    hvco: '',
  });

  // Load existing content planning data
  useEffect(() => {
    loadContentPlanningData();
  }, [avatar.id]);

  const loadContentPlanningData = async () => {
    try {
      const { data: existingData, error } = await supabase
        .from('avatar_content_planning')
        .select('*')
        .eq('avatar_id', avatar.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (existingData) {
        setData({
          id: existingData.id,
          avatar_id: existingData.avatar_id,
          headlines: existingData.headlines || [],
          keywords: existingData.keywords || [],
          offers: existingData.offers || [],
          high_value_offers: existingData.high_value_offers || [],
        });
      }
    } catch (error) {
      console.error('Error loading content planning data:', error);
    }
  };

  const saveContentPlanningData = async (updatedData: ContentPlanningData) => {
    try {
      const payload = {
        avatar_id: avatar.id,
        company_id: avatar.company_id,
        headlines: updatedData.headlines,
        keywords: updatedData.keywords,
        offers: updatedData.offers,
        high_value_offers: updatedData.high_value_offers,
        updated_at: new Date().toISOString(),
      };

      if (updatedData.id) {
        // Update existing
        const { error } = await supabase
          .from('avatar_content_planning')
          .update(payload)
          .eq('id', updatedData.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { data: newData, error } = await supabase
          .from('avatar_content_planning')
          .insert([payload])
          .select()
          .single();
        
        if (error) throw error;
        setData({ ...updatedData, id: newData.id });
      }
    } catch (error) {
      console.error('Error saving content planning data:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const generateHeadlines = async () => {
    setIsGenerating({ ...isGenerating, headlines: true });
    try {
      const prompt = `You are an expert copywriter. Based on this dream client profile, generate 10 powerful, attention-grabbing headlines for social media ads and content.

AVATAR PROFILE:
Name: ${avatar.avatar_name}
Industry: ${avatar.industry || 'Not specified'}
Age: ${avatar.age_range || 'Not specified'}
Income: ${avatar.income_range || 'Not specified'}

TOP GOALS:
${avatar.goals?.map((g, i) => `${i + 1}. ${g}`).join('\n') || 'Not specified'}

TOP FEARS:
${avatar.fears?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Not specified'}

PAIN POINTS:
${avatar.pain_points?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not specified'}

DESIRES:
${avatar.desires?.map((d, i) => `${i + 1}. ${d}`).join('\n') || 'Not specified'}

BUYING TRIGGERS:
${avatar.buying_triggers?.map((t, i) => `${i + 1}. ${t}`).join('\n') || 'Not specified'}

Generate 10 headlines that:
- Speak directly to their goals, fears, or desires
- Use emotional triggers
- Are benefit-focused or problem-focused
- Are 8-15 words long
- Would stop them from scrolling

Return ONLY the headlines, one per line, no numbering, no explanations.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      const text = result.text;
      
      const headlines = text
        .split('\n')
        .map(h => h.trim())
        .filter(h => h.length > 0 && !h.match(/^\d+\./))
        .slice(0, 10);

      const updatedData = {
        ...data,
        headlines: [...data.headlines, ...headlines],
      };
      setData(updatedData);
      await saveContentPlanningData(updatedData);
    } catch (error) {
      console.error('Error generating headlines:', error);
      alert('Failed to generate headlines. Please try again.');
    } finally {
      setIsGenerating({ ...isGenerating, headlines: false });
    }
  };

  const generateKeywords = async () => {
    setIsGenerating({ ...isGenerating, keywords: true });
    try {
      const prompt = `You are an expert in Google Ads and Facebook Ads keyword targeting. Based on this dream client profile, generate 25 highly relevant keywords for ad targeting.

AVATAR PROFILE:
Name: ${avatar.avatar_name}
Industry: ${avatar.industry || 'Not specified'}
Age: ${avatar.age_range || 'Not specified'}
Income: ${avatar.income_range || 'Not specified'}
Occupation: ${avatar.occupation || 'Not specified'}

TOP GOALS:
${avatar.goals?.map((g, i) => `${i + 1}. ${g}`).join('\n') || 'Not specified'}

TOP FEARS:
${avatar.fears?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Not specified'}

PAIN POINTS:
${avatar.pain_points?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not specified'}

Generate 25 keywords that:
- Are 2-5 words long
- Include problem-focused keywords (what they're struggling with)
- Include solution-focused keywords (what they're searching for)
- Include industry-specific terms
- Are actual search terms people would use

Return ONLY the keywords, one per line, no numbering, no explanations, no quotes.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      const text = result.text;
      
      const keywords = text
        .split('\n')
        .map(k => k.trim().replace(/^["']|["']$/g, ''))
        .filter(k => k.length > 0 && !k.match(/^\d+\./))
        .slice(0, 25)
        .map(k => ({ text: k }));

      const updatedData = {
        ...data,
        keywords: [...data.keywords, ...keywords],
      };
      setData(updatedData);
      await saveContentPlanningData(updatedData);
    } catch (error) {
      console.error('Error generating keywords:', error);
      alert('Failed to generate keywords. Please try again.');
    } finally {
      setIsGenerating({ ...isGenerating, keywords: false });
    }
  };

  const generateOffers = async () => {
    setIsGenerating({ ...isGenerating, offers: true });
    try {
      const prompt = `You are an expert in creating irresistible offers. Based on this dream client profile, generate 8 compelling offers that would attract them.

AVATAR PROFILE:
Name: ${avatar.avatar_name}
Industry: ${avatar.industry || 'Not specified'}
Age: ${avatar.age_range || 'Not specified'}
Income: ${avatar.income_range || 'Not specified'}

TOP GOALS:
${avatar.goals?.map((g, i) => `${i + 1}. ${g}`).join('\n') || 'Not specified'}

TOP FEARS:
${avatar.fears?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Not specified'}

BUYING TRIGGERS:
${avatar.buying_triggers?.map((t, i) => `${i + 1}. ${t}`).join('\n') || 'Not specified'}

Generate 8 offers that:
- Are specific and tangible
- Include discounts, bonuses, or time-limited deals
- Address their goals or fears
- Create urgency or scarcity
- Are 8-15 words long

Examples:
- "50% Off Your First Month - Limited to Next 20 Clients"
- "Free Strategy Session + Custom Action Plan (Worth $500)"
- "Buy 2 Get 1 Free - This Week Only"

Return ONLY the offers, one per line, no numbering, no explanations.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      const text = result.text;
      
      const offers = text
        .split('\n')
        .map(o => o.trim().replace(/^["'-]|["']$/g, ''))
        .filter(o => o.length > 0 && !o.match(/^\d+\./))
        .slice(0, 8);

      const updatedData = {
        ...data,
        offers: [...data.offers, ...offers],
      };
      setData(updatedData);
      await saveContentPlanningData(updatedData);
    } catch (error) {
      console.error('Error generating offers:', error);
      alert('Failed to generate offers. Please try again.');
    } finally {
      setIsGenerating({ ...isGenerating, offers: false });
    }
  };

  const generateHVCOs = async () => {
    setIsGenerating({ ...isGenerating, hvcos: true });
    try {
      const prompt = `You are an expert in creating high-value content offers (lead magnets). Based on this dream client profile, generate 8 compelling high-value content offers.

AVATAR PROFILE:
Name: ${avatar.avatar_name}
Industry: ${avatar.industry || 'Not specified'}
Age: ${avatar.age_range || 'Not specified'}
Income: ${avatar.income_range || 'Not specified'}

TOP GOALS:
${avatar.goals?.map((g, i) => `${i + 1}. ${g}`).join('\n') || 'Not specified'}

TOP FEARS:
${avatar.fears?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'Not specified'}

PAIN POINTS:
${avatar.pain_points?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Not specified'}

Generate 8 high-value content offers that:
- Are educational or valuable resources
- Address their specific goals or pain points
- Include guides, checklists, templates, webinars, assessments
- Are 8-15 words long
- Sound valuable and professional

Examples:
- "The Complete Guide to [Solving Their Problem]"
- "Free [Industry] Assessment + Custom Action Plan"
- "10-Point Checklist: How to [Achieve Their Goal]"
- "Live Webinar: 5 Secrets to [Desired Outcome]"

Return ONLY the offers, one per line, no numbering, no explanations.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      const text = result.text;
      
      const hvcos = text
        .split('\n')
        .map(h => h.trim().replace(/^["'-]|["']$/g, ''))
        .filter(h => h.length > 0 && !h.match(/^\d+\./))
        .slice(0, 8);

      const updatedData = {
        ...data,
        high_value_offers: [...data.high_value_offers, ...hvcos],
      };
      setData(updatedData);
      await saveContentPlanningData(updatedData);
    } catch (error) {
      console.error('Error generating HVCOs:', error);
      alert('Failed to generate high-value offers. Please try again.');
    } finally {
      setIsGenerating({ ...isGenerating, hvcos: false });
    }
  };

  const addHeadline = async () => {
    if (!newItems.headline.trim()) return;
    const updatedData = {
      ...data,
      headlines: [...data.headlines, newItems.headline.trim()],
    };
    setData(updatedData);
    await saveContentPlanningData(updatedData);
    setNewItems({ ...newItems, headline: '' });
  };

  const addKeyword = async () => {
    if (!newItems.keyword.trim()) return;
    const keyword = {
      text: newItems.keyword.trim(),
      cpc: newItems.keywordCpc ? parseFloat(newItems.keywordCpc) : undefined,
    };
    const updatedData = {
      ...data,
      keywords: [...data.keywords, keyword],
    };
    setData(updatedData);
    await saveContentPlanningData(updatedData);
    setNewItems({ ...newItems, keyword: '', keywordCpc: '' });
  };

  const addOffer = async () => {
    if (!newItems.offer.trim()) return;
    const updatedData = {
      ...data,
      offers: [...data.offers, newItems.offer.trim()],
    };
    setData(updatedData);
    await saveContentPlanningData(updatedData);
    setNewItems({ ...newItems, offer: '' });
  };

  const addHVCO = async () => {
    if (!newItems.hvco.trim()) return;
    const updatedData = {
      ...data,
      high_value_offers: [...data.high_value_offers, newItems.hvco.trim()],
    };
    setData(updatedData);
    await saveContentPlanningData(updatedData);
    setNewItems({ ...newItems, hvco: '' });
  };

  const removeItem = async (type: 'headlines' | 'keywords' | 'offers' | 'high_value_offers', index: number) => {
    const updatedData = {
      ...data,
      [type]: data[type].filter((_, i) => i !== index),
    };
    setData(updatedData);
    await saveContentPlanningData(updatedData);
  };

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border-2 border-purple-500 overflow-hidden sticky top-6">
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
        <h3 className="font-bold text-brand-light-text dark:text-white">Content Planning</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">AI-powered ad copy & keyword strategy</p>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-4 space-y-6">
        {/* Powerful Headlines */}
        <div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-brand-light-text dark:text-white text-sm">💡 Powerful Headlines: ({data.headlines.length})</h4>
              <button
                onClick={generateHeadlines}
                disabled={isGenerating.headlines}
                className="text-xs bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded transition flex items-center gap-1 flex-shrink-0"
              >
                {isGenerating.headlines ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-700 dark:border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span className="whitespace-nowrap">Generating...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span className="whitespace-nowrap">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            {data.headlines.map((headline, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm group">
                <span className="text-purple-600 flex-shrink-0">•</span>
                <span className="flex-1 text-gray-700 dark:text-gray-300 break-words">{headline}</span>
                <button 
                  onClick={() => removeItem('headlines', idx)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
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
              value={newItems.headline}
              onChange={(e) => setNewItems({ ...newItems, headline: e.target.value })}
              placeholder="Add headline..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addHeadline()}
            />
            <button
              onClick={addHeadline}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <div className="mb-2">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-brand-light-text dark:text-white text-sm">🎯 Keywords: ({data.keywords.length})</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">For ad targeting & CPC tracking</p>
              </div>
              <button
                onClick={generateKeywords}
                disabled={isGenerating.keywords}
                className="text-xs bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded transition flex items-center gap-1 flex-shrink-0"
              >
                {isGenerating.keywords ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-700 dark:border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span className="whitespace-nowrap">Generating...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span className="whitespace-nowrap">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            {data.keywords.map((keyword, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm group">
                <span className="flex-1 text-gray-700 dark:text-gray-300 break-words">{keyword.text}</span>
                {keyword.cpc && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">${keyword.cpc.toFixed(2)}</span>
                )}
                <button 
                  onClick={() => removeItem('keywords', idx)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
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
              value={newItems.keyword}
              onChange={(e) => setNewItems({ ...newItems, keyword: e.target.value })}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addKeyword()}
            />
            <input
              type="number"
              step="0.01"
              value={newItems.keywordCpc}
              onChange={(e) => setNewItems({ ...newItems, keywordCpc: e.target.value })}
              placeholder="CPC"
              className="w-20 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Offers */}
        <div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-brand-light-text dark:text-white text-sm">🎁 Offers: ({data.offers.length})</h4>
              <button
                onClick={generateOffers}
                disabled={isGenerating.offers}
                className="text-xs bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded transition flex items-center gap-1 flex-shrink-0"
              >
                {isGenerating.offers ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-700 dark:border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span className="whitespace-nowrap">Generating...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span className="whitespace-nowrap">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            {data.offers.map((offer, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm group">
                <span className="text-purple-600 flex-shrink-0">•</span>
                <span className="flex-1 text-gray-700 dark:text-gray-300 break-words">{offer}</span>
                <button 
                  onClick={() => removeItem('offers', idx)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
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
              value={newItems.offer}
              onChange={(e) => setNewItems({ ...newItems, offer: e.target.value })}
              placeholder="Add offer..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addOffer()}
            />
            <button
              onClick={addOffer}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* High Value Content Offers */}
        <div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-brand-light-text dark:text-white text-sm">💎 High Value Content Offers: ({data.high_value_offers.length})</h4>
              <button
                onClick={generateHVCOs}
                disabled={isGenerating.hvcos}
                className="text-xs bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded transition flex items-center gap-1 flex-shrink-0"
              >
                {isGenerating.hvcos ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-700 dark:border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span className="whitespace-nowrap">Generating...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span className="whitespace-nowrap">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            {data.high_value_offers.map((hvco, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm group">
                <span className="text-purple-600 flex-shrink-0">•</span>
                <span className="flex-1 text-gray-700 dark:text-gray-300 break-words">{hvco}</span>
                <button 
                  onClick={() => removeItem('high_value_offers', idx)}
                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
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
              value={newItems.hvco}
              onChange={(e) => setNewItems({ ...newItems, hvco: e.target.value })}
              placeholder="Add high value offer..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addHVCO()}
            />
            <button
              onClick={addHVCO}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* New Content Section Placeholder */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-brand-light-text dark:text-white mb-2 text-sm">📝 New Content Section</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Coming soon - Additional content planning tools...</p>
        </div>
      </div>
    </div>
  );
};

export default ContentPlanningPanel;
