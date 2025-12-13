import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Clear pending user data from localStorage
    localStorage.removeItem('pendingUserData');

    // Set success status after a short delay
    setTimeout(() => {
      setStatus('success');
    }, 2000);

    // Redirect to login after 5 seconds
    setTimeout(() => {
      navigate('/');
    }, 5000);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h1>
            <p className="text-gray-600">Please wait while we set up your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Please check your email to verify your account.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
              </p>
              <ol className="text-sm text-blue-700 text-left mt-2 space-y-1">
                <li>1. Check your email inbox</li>
                <li>2. Click the verification link</li>
                <li>3. Return to login page</li>
                <li>4. Sign in with your credentials</li>
              </ol>
            </div>
            <p className="text-sm text-gray-500">Redirecting to login page in 5 seconds...</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Go to Login Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please contact support.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
