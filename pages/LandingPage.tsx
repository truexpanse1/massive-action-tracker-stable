import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { startStripeCheckout } from '../services/billingService';

// Stripe Price IDs - Update these with your actual price IDs
const SOLO_PRICE_ID = 'price_1SVlc7AF9E77pmGU1ZadSw1A';   // $39 Solo Closer
const TEAM_PRICE_ID = 'price_1SVIo3AF9E77pmGUWmOiZw0';   // $149 Team Engine
const ELITE_PRICE_ID = 'price_1SVIo3AF9E77pmGUVxM0u4z1'; // $399 Elite / Company plan

interface PlanInfo {
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
}

const PLANS: Record<string, PlanInfo> = {
  solo: {
    name: 'Solo Closer',
    price: 39,
    priceId: SOLO_PRICE_ID,
    description: 'Perfect for the individual who wants to track their own massive action.',
    features: [
      '1 User Account',
      'Lead Converter (Excel/CSV + Google Maps)',
      'Move to Next Day (never lose a lead)',
      'Flame Button (instant hot lead promotion)',
      '6 Activity Tracking Codes',
      'Massive Action Targets Calculator',
      'EOD Report with Full KPIs',
      'Revenue Tracking (New vs Recurring)',
      'Hot Leads Pipeline Management',
      'Performance Dashboard',
      'Month View Calendar',
      'AI Content Generator',
      'AI Image Creator',
      'Dream Client Studio'
    ],
  },
  team: {
    name: 'Team Engine',
    price: 149,
    priceId: TEAM_PRICE_ID,
    description: 'For small teams ready to scale their results and track team performance.',
    features: [
      'Up to 5 User Accounts',
      'All Solo Closer Features',
      'Team Leaderboards & Rankings',
      'Manager Dashboard',
      'Team Control Panel',
      'Shared Prospecting Lists',
      'Team Performance Comparison',
      'Coaching Notes & Feedback',
      'Multi-User Analytics'
    ],
  },
  elite: {
    name: 'Elite / Company',
    price: 399,
    priceId: ELITE_PRICE_ID,
    description: 'The ultimate solution for large organizations needing full visibility and control.',
    features: [
      'Up to 10 User Accounts',
      'All Solo Closer Features',
      'Team Leaderboards & Rankings',
      'Manager Dashboard',
      'Team Control Panel',
      'Shared Prospecting Lists',
      'Team Performance Comparison',
      'Coaching Notes & Feedback',
      'Multi-User Analytics'
    ],
  },
};

interface PurchaseFormData {
  email: string;
  fullName: string;
  company: string;
  phone: string;
  password: string;
}

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [purchaseData, setPurchaseData] = useState<PurchaseFormData>({
    email: '',
    fullName: '',
    company: '',
    phone: '',
    password: '',
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPurchasePassword, setShowPurchasePassword] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginError('');
  };

  const openPurchaseModal = (plan: PlanInfo) => {
    setSelectedPlan(plan);
    setIsPurchaseModalOpen(true);
    setPurchaseError('');
  };
  const closePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedPlan(null);
    setPurchaseError('');
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handlePurchaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPurchaseData({ ...purchaseData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      closeLoginModal();
    }
    setIsLoggingIn(false);
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setResetMessage('');
    setIsLoggingIn(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setResetMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    }

    setIsLoggingIn(false);
  };

  const handlePurchaseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsProcessingPurchase(true);
    setPurchaseError('');

    try {
      // Store user data in localStorage for webhook to retrieve after payment
      const pendingUserData = {
        email: purchaseData.email,
        password: purchaseData.password,
        fullName: purchaseData.fullName,
        company: purchaseData.company,
        phone: purchaseData.phone,
        planName: selectedPlan.name,
        priceId: selectedPlan.priceId,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('pendingUserData', JSON.stringify(pendingUserData));

      // Redirect to Stripe Checkout
      // After successful payment, webhook will create the account
      await startStripeCheckout(selectedPlan.priceId, purchaseData.email, {
        fullName: purchaseData.fullName,
        company: purchaseData.company,
        phone: purchaseData.phone,
        password: purchaseData.password,
        planName: selectedPlan.name,
      });

      // The function above redirects the browser, so the code below is unreachable.
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError('Unable to start checkout. Please try again.');
      setIsProcessingPurchase(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================ */}
      {/* LOGIN MODAL */}
      {/* ============================================ */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-3xl font-black mb-6 text-gray-900">Welcome Back</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                />
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? (
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

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-lg bg-blue-600 hover:bg-blue-700 transition ${
                    isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ============================================ */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black mb-4 text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mb-6 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgotPassword}>
              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              {resetMessage && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-4">
                  <p className="text-sm text-green-700">{resetMessage}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                    setLoginError('');
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-lg bg-blue-600 hover:bg-blue-700 transition ${
                    isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoggingIn ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* PURCHASE MODAL */}
      {/* ============================================ */}
      {isPurchaseModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900">{selectedPlan.name}</h2>
              <p className="text-xl text-gray-600">${selectedPlan.price}/month</p>
            </div>
            <form onSubmit={handlePurchaseSubmit}>
              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={purchaseData.email}
                  onChange={handlePurchaseChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={purchaseData.fullName}
                  onChange={handlePurchaseChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={purchaseData.company}
                  onChange={handlePurchaseChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={purchaseData.phone}
                  onChange={handlePurchaseChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                />
                <div className="relative">
                  <input
                    type={showPurchasePassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password *"
                    value={purchaseData.password}
                    onChange={handlePurchaseChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPurchasePassword(!showPurchasePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPurchasePassword ? (
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

              {purchaseError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                  <p className="text-sm text-red-700">{purchaseError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closePurchaseModal}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPurchase}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-lg bg-blue-600 hover:bg-blue-700 transition ${
                    isProcessingPurchase ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessingPurchase ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-3">
                You'll be redirected to Stripe to securely complete your payment.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900">
            TRUE<span className="text-red-600">X</span>PANSE
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <a
              href="/learning"
              className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm md:text-base transition whitespace-nowrap"
            >
              🎯 MAT Wisdom
            </a>
            <button
              onClick={openLoginModal}
              className="px-6 md:px-8 py-2 md:py-3 rounded-full border-2 border-gray-400 hover:border-gray-600 font-semibold text-sm md:text-base transition text-gray-900 whitespace-nowrap"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="pt-20 md:pt-32 pb-24 md:pb-40 text-center px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight mb-8 text-gray-900">
            The daily system<br />
            that turns <span className="text-blue-600">Massive Action</span><br />
            into real results.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-12">
            10 years in the making. Built by closers who know: action is everything.<br />
            Massive Action Tracker helps you do the right things every day — so you win more.
          </p>
          <button
            onClick={() => openPurchaseModal(PLANS.team)}
            className="px-8 md:px-16 py-4 md:py-6 rounded-full bg-blue-600 text-xl md:text-2xl font-black text-white shadow-xl hover:bg-blue-700 transition"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-20 md:space-y-32">
          {/* Feature 1: EOD Report */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/uGojrZQFwEYwfaXX.jpg"
              alt="End of Day Report"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Your Daily Win Report
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                See everything you did today in one simple report. It tracks every call, text, and win. You will know exactly what works to make you win more. You can even look back at any day you want!
              </p>
            </div>
          </div>

          {/* Feature 2: Revenue Center */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Know Your Money Flow
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                See your money grow in real-time! Find out which products sell the best and when. You can change the dates to see trends and know what to sell next. This helps you sell smarter, not just harder.
              </p>
            </div>
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/HAJnAsRVWQxIpIei.jpg"
              alt="Revenue Center"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
          </div>

          {/* Feature 3: New Clients List */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/TKIMNfRJfmBDifrH.jpg"
              alt="New Clients List"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Meet Your New Clients Page
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                See all your new clients on one simple page. This is a list of every client your team has closed. You can see the exact day they became a paying client. It’s the perfect way to celebrate and keep track of your wins!
              </p>
            </div>
          </div>

          {/* Feature 4: Performance Dashboard */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                The Power Dashboard
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                This special chart helps managers see how their team is doing. Pick any five numbers, like "money made" and "meetings set," to see how they work together. This shows you the clear path to making more money.
              </p>
            </div>
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/PRyIpAjeiuhiPTeR.jpg"
              alt="Performance Dashboard"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
          </div>

          {/* Feature 5: Prospecting List */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/FkVOuvmuxkkghaMP.jpg"
              alt="Prospecting List"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Build Your Money Pipeline
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                This is where you build your future money. Every time you click a button here, it saves the data forever. This helps you build a strong list of future customers that will bring in steady money. It's simple: track your work, and the money will follow.
              </p>
            </div>
          </div>

          {/* Feature 6: AI Image Generation */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Create Like a Pro — Instantly
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                Quickly make great images for social media, emails, and flyers. This tool is in the Marketing section. It helps you make eye-catching posts fast, so you can spend more time selling and less time designing.
              </p>
            </div>
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/ixKXRwlQLvplwOFZ.jpg"
              alt="AI Image Generation"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* COMMUNITY SECTION */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Level Up with Massive Action Coaching Strategies
          </h2>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Exclusive Training from TrueXpanse
          </p>
          <p className="text-lg md:text-xl mb-12 text-blue-200 max-w-3xl mx-auto">
            Join our community to access advanced video tutorials, proven growth strategies, and elite-level coaching that will maximize your MAT results.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🎬</div>
              <h3 className="text-xl font-bold mb-2">Video Tutorials</h3>
              <p className="text-blue-100">Step-by-step training on mastering the MAT system</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-xl font-bold mb-2">Growth Strategies</h3>
              <p className="text-blue-100">Proven tactics to scale your sales results</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="text-xl font-bold mb-2">Advanced Coaching</h3>
              <p className="text-blue-100">Elite-level techniques from TrueXpanse</p>
            </div>
          </div>

          <a
            href="https://truexpanse.app.clientclub.net/communities/groups/massive-action-nation/home?invite=6942bb7b7b52699851bdbb0f"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-12 py-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Join the Community →
          </a>
          <p className="text-sm text-blue-200 mt-4">
            Connect with other high-performers and accelerate your success
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRICING SECTION */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-16 text-gray-900">
            Choose Your Plan
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Solo Plan */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-gray-200 hover:border-blue-400 transition flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-gray-900">
                {PLANS.solo.name}
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                {PLANS.solo.description}
              </p>
              <div className="text-4xl md:text-5xl font-black mb-8 text-gray-900">
                ${PLANS.solo.price}
                <span className="text-xl font-medium text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-10 flex-grow">
                {PLANS.solo.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openPurchaseModal(PLANS.solo)}
                className="mt-auto py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Team Plan (Highlighted) */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-4 border-blue-600 shadow-2xl flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-gray-900">
                {PLANS.team.name}
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                {PLANS.team.description}
              </p>
              <div className="text-4xl md:text-5xl font-black mb-8 text-gray-900">
                ${PLANS.team.price}
                <span className="text-xl font-medium text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-10 flex-grow">
                {PLANS.team.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openPurchaseModal(PLANS.team)}
                className="mt-auto py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Elite Plan */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-gray-200 hover:border-blue-400 transition flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-gray-900">
                {PLANS.elite.name}
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                {PLANS.elite.description}
              </p>
              <div className="text-4xl md:text-5xl font-black mb-8 text-gray-900">
                ${PLANS.elite.price}
                <span className="text-xl font-medium text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-10 flex-grow">
                {PLANS.elite.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openPurchaseModal(PLANS.elite)}
                className="mt-auto py-4 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-12 md:py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} TRUEXPANS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
