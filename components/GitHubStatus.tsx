import React from 'react';

const GitHubStatus: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 ml-4" title="Application Status">
      <div className="w-2.5 h-2.5 bg-brand-lime rounded-full animate-pulse"></div>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status: Live</span>
    </div>
  );
};

export default GitHubStatus;
