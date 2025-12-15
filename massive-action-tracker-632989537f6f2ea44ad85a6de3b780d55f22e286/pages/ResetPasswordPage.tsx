import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash
    // We just need to check if we have a session after it processes
    const checkAuth = async () => {
      try {
        // Wait a moment for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to verify reset link. Please try again.');
          setIsLoading(false);
          return;
        }

        if (session) {
          setHasValidToken(true);
          setIsLoading(false);
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('An error occurred. Please try again.');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-lime mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink">
        <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-lime mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your password has been updated. Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !hasValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink p-4">
        <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-brand-lime text-black font-bold py-3 px-8 rounded-lg hover:bg-green-400 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink p-4">
      <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-brand-lime mb-3">Reset Your Password</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-brand-lime transition"
              >
                {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md focus:outline-none focus:ring-2 focus:ring-brand-lime pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-brand-lime transition"
              >
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-500 text-sm font-medium text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-lime text-black font-bold py-4 rounded-lg hover:bg-green-400 transition disabled:opacity-70"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-brand-lime hover:underline text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
