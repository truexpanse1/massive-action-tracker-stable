// components/AvatarBuilderModal.tsx
import React, { useState } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User } from '../src/types';
import { AvatarFormData, BuyerAvatar } from '../src/marketingTypes';

interface AvatarBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  existingAvatar?: BuyerAvatar;
}

const AvatarBuilderModal: React.FC<AvatarBuilderModalProps> = ({ isOpen, onClose, onSuccess, user, existingAvatar }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<AvatarFormData>>(existingAvatar || {
    avatar_name: '',
    industry: '',
    age_range: '',
    gender: '',
    education_level: '',
    marital_status: '',
    occupation: '',
    income_range: '',
    location: '',
    goals: [],
    fears: [],
    dreams: [],
    pain_points: [],
    desires: [],
    beliefs: [],
    buying_triggers: [],
    objections: [],
    preferred_content_types: [],
    social_platforms: [],
    relationships: '',
    daily_habits: '',
    media_consumption: '',
    expectations: '',
    obsessed_stalker_insights: '',
    deep_seeded_triggers: '',
    market_wants: '',
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const avatarData = {
        company_id: user.company_id,
        user_id: user.id,
        assigned_to: user.id,
        avatar_name: formData.avatar_name || 'Unnamed Dream Client',
        industry: formData.industry || null,
        age_range: formData.age_range || null,
        gender: formData.gender || null,
        education_level: formData.education_level || null,
        marital_status: formData.marital_status || null,
        occupation: formData.occupation || null,
        income_range: formData.income_range || null,
        location: formData.location || null,
        goals: formData.goals || [],
        fears: formData.fears || [],
        dreams: formData.dreams || [],
        pain_points: formData.pain_points || [],
        desires: formData.desires || [],
        beliefs: formData.beliefs || [],
        buying_triggers: formData.buying_triggers || [],
        objections: formData.objections || [],
        preferred_content_types: formData.preferred_content_types || [],
        social_platforms: formData.social_platforms || [],
        relationships: formData.relationships || null,
        daily_habits: formData.daily_habits || null,
        media_consumption: formData.media_consumption || null,
        expectations: formData.expectations || null,
        obsessed_stalker_insights: formData.obsessed_stalker_insights || null,
        deep_seeded_triggers: formData.deep_seeded_triggers || null,
        market_wants: formData.market_wants || null,
        is_active: true,
      };

      let error;
      if (existingAvatar) {
        // Update existing avatar
        const { error: updateError } = await supabase
          .from('buyer_avatars')
          .update(avatarData)
          .eq('id', existingAvatar.id);
        error = updateError;
      } else {
        // Create new avatar
        const { error: insertError } = await supabase
          .from('buyer_avatars')
          .insert([avatarData]);
        error = insertError;
      }

      if (error) throw error;

      onSuccess();
      onClose();
      
      // Reset form
      setCurrentStep(1);
      setFormData({});
    } catch (error) {
      console.error('Error creating avatar:', error);
      alert('Failed to create avatar. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (field: keyof AvatarFormData, value: string) => {
    if (!value.trim()) return;
    const currentArray = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: [...currentArray, value.trim()],
    });
  };

  const removeArrayItem = (field: keyof AvatarFormData, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: currentArray.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray max-w-3xl w-full my-8">
        {/* Header */}
        <div className="border-b border-brand-light-border dark:border-brand-gray p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
              Create Dream Client Profile
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

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx + 1 <= currentStep ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <Step2Demographics formData={formData} setFormData={setFormData} />}
          {currentStep === 3 && <Step3GoalsDreams formData={formData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 4 && <Step4FearsPains formData={formData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 5 && <Step5BuyingBehavior formData={formData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} setFormData={setFormData} />}
          {currentStep === 6 && <Step6DeepInsights formData={formData} setFormData={setFormData} />}
          {currentStep === 7 && <Step7Review formData={formData} />}
        </div>

        {/* Footer */}
        <div className="border-t border-brand-light-border dark:border-brand-gray p-6 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-brand-light-text dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-brand-light-text dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Dream Client'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const Step1BasicInfo: React.FC<{ formData: Partial<AvatarFormData>; setFormData: (data: Partial<AvatarFormData>) => void }> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Basic Information</h3>
      <p className="text-gray-600 dark:text-gray-400">Let's start with the basics about your ideal client.</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">
        Dream Client Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={formData.avatar_name || ''}
        onChange={(e) => setFormData({ ...formData, avatar_name: e.target.value })}
        placeholder="e.g., High-Earning Entrepreneur Sarah"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">
        Industry
      </label>
      <input
        type="text"
        value={formData.industry || ''}
        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
        placeholder="e.g., Real Estate, E-commerce, Coaching"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
      />
    </div>
  </div>
);

const Step2Demographics: React.FC<{ formData: Partial<AvatarFormData>; setFormData: (data: Partial<AvatarFormData>) => void }> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Demographics</h3>
      <p className="text-gray-600 dark:text-gray-400">Paint a picture of who they are.</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Age Range</label>
        <select
          value={formData.age_range || ''}
          onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
        >
          <option value="">Select...</option>
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55-64">55-64</option>
          <option value="65+">65+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Gender</label>
        <select
          value={formData.gender || ''}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
        >
          <option value="">Select...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="All">All</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Education Level</label>
        <select
          value={formData.education_level || ''}
          onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
        >
          <option value="">Select...</option>
          <option value="High School">High School</option>
          <option value="Some College">Some College</option>
          <option value="Bachelor's Degree">Bachelor's Degree</option>
          <option value="Master's Degree">Master's Degree</option>
          <option value="Doctorate">Doctorate</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Marital Status</label>
        <select
          value={formData.marital_status || ''}
          onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
        >
          <option value="">Select...</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Occupation</label>
      <input
        type="text"
        value={formData.occupation || ''}
        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
        placeholder="e.g., Business Owner, Marketing Director"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Income Range</label>
      <select
        value={formData.income_range || ''}
        onChange={(e) => setFormData({ ...formData, income_range: e.target.value })}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
      >
        <option value="">Select...</option>
        <option value="Under $50k">Under $50k</option>
        <option value="$50k-$100k">$50k-$100k</option>
        <option value="$100k-$200k">$100k-$200k</option>
        <option value="$200k-$500k">$200k-$500k</option>
        <option value="$500k+">$500k+</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Location</label>
      <input
        type="text"
        value={formData.location || ''}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="e.g., Urban areas, Suburban, Nationwide"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
      />
    </div>
  </div>
);

// Continued in next part...
const Step3GoalsDreams: React.FC<{
  formData: Partial<AvatarFormData>;
  addArrayItem: (field: keyof AvatarFormData, value: string) => void;
  removeArrayItem: (field: keyof AvatarFormData, index: number) => void;
}> = ({ formData, addArrayItem, removeArrayItem }) => {
  const [goalInput, setGoalInput] = useState('');
  const [dreamInput, setDreamInput] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Goals & Dreams</h3>
        <p className="text-gray-600 dark:text-gray-400">What do they want to achieve?</p>
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Goals</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('goals', goalInput);
                setGoalInput('');
              }
            }}
            placeholder="Add a goal and press Enter"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => {
              addArrayItem('goals', goalInput);
              setGoalInput('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.goals || []).map((goal, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-brand-light-text dark:text-white">{goal}</span>
              <button
                onClick={() => removeArrayItem('goals', idx)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dreams */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Dreams</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={dreamInput}
            onChange={(e) => setDreamInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('dreams', dreamInput);
                setDreamInput('');
              }
            }}
            placeholder="Add a dream and press Enter"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => {
              addArrayItem('dreams', dreamInput);
              setDreamInput('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.dreams || []).map((dream, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-brand-light-text dark:text-white">{dream}</span>
              <button
                onClick={() => removeArrayItem('dreams', idx)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step4FearsPains: React.FC<{
  formData: Partial<AvatarFormData>;
  addArrayItem: (field: keyof AvatarFormData, value: string) => void;
  removeArrayItem: (field: keyof AvatarFormData, index: number) => void;
}> = ({ formData, addArrayItem, removeArrayItem }) => {
  const [fearInput, setFearInput] = useState('');
  const [painInput, setPainInput] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Fears & Pain Points</h3>
        <p className="text-gray-600 dark:text-gray-400">What keeps them up at night?</p>
      </div>

      {/* Fears */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Fears</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={fearInput}
            onChange={(e) => setFearInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('fears', fearInput);
                setFearInput('');
              }
            }}
            placeholder="Add a fear and press Enter"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => {
              addArrayItem('fears', fearInput);
              setFearInput('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.fears || []).map((fear, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-brand-light-text dark:text-white">{fear}</span>
              <button
                onClick={() => removeArrayItem('fears', idx)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Pain Points</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={painInput}
            onChange={(e) => setPainInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('pain_points', painInput);
                setPainInput('');
              }
            }}
            placeholder="Add a pain point and press Enter"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => {
              addArrayItem('pain_points', painInput);
              setPainInput('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.pain_points || []).map((pain, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-brand-light-text dark:text-white">{pain}</span>
              <button
                onClick={() => removeArrayItem('pain_points', idx)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step5BuyingBehavior: React.FC<{
  formData: Partial<AvatarFormData>;
  addArrayItem: (field: keyof AvatarFormData, value: string) => void;
  removeArrayItem: (field: keyof AvatarFormData, index: number) => void;
  setFormData: (data: Partial<AvatarFormData>) => void;
}> = ({ formData, addArrayItem, removeArrayItem, setFormData }) => {
  const [triggerInput, setTriggerInput] = useState('');
  const [objectionInput, setObjectionInput] = useState('');

  const socialPlatforms = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'Twitter', 'YouTube'];

  const togglePlatform = (platform: string) => {
    const current = formData.social_platforms || [];
    if (current.includes(platform)) {
      setFormData({ ...formData, social_platforms: current.filter(p => p !== platform) });
    } else {
      setFormData({ ...formData, social_platforms: [...current, platform] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Buying Behavior</h3>
        <p className="text-gray-600 dark:text-gray-400">What triggers them to buy?</p>
      </div>

      {/* Buying Triggers */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Buying Triggers</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('buying_triggers', triggerInput);
                setTriggerInput('');
              }
            }}
            placeholder="e.g., Urgency, Social proof, Limited availability"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => {
              addArrayItem('buying_triggers', triggerInput);
              setTriggerInput('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.buying_triggers || []).map((trigger, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-brand-light-text dark:text-white">{trigger}</span>
              <button
                onClick={() => removeArrayItem('buying_triggers', idx)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Objections */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Common Objections</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={objectionInput}
            onChange={(e) => setObjectionInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addArrayItem('objections', objectionInput);
                setObjectionInput('');
              }
            }}
            placeholder="e.g., Too expensive, No time, Need to think about it"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={() => {
              addArrayItem('objections', objectionInput);
              setObjectionInput('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.objections || []).map((objection, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-brand-light-text dark:text-white">{objection}</span>
              <button
                onClick={() => removeArrayItem('objections', idx)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Platforms */}
      <div>
        <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">Active Social Platforms</label>
        <div className="grid grid-cols-3 gap-3">
          {socialPlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`px-4 py-2 rounded-lg border-2 transition ${
                (formData.social_platforms || []).includes(platform)
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step6DeepInsights: React.FC<{ formData: Partial<AvatarFormData>; setFormData: (data: Partial<AvatarFormData>) => void }> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Deep Insights</h3>
      <p className="text-gray-600 dark:text-gray-400">Sabri Suby's framework for obsessed stalker-level understanding.</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">
        Obsessed Stalker Insights
      </label>
      <textarea
        value={formData.obsessed_stalker_insights || ''}
        onChange={(e) => setFormData({ ...formData, obsessed_stalker_insights: e.target.value })}
        placeholder="What would you know if you were obsessively studying this person? Their habits, preferences, daily routines..."
        rows={4}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">
        Deep-Seeded Buying Triggers
      </label>
      <textarea
        value={formData.deep_seeded_triggers || ''}
        onChange={(e) => setFormData({ ...formData, deep_seeded_triggers: e.target.value })}
        placeholder="What deep psychological triggers make them buy? Status, security, belonging, achievement..."
        rows={4}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-brand-light-text dark:text-white mb-2">
        What Your Market REALLY Wants
      </label>
      <textarea
        value={formData.market_wants || ''}
        onChange={(e) => setFormData({ ...formData, market_wants: e.target.value })}
        placeholder="Beyond features and benefits, what transformation are they truly seeking?"
        rows={4}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-brand-light-text dark:text-white focus:ring-2 focus:ring-purple-600"
      />
    </div>
  </div>
);

const Step7Review: React.FC<{ formData: Partial<AvatarFormData> }> = ({ formData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">Review Your Dream Client</h3>
      <p className="text-gray-600 dark:text-gray-400">Make sure everything looks good before creating.</p>
    </div>

    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Dream Client Name</p>
        <p className="text-lg font-bold text-brand-light-text dark:text-white">{formData.avatar_name || 'Not set'}</p>
      </div>

      {formData.industry && (
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Industry</p>
          <p className="text-brand-light-text dark:text-white">{formData.industry}</p>
        </div>
      )}

      {(formData.goals && formData.goals.length > 0) && (
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Goals ({formData.goals.length})</p>
          <ul className="list-disc list-inside text-brand-light-text dark:text-white">
            {formData.goals.slice(0, 3).map((goal, idx) => (
              <li key={idx}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {(formData.fears && formData.fears.length > 0) && (
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Fears ({formData.fears.length})</p>
          <ul className="list-disc list-inside text-brand-light-text dark:text-white">
            {formData.fears.slice(0, 3).map((fear, idx) => (
              <li key={idx}>{fear}</li>
            ))}
          </ul>
        </div>
      )}

      {(formData.social_platforms && formData.social_platforms.length > 0) && (
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Social Platforms</p>
          <p className="text-brand-light-text dark:text-white">{formData.social_platforms.join(', ')}</p>
        </div>
      )}
    </div>

    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <p className="text-sm text-yellow-800 dark:text-yellow-200">
        <strong>Ready to dominate?</strong> Once created, you can generate high-converting content tailored specifically to this dream client!
      </p>
    </div>
  </div>
);

export default AvatarBuilderModal;
