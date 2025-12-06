import React, { useState, useEffect } from 'react';
import { AIChallengeData } from '../types';
import { getDailyQuote } from '../services/geminiService';

interface AIChallengeCardProps {
    data: AIChallengeData;
    isLoading: boolean;
    onAcceptChallenge: () => void;
}

const AIChallengeCard: React.FC<AIChallengeCardProps> = ({ data, isLoading, onAcceptChallenge }) => {
    const [isQuoteLoading, setIsQuoteLoading] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            if (!data?.quote) {
                setIsQuoteLoading(true);
                try {
                    // This function is defined in geminiService.ts and fetches a quote
                    const newQuote = await getDailyQuote(); 
                    // This is a placeholder for a state update function that needs to be passed down
                    // For now, we'll just log it. A parent component should handle this state.
                } catch (error) {
                    console.error("Failed to fetch quote:", error);
                } finally {
                    setIsQuoteLoading(false);
                }
            }
        };
        // fetchQuote(); // This would need a proper state management passed in
    }, [data?.quote]);
    
    // Fallback quote if fetching fails or is disabled
    const displayQuote = data?.quote || { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' };

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray relative">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">DAILY AI CHALLENGE</h3>
            
            {isQuoteLoading ? (
                <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
                </div>
            ) : (
                <>
                    <div className="mb-4 text-center">
                        <p className="italic text-brand-light-text dark:text-gray-300">"{displayQuote.text}"</p>
                        <p className="font-semibold text-sm text-gray-500 dark:text-gray-400 mt-1">- {displayQuote.author}</p>
                    </div>

                    {!data?.challengesAccepted ? (
                        <div className="text-center">
                            <p className="mb-3 font-semibold text-brand-light-text dark:text-white">Are you ready to take massive action today?</p>
                            <button
                                onClick={onAcceptChallenge}
                                disabled={isLoading}
                                className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition w-full disabled:bg-brand-gray"
                            >
                                {isLoading ? 'Generating...' : 'Challenge Accepted'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-brand-light-bg dark:bg-brand-gray/20 rounded-lg">
                           <p className="font-bold text-brand-lime">Challenge Accepted!</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Your new targets have been added to the "Today's Top 6 Targets" list.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AIChallengeCard;
