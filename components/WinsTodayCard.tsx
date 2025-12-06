import React from 'react';

interface WinsTodayCardProps {
    wins: string[];
}

const WinsTodayCard: React.FC<WinsTodayCardProps> = ({ wins = [] }) => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-sm font-bold text-brand-red uppercase mb-2">Wins Today</h3>
            <div className="bg-brand-light-bg dark:bg-brand-gray/20 rounded p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                {wins.length > 0 ? (
                    <ul className="space-y-2">
                        {wins.map((win, index) => (
                            <li key={index} className="flex items-start text-sm text-brand-light-text dark:text-gray-300">
                                <span className="text-brand-lime mr-2 mt-1 flex-shrink-0">✓</span>
                                <span>{win}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your wins for today will appear here!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WinsTodayCard;