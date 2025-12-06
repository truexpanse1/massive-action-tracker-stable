import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  isAlert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, isAlert = false }) => {
  return (
    <div
      className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${
        isAlert
          ? 'bg-red-100 border-l-4 border-red-500 dark:bg-red-900/30 dark:border-red-700'
          : 'bg-white dark:bg-brand-ink-light border border-gray-200 dark:border-brand-gray'
      }`}
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p
        className={`mt-1 text-3xl font-bold ${
          isAlert ? 'text-red-600 dark:text-red-400' : 'text-brand-ink dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default StatCard;
