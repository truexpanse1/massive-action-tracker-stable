
import React from 'react';

const SocialMediaActivityCard: React.FC = () => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-sm font-bold text-brand-red uppercase mb-2">Social Media Activity</h3>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">Your social media activity feed will be displayed here.</p>
        </div>
    );
};

export default SocialMediaActivityCard;