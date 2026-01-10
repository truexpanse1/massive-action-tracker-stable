// MyProposalsPage.tsx - View and manage all proposals
import React, { useState, useEffect } from 'react';
import { User } from '../src/types';
import { supabase } from '../src/services/supabaseClient';

interface MyProposalsPageProps {
  user: User;
}

interface Proposal {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string | null;
  package_name: string;
  total_price: number;
  pricing_model: string;
  slug: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted';
  view_count: number;
  accepted_at: string | null;
  created_at: string;
  hot_lead_id: number | null;
}

const MyProposalsPage: React.FC<MyProposalsPageProps> = ({ user }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'viewed' | 'accepted'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error('Error loading proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/proposal/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadProposals();
    } catch (err) {
      console.error('Error deleting proposal:', err);
      alert('Failed to delete proposal');
    }
  };

  const filteredProposals = filter === 'all' 
    ? proposals 
    : proposals.filter(p => p.status === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      sent: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
      viewed: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
      accepted: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading proposals...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">
              My Proposals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all your generated proposals
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-600">{proposals.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Proposals</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {proposals.filter(p => p.status === 'sent').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Sent</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {proposals.filter(p => p.status === 'viewed').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Viewed</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {proposals.filter(p => p.status === 'accepted').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Accepted</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {proposals.filter(p => p.status === 'accepted').length > 0
                ? Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100)
                : 0}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'draft', 'sent', 'viewed', 'accepted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? proposals.length : proposals.filter(p => p.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
              {filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {filter === 'all' 
                ? 'Generate your first proposal from the Hot Leads page'
                : `You don't have any ${filter} proposals yet`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-brand-light-text dark:text-white">
                        {proposal.company_name}
                      </h3>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                      Contact: {proposal.contact_name}
                      {proposal.contact_email && ` • ${proposal.contact_email}`}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                      Created {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      ${proposal.total_price?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {proposal.pricing_model === 'one-time' ? 'one-time' : `/${proposal.pricing_model === 'annual' ? 'year' : 'month'}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    {proposal.package_name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {proposal.view_count} {proposal.view_count === 1 ? 'view' : 'views'}
                  </div>
                  {proposal.accepted_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Accepted {new Date(proposal.accepted_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopyUrl(proposal.slug)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
                  >
                    {copiedSlug === proposal.slug ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy URL
                      </>
                    )}
                  </button>
                  <a
                    href={`/proposal/${proposal.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium text-sm transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="px-4 py-2 border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium text-sm transition"
                    title="Delete proposal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProposalsPage;
