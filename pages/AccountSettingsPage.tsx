import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface AccountSettingsPageProps {
  onClose?: () => void;
}

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setError('Not logged in');
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Get user's company data
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', authUser.id)
        .single();

      if (userData?.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userData.company_id)
          .single();

        setCompany(companyData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setError('');
    setMessage('');

    try {
      // Call Netlify function to cancel subscription
      const response = await fetch('/.netlify/functions/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId: company?.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setMessage('Subscription cancelled successfully. You will have access until the end of your billing period.');
      setShowCancelConfirm(false);
      
      // Reload company data
      await loadUserData();
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light-bg dark:bg-brand-ink flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light-bg dark:bg-brand-ink p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-brand-light-text dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and subscription
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg text-green-700 dark:text-green-300">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Account Information */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 mb-6">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-brand-light-text dark:text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="text-brand-light-text dark:text-white font-medium">
                {user?.user_metadata?.full_name || 'Not set'}
              </p>
            </div>
            {company && (
              <>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                  <p className="text-brand-light-text dark:text-white font-medium">{company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                  <p className="text-brand-light-text dark:text-white font-medium">{company.plan}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Subscription Management */}
        {company?.stripe_subscription_id && (
          <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 mb-6">
            <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
              Subscription Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have an active subscription. If you cancel, you'll continue to have access until the end of your current billing period.
            </p>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Password Management */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
            Password
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            To change your password, log out and use the "Forgot Password" link on the login page.
          </p>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCancelConfirm(false)}>
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-brand-red mb-4">Cancel Subscription?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                  className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-70"
                >
                  {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsPage;
