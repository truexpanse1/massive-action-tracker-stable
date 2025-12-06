import React from 'react';

const FoundersCornerCard: React.FC = () => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">FOUNDER'S CORNER</h3>
            <div className="text-center">
                <p className="italic text-brand-light-text dark:text-gray-300">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
                <p className="font-semibold text-sm text-gray-500 dark:text-gray-400 mt-1">- Winston Churchill (via Founder)</p>
            </div>
        </div>
    );
};

export default FoundersCornerCard;