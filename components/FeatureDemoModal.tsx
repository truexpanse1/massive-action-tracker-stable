import React from 'react';

interface FeatureDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    title: string;
    subtitle: string;
    benefits: string[];
    demoContent: React.ReactNode;
  };
  onGetStarted: () => void;
}

export default function FeatureDemoModal({ isOpen, onClose, feature, onGetStarted }: FeatureDemoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black mb-2">{feature.title}</h2>
            <p className="text-blue-100 text-lg">{feature.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Demo Content */}
        <div className="p-8">
          {/* Feature Demo */}
          <div className="mb-8">
            {feature.demoContent}
          </div>

          {/* Key Benefits */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-black mb-4 text-gray-900">Key Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {feature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-500 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700 text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onGetStarted}
              className="px-12 py-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started with MAT →
            </button>
            <p className="text-gray-500 mt-4 text-sm">
              ✓ Instant Access  ✓ Setup in 2 minutes  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
