import React, { useState, useEffect } from 'react';
import { getQuotesForPerson } from '../services/geminiService';
import { Quote } from '../types';

interface QuotesCardProps {
    onSaveQuote: (quote: Omit<Quote, 'id'>) => void;
    savedQuotes: Quote[];
}

const businessMasterminds = ['Tony Robbins', 'Jim Rohn', 'Zig Ziglar', 'Brian Tracy', 'Napoleon Hill'];
const sportsCoaches = ['John Wooden', 'Phil Jackson', 'Nick Saban'];

const QuotesCard: React.FC<QuotesCardProps> = ({ onSaveQuote, savedQuotes }) => {
    const [selectedPerson, setSelectedPerson] = useState('Tony Robbins');
    const [customPerson, setCustomPerson] = useState('');
    const [quotes, setQuotes] = useState<Omit<Quote, 'id'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const savedQuoteTexts = new Set(savedQuotes.map(q => q.text));

    const fetchQuotes = async (name: string) => {
        if (!name) return;
        setIsLoading(true);
        setError(null);
        setQuotes([]);
        try {
            const fetchedQuotes = await getQuotesForPerson(name);
            setQuotes(fetchedQuotes);
        } catch (err) {
            setError('Failed to fetch quotes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchQuotes(selectedPerson);
    }, [selectedPerson]);
    
    const handleCustomPersonSearch = () => {
        setSelectedPerson(''); // Deselect from dropdown
        fetchQuotes(customPerson);
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCustomPersonSearch();
        }
    };

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">WORDS OF WISDOM</h3>
            <div className="space-y-4">
                {/* Predefined Select */}
                <div>
                    <label htmlFor="quote-select" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Select an Influencer</label>
                    <select
                        id="quote-select"
                        value={selectedPerson}
                        onChange={e => {
                            setCustomPerson('');
                            setSelectedPerson(e.target.value);
                        }}
                        className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                        <option value="" disabled>-- Select --</option>
                        <optgroup label="Business Masterminds">
                            {businessMasterminds.map(name => <option key={name} value={name}>{name}</option>)}
                        </optgroup>
                        <optgroup label="Legendary Coaches">
                            {sportsCoaches.map(name => <option key={name} value={name}>{name}</option>)}
                        </optgroup>
                    </select>
                </div>

                {/* Custom Search */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={customPerson}
                        onChange={e => setCustomPerson(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Or type an influencer's name..."
                        className="flex-grow bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid"
                    />
                    <button onClick={handleCustomPersonSearch} className="text-xs bg-brand-blue text-white font-bold py-1 px-3 rounded-md hover:bg-blue-700 transition">
                        Find
                    </button>
                </div>
                
                {/* Quotes Display */}
                <div className="p-2 bg-brand-light-bg dark:bg-brand-gray/50 rounded-lg min-h-[250px] max-h-[400px] overflow-y-auto flex flex-col">
                    {isLoading && (
                        <div className="flex-grow flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="flex-grow flex justify-center items-center text-red-500 text-sm">{error}</div>
                    )}
                    {!isLoading && !error && quotes.length > 0 && (
                        <div className="space-y-4">
                            {quotes.map((quote, index) => (
                                <div key={index} className="p-3 border-b border-brand-light-border dark:border-brand-gray last:border-b-0">
                                    <blockquote className="flex items-start gap-2">
                                        <div className="flex-grow">
                                            <p className="italic text-sm text-brand-light-text dark:text-gray-300">"{quote.text}"</p>
                                            <cite className="block text-right not-italic mt-1 font-semibold text-xs text-gray-500 dark:text-gray-400">- {quote.author}</cite>
                                        </div>
                                         <button 
                                            onClick={() => onSaveQuote(quote)}
                                            disabled={savedQuoteTexts.has(quote.text)}
                                            className="p-1 rounded-full text-gray-400 disabled:text-brand-lime disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-brand-gray"
                                            title={savedQuoteTexts.has(quote.text) ? "Saved" : "Save Quote"}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" />
                                            </svg>
                                        </button>
                                    </blockquote>
                                </div>
                            ))}
                        </div>
                    )}
                     {!isLoading && !error && quotes.length === 0 && (
                         <div className="flex-grow flex justify-center items-center text-gray-500 text-sm">Select or search for an influencer to see their quotes.</div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default QuotesCard;