import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-10 rounded-lg border border-brand-light-border dark:border-brand-gray text-center min-h-[50vh] flex flex-col justify-center items-center">
      <h1 className="text-4xl font-black tracking-wider text-brand-light-text dark:text-white mb-4 uppercase">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400">This feature is currently under construction. Check back soon!</p>
    </div>
  );
};

export default PlaceholderPage;