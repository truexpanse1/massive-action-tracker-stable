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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [giftedAccounts, setGiftedAccounts] = useState<any[]>([]);
  const [showCreateGifted, setShowCreateGifted] = useState(false);
  const [giftedEmail, setGiftedEmail] = useState('');
  const [giftedName, setGiftedName] = useState('');
  const [giftedCompanyName, setGiftedCompanyName] = useState('');
  const [giftedPassword, setGiftedPassword] = useState('');
  const [createGiftedLoading, setCreateGiftedLoading] = useState(false);
  const [accountType, setAccountType] = useState<'team' | 'standalone'>('standalone');
  const [billingType, setBillingType] = useState<'ghl' | 'stripe'>('ghl');
  const [selectedPlan, setSelectedPlan] = useState<'solo' | 'team' | 'elite'>('solo');

  useEffect(() => {
    loadUserData();
    loadGiftedAccounts();
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

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setError('');
    setMessage('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setPasswordLoading(false);
      return;
    }

    try {
      // Update password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage('Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadGiftedAccounts = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Get all companies sponsored by this user
      const { data: gifted } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          is_gifted_account,
          gifted_at,
          account_status,
          users!inner(id, email, name)
        `)
        .eq('sponsored_by_user_id', authUser.id)
        .eq('is_gifted_account', true);

      setGiftedAccounts(gifted || []);
    } catch (err) {
      console.error('Error loading gifted accounts:', err);
    }
  };

  const handleCreateGiftedAccount = async () => {
    setCreateGiftedLoading(true);
    setError('');
    setMessage('');

    try {
      if (accountType === 'team') {
        // Create team member - add to existing company
        const response = await fetch('/.netlify/functions/create-team-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: company.id,
            email: giftedEmail,
            name: giftedName,
            password: giftedPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create team member');
        }

        setMessage(`Team member ${giftedName} added successfully!`);
      } else {
        // Create standalone account
        const response = await fetch('/.netlify/functions/create-gifted-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sponsorUserId: user.id,
            email: giftedEmail,
            name: giftedName,
            companyName: giftedCompanyName,
            password: giftedPassword,
            billingType,
            plan: selectedPlan,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create standalone account');
        }

        setMessage(`Standalone account created successfully for ${giftedEmail}`);
      }

      setShowCreateGifted(false);
      setGiftedEmail('');
      setGiftedName('');
      setGiftedCompanyName('');
      setGiftedPassword('');
      setAccountType('standalone');
      setBillingType('ghl');
      setSelectedPlan('solo');
      await loadGiftedAccounts();
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message);
    } finally {
      setCreateGiftedLoading(false);
    }
  };

  const handleToggleGiftedAccount = async (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    
    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({ account_status: newStatus })
        .eq('id', companyId);

      if (updateError) throw updateError;

      setMessage(`Account ${newStatus === 'active' ? 'activated' : 'disabled'} successfully`);
      await loadGiftedAccounts();
    } catch (err: any) {
      console.error('Error toggling account:', err);
      setError(err.message);
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
        {company && (
          <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 mb-6">
            <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
              Subscription & Billing
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Plan</p>
              <p className="text-2xl font-bold text-brand-blue capitalize">
                {company.subscription_ || 'Starter'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {company.max_users} user{company.max_users > 1 ? 's' : ''} maximum
              </p>
              {company?.stripe_subscription_id && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 underline mt-1"
                >
                  Cancellation
                </button>
              )}
            </div>

            {/* Active Subscription Info */}
            {company?.stripe_subscription_id && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  ✓ Active Subscription
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Your subscription will automatically renew. You can cancel anytime.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Account Management */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6 mb-6">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
            Account Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add team members or create standalone accounts for others.
          </p>
          
          <button
            onClick={() => setShowCreateGifted(true)}
            className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-lg transition mb-6"
          >
            Add Account
          </button>

          {/* List of Gifted Accounts */}
          {giftedAccounts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">
                Your Gifted Accounts ({giftedAccounts.length})
              </h3>
              <div className="space-y-3">
                {giftedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-ink rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-brand-light-text dark:text-white">
                        {account.users[0]?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.users[0]?.email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Company: {account.name} • Created: {new Date(account.gifted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          account.account_status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {account.account_status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => handleToggleGiftedAccount(account.id, account.account_status)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                          account.account_status === 'active'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {account.account_status === 'active' ? 'Disable' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Password Management */}
        <div className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
            Password
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Change your password to keep your account secure.
          </p>
          <button
            onClick={() => setShowChangePassword(true)}
            className="px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Change Password
          </button>
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

        {/* Enhanced Add Account Modal */}
        {showCreateGifted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateGifted(false)}>
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-brand-light-text dark:text-white mb-6">Add Account</h3>
              
              <div className="space-y-6">
                {/* Step 1: Account Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAccountType('team')}
                      className={`p-4 rounded-lg border-2 transition ${
                        accountType === 'team'
                          ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-brand-light-text dark:text-white mb-1">Team Member</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Joins your company • You see their data • Free</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setAccountType('standalone')}
                      className={`p-4 rounded-lg border-2 transition ${
                        accountType === 'standalone'
                          ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-brand-light-text dark:text-white mb-1">Standalone Account</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Own company • Private data • Paid</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Billing Type (only for standalone) */}
                {accountType === 'standalone' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Billing Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setBillingType('ghl')}
                        className={`p-4 rounded-lg border-2 transition ${
                          billingType === 'ghl'
                            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-bold text-brand-light-text dark:text-white mb-1">I'll Bill Them (GHL)</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">You manage billing in GoHighLevel</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setBillingType('stripe')}
                        className={`p-4 rounded-lg border-2 transition ${
                          billingType === 'stripe'
                            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-bold text-brand-light-text dark:text-white mb-1">They Pay Direct (Stripe)</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Automatic Stripe subscription</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Plan Selection (only for standalone) */}
                {accountType === 'standalone' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Plan Tier
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setSelectedPlan('solo')}
                        className={`p-4 rounded-lg border-2 transition ${
                          selectedPlan === 'solo'
                            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-bold text-brand-light-text dark:text-white mb-1">Solo</p>
                          <p className="text-lg font-bold text-brand-blue">$39</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">1 user</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedPlan('team')}
                        className={`p-4 rounded-lg border-2 transition ${
                          selectedPlan === 'team'
                            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-bold text-brand-light-text dark:text-white mb-1">Team</p>
                          <p className="text-lg font-bold text-brand-blue">$149</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">5 users</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedPlan('elite')}
                        className={`p-4 rounded-lg border-2 transition ${
                          selectedPlan === 'elite'
                            ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-bold text-brand-light-text dark:text-white mb-1">Elite</p>
                          <p className="text-lg font-bold text-brand-blue">$399</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">10 users</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: User Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    User Details
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={giftedName}
                        onChange={(e) => setGiftedName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:border-blue-500 focus:ring-0 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={giftedEmail}
                        onChange={(e) => setGiftedEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:border-blue-500 focus:ring-0 transition"
                      />
                    </div>

                    {accountType === 'standalone' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={giftedCompanyName}
                          onChange={(e) => setGiftedCompanyName(e.target.value)}
                          placeholder="Acme Inc"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:border-blue-500 focus:ring-0 transition"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={giftedPassword}
                        onChange={(e) => setGiftedPassword(e.target.value)}
                        placeholder="Set their password"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:border-blue-500 focus:ring-0 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateGifted(false)}
                  disabled={createGiftedLoading}
                  className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGiftedAccount}
                  disabled={createGiftedLoading || !giftedEmail || !giftedName || !giftedPassword || (accountType === 'standalone' && !giftedCompanyName)}
                  className="flex-1 bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createGiftedLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowChangePassword(false)}>
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">Change Password</h3>
              
              <div className="space-y-4 mb-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:border-blue-500 focus:ring-0 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-brand-ink text-brand-light-text dark:text-white focus:border-blue-500 focus:ring-0 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowChangePassword(false)}
                  disabled={passwordLoading}
                  className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                  className="flex-1 bg-brand-blue text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
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
