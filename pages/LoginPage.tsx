// components/LoginPage.tsx   (or wherever it lives)
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LoginPageProps {
  onClose: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      onClose(); // Close modal on successful login
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetMessage('Password reset email sent! Check your inbox.');
    }

    setIsLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-8 w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-brand-lime mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-400">
            Log in to your paid MAT account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="you@domain.com"
              className="w-full px-4 py-3 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-brand-lime"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <p className="text-brand-red text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-lime text-black font-bold py-4 rounded-lg hover:bg-green-400 transition disabled:opacity-70"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-brand-lime hover:text-green-400 text-sm font-medium"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForgotPassword(false)}>
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-brand-lime mb-4">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-3 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime"
                  />
                </div>
                {error && <p className="text-brand-red text-sm">{error}</p>}
                {resetMessage && <p className="text-green-500 text-sm">{resetMessage}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-brand-lime text-black font-bold py-3 rounded-lg hover:bg-green-400 transition disabled:opacity-70"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LOCKDOWN MESSAGE + WORKING BUTTON */}
        <div className="mt-10 text-center p-6 bg-brand-red/10 rounded-lg border border-brand-red/30">
          <p className="text-brand-red font-bold text-lg mb-2">
            Free Sign-Ups Disabled
          </p>
          <p className="text-gray-300 text-sm mb-4">
            All new accounts require a paid 7-day trial with card upfront.
          </p>

          {/* THIS BUTTON NOW WORKS PERFECTLY */}
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              onClose(); // ← closes modal
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth' }); // ← smooth scroll to pricing
            }}
            className="inline-block bg-brand-lime text-black font-bold py-3 px-8 rounded-lg hover:scale-105 transition cursor-pointer"
          >
            Start Your 7-Day Trial
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
