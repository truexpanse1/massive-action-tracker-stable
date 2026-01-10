// ProposalViewPage.tsx - Public proposal display page
import React, { useState, useEffect } from 'react';
import { fetchProposalBySlug, updateProposalStatus, Proposal } from '../src/services/proposalService';

interface ProposalViewPageProps {
  slug: string;
}

const ProposalViewPage: React.FC<ProposalViewPageProps> = ({ slug }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptanceNotes, setAcceptanceNotes] = useState('');
  const [acceptanceSignature, setAcceptanceSignature] = useState('');
  const [showAcceptForm, setShowAcceptForm] = useState(false);

  useEffect(() => {
    loadProposal();
  }, [slug]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await fetchProposalBySlug(slug);
      if (!data) {
        setError('Proposal not found');
      } else {
        setProposal(data);
      }
    } catch (err) {
      console.error('Error loading proposal:', err);
      setError('Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!proposal || !acceptanceSignature.trim()) {
      alert('Please provide your signature');
      return;
    }

    setIsAccepting(true);
    try {
      await updateProposalStatus(proposal.id, 'accepted', {
        acceptance_notes: acceptanceNotes,
        acceptance_signature: acceptanceSignature,
      });
      
      // Reload to show accepted state
      await loadProposal();
      setShowAcceptForm(false);
      alert('🎉 Proposal accepted! We\'ll be in touch soon.');
    } catch (err) {
      console.error('Error accepting proposal:', err);
      alert('Failed to accept proposal. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Proposal Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'This proposal link may be invalid or expired.'}
          </p>
        </div>
      </div>
    );
  }

  const isAccepted = proposal.status === 'accepted';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Proposal for {proposal.company_name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Prepared for {proposal.contact_name}
              </p>
            </div>
            {isAccepted && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                ✓ Accepted
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* The Challenge */}
        {proposal.ai_problem_analysis && (
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              The Challenge
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
              {proposal.ai_problem_analysis.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Your Vision */}
        {proposal.ai_goals_content && (
          <section className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-8 mb-8 border border-purple-200 dark:border-purple-800">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Your Vision
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
              {proposal.ai_goals_content.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Our Solution */}
        {proposal.ai_solution_narrative && (
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Solution
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {proposal.ai_solution_narrative.split('\n').map((paragraph, idx) => (
                paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>

            {/* Services Included */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                What's Included
              </h3>
              <div className="space-y-4">
                {proposal.services.map((service, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{service.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Investment */}
        <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your Investment</h2>
            <div className="text-6xl font-bold mb-2">
              ${proposal.price.toLocaleString()}
              <span className="text-2xl font-normal">
                /{proposal.pricing_model === 'one-time' ? 'one-time' : proposal.pricing_model === 'annual' ? 'year' : 'month'}
              </span>
            </div>
            <p className="text-purple-100 text-lg mt-4">
              An investment in your business growth and success
            </p>
          </div>
        </section>

        {/* CTA */}
        {!isAccepted && !showAcceptForm && (
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Accept this proposal to begin your journey to success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAcceptForm(true)}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg transition"
              >
                Accept This Proposal
              </button>
              <a
                href={`mailto:${proposal.contact_email || 'contact@example.com'}?subject=Question about Proposal for ${proposal.company_name}`}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-bold text-lg transition"
              >
                Request More Info
              </button>
            </div>
          </section>
        )}

        {/* Accept Form */}
        {showAcceptForm && !isAccepted && (
          <section className="bg-white dark:bg-gray-800 rounded-lg p-8 border-2 border-purple-600">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Accept Proposal
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={acceptanceNotes}
                  onChange={(e) => setAcceptanceNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Any questions or special requests?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Signature *
                </label>
                <input
                  type="text"
                  value={acceptanceSignature}
                  onChange={(e) => setAcceptanceSignature(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-signature text-2xl"
                  placeholder="Type your full name"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  By signing, you agree to the terms outlined in this proposal
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAcceptProposal}
                  disabled={isAccepting || !acceptanceSignature.trim()}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAccepting ? 'Processing...' : 'Confirm Acceptance'}
                </button>
                <button
                  onClick={() => setShowAcceptForm(false)}
                  disabled={isAccepting}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Accepted Message */}
        {isAccepted && (
          <section className="bg-green-50 dark:bg-green-900/10 border-2 border-green-500 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Proposal Accepted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Thank you for accepting this proposal. We'll be in touch shortly to get started.
            </p>
            {proposal.acceptance_signature && (
              <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Signed by:</p>
                <p className="text-2xl font-signature text-gray-900 dark:text-white">
                  {proposal.acceptance_signature}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(proposal.accepted_at!).toLocaleDateString()}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Questions? Contact us at {proposal.contact_email || 'contact@example.com'}</p>
          <p className="mt-2">Proposal viewed {proposal.view_count} times</p>
        </div>
      </footer>
    </div>
  );
};

export default ProposalViewPage;
