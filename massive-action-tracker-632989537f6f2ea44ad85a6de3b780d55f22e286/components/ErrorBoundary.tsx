// components/ErrorBoundary.tsx
import React from 'react';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-ink flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-black text-brand-red mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-300 mb-8">
              Reloading the app for you...
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-lime text-black font-bold py-3 px-8 rounded-lg"
            >
              Reload Now
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
