
import React from 'react';

const SocialMediaCard: React.FC = () => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">SOCIAL MEDIA POST IDEAS</h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">AI-generated social media post ideas will appear here.</p>
        </div>
    );
};

export default SocialMediaCard;