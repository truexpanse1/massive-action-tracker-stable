// ProposalBuilderModal.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User } from '../src/types';
import { BuyerAvatar } from '../src/marketingTypes';
import {
  createProposal,
  generateProposalContent,
  generateProposalSlug,
  fetchServicePackages,
  ServicePackage,
} from '../src/services/proposalService';

interface HotLead {
  id: number;
  company_name: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
}

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  hotLead: HotLead;
}

const ProposalBuilderModal: React.FC<ProposalBuilderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  hotLead,
}) => {
  const [step, setStep] = useState(1); // 1: Select Avatar, 2: Select Package, 3: Customize, 4: Generating
  const [avatars, setAvatars] = useState<BuyerAvatar[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<BuyerAvatar | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [customServices, setCustomServices] = useState<Array<{ name: string; description: string }>>([]);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [customPricingModel, setCustomPricingModel] = useState<'monthly' | 'one-time' | 'annual'>('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvatars();
      fetchPackages();
    }
  }, [isOpen]);

  const fetchAvatars = async () => {
    const { data, error } = await supabase
      .from('buyer_avatars')
      .select('*')
      .eq('company_id', user.company_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching avatars:', error);
      setError('Failed to load Dream Client Profiles');
    } else {
      setAvatars(data || []);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await fetchServicePackages(user.company_id);
      setPackages(data);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to load service packages');
    }
  };

  const handleAvatarSelect = (avatar: BuyerAvatar) => {
    setSelectedAvatar(avatar);
    setStep(2);
  };

  const handlePackageSelect = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setCustomServices(pkg.services);
    setCustomPrice(pkg.price);
    setCustomPricingModel(pkg.pricing_model);
    setStep(3);
  };

  const handleGenerateProposal = async () => {
    if (!selectedAvatar || !selectedPackage) {
      setError('Please select an avatar and package');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate AI content
      const aiContent = await generateProposalContent(
        selectedAvatar,
        hotLead.company_name,
        customServices
      );

      // Create proposal
      const slug = generateProposalSlug(hotLead.company_name);
      
      await createProposal({
        company_id: user.company_id,
        user_id: user.id,
        hot_lead_id: hotLead.id,
        avatar_id: selectedAvatar.id,
        service_package_id: selectedPackage.id,
        company_name: hotLead.company_name,
        contact_name: hotLead.contact_name,
        contact_email: hotLead.contact_email || null,
        contact_phone: hotLead.contact_phone || null,
        industry: hotLead.industry || selectedAvatar.industry || null,
        ai_problem_analysis: aiContent.problemAnalysis,
        ai_goals_content: aiContent.goalsContent,
        ai_solution_narrative: aiContent.solutionNarrative,
        services: customServices,
        pricing_model: customPricingModel,
        price: customPrice,
        slug,
        status: 'draft',
      });

      onSuccess();
      resetAndClose();
    } catch (err) {
      console.error('Error generating proposal:', err);
      setError('Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedAvatar(null);
    setSelectedPackage(null);
    setCustomServices([]);
    setCustomPrice(0);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-brand-light-border dark:border-brand-gray p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                Generate Proposal
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                for {hotLead.company_name}
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isGenerating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= s
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Select Avatar */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                Select Dream Client Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the avatar that best matches {hotLead.company_name}
              </p>

              {avatars.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No Dream Client Profiles found. Create one first in the Dream Client Studio.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar)}
                      className="text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          {avatar.avatar_image_url ? (
                            <img
                              src={avatar.avatar_image_url}
                              alt={avatar.avatar_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-light-text dark:text-white">
                            {avatar.avatar_name}
                          </h4>
                          {avatar.industry && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{avatar.industry}</p>
                          )}
                        </div>
                      </div>
                      {avatar.avatar_summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {avatar.avatar_summary}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Package */}
          {step === 2 && selectedAvatar && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Avatar Selection
              </button>

              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                Select Service Package
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose a package template to customize
              </p>

              {packages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No service packages found. Create one in the Service Library.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePackageSelect(pkg)}
                      className="text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-xl text-brand-light-text dark:text-white">
                            {pkg.package_name}
                          </h4>
                          {pkg.category && (
                            <span className="inline-block mt-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded">
                              {pkg.category}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            ${pkg.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {pkg.pricing_model}
                          </div>
                        </div>
                      </div>
                      {pkg.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{pkg.description}</p>
                      )}
                      <div className="space-y-2">
                        {pkg.services.slice(0, 3).map((service, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{service.name}</span>
                          </div>
                        ))}
                        {pkg.services.length > 3 && (
                          <p className="text-sm text-purple-600">
                            +{pkg.services.length - 3} more services
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customize & Generate */}
          {step === 3 && selectedPackage && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Package Selection
              </button>

              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-4">
                Customize Proposal
              </h3>

              <div className="space-y-6">
                {/* Pricing */}
                <div>
                  <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                    Price
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(parseFloat(e.target.value))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                    />
                    <select
                      value={customPricingModel}
                      onChange={(e) => setCustomPricingModel(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="one-time">One-time</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-brand-light-text dark:text-white mb-2">
                    Services Included
                  </label>
                  <div className="space-y-3">
                    {customServices.map((service, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const newServices = [...customServices];
                            newServices[idx].name = e.target.value;
                            setCustomServices(newServices);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white mb-2"
                          placeholder="Service name"
                        />
                        <textarea
                          value={service.description}
                          onChange={(e) => {
                            const newServices = [...customServices];
                            newServices[idx].description = e.target.value;
                            setCustomServices(newServices);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-brand-light-text dark:text-white"
                          placeholder="Service description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="font-bold text-brand-light-text dark:text-white mb-2">
                    Ready to Generate
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI will create personalized content based on <strong>{selectedAvatar.avatar_name}</strong>'s 
                    pain points, goals, and buying triggers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-brand-light-border dark:border-brand-gray p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={resetAndClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={isGenerating}
            >
              Cancel
            </button>

            {step === 3 && (
              <button
                onClick={handleGenerateProposal}
                disabled={isGenerating}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Proposal
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalBuilderModal;
