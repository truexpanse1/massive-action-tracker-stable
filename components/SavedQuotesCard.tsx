import React, { useState } from 'react';
import { Quote } from '../types';

interface SavedQuotesCardProps {
    savedQuotes: Quote[];
    onSaveQuote: (quote: Omit<Quote, 'id'>) => void;
    onRemoveQuote: (quoteId: string) => void;
}

const SavedQuotesCard: React.FC<SavedQuotesCardProps> = ({ savedQuotes, onSaveQuote, onRemoveQuote }) => {
    const [customQuote, setCustomQuote] = useState('');
    const [customAuthor, setCustomAuthor] = useState('');
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editAuthor, setEditAuthor] = useState('');

    const handleAddCustomQuote = () => {
        if (customQuote.trim() && customAuthor.trim()) {
            onSaveQuote({ text: customQuote, author: customAuthor });
            setCustomQuote('');
            setCustomAuthor('');
        } else {
            alert('Please fill in both the quote and the author.');
        }
    };
    
    const handleShareViaEmail = (quote: Quote) => {
        const subject = encodeURIComponent(`An inspiring quote from ${quote.author}`);
        const body = encodeURIComponent(`"${quote.text}"\n\n- ${quote.author}`);
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        
        // Open mailto link directly (no target=_blank for mailto)
        window.location.href = mailtoLink;
    };

    const handleStartEdit = (quote: Quote) => {
        setEditingQuoteId(quote.id);
        setEditText(quote.text);
        setEditAuthor(quote.author);
    };

    const handleSaveEdit = (quoteId: string) => {
        if (editText.trim() && editAuthor.trim()) {
            // Remove old quote and add updated one
            onRemoveQuote(quoteId);
            onSaveQuote({ text: editText, author: editAuthor });
            setEditingQuoteId(null);
            setEditText('');
            setEditAuthor('');
        } else {
            alert('Please fill in both the quote and the author.');
        }
    };

    const handleCancelEdit = () => {
        setEditingQuoteId(null);
        setEditText('');
        setEditAuthor('');
    };

    const sortedQuotes = [...savedQuotes].sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime());

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">MY SAVED QUOTES</h3>
            
            {/* Add Custom Quote Form */}
            <div className="mb-6 p-4 bg-brand-light-bg dark:bg-brand-gray/20 rounded-lg">
                <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Add a Custom Quote</h4>
                <div className="space-y-2">
                    <textarea value={customQuote} onChange={e => setCustomQuote(e.target.value)} placeholder="The quote that inspired you..." rows={2} className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray p-1 focus:outline-none focus:border-brand-blue dark:text-white" />
                    <input type="text" placeholder="Author or Source" value={customAuthor} onChange={e => setCustomAuthor(e.target.value)} className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray p-1 focus:outline-none focus:border-brand-blue dark:text-white" />
                    <button onClick={handleAddCustomQuote} className="w-full bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm">Save My Quote</button>
                </div>
            </div>

            {/* Display Saved Quotes */}
            {savedQuotes.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {sortedQuotes.map(quote => (
                        <div key={quote.id} className="bg-brand-light-bg dark:bg-brand-gray/50 p-4 rounded-md flex flex-col justify-between shadow-sm">
                            {editingQuoteId === quote.id ? (
                                // Edit Mode
                                <div className="space-y-2">
                                    <textarea 
                                        value={editText} 
                                        onChange={e => setEditText(e.target.value)} 
                                        rows={3}
                                        className="w-full bg-white dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray p-2 rounded focus:outline-none focus:border-brand-blue dark:text-white text-sm"
                                    />
                                    <input 
                                        type="text" 
                                        value={editAuthor} 
                                        onChange={e => setEditAuthor(e.target.value)}
                                        className="w-full bg-white dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray p-2 rounded focus:outline-none focus:border-brand-blue dark:text-white text-sm"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={handleCancelEdit} className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500">
                                            Cancel
                                        </button>
                                        <button onClick={() => handleSaveEdit(quote.id)} className="px-3 py-1 text-sm bg-brand-lime text-brand-ink font-bold rounded hover:bg-green-400">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <blockquote className="flex-grow">
                                        <p className="italic text-sm text-brand-light-text dark:text-gray-300">"{quote.text}"</p>
                                        <cite className="block text-right not-italic mt-2 font-semibold text-xs text-gray-500 dark:text-gray-400">- {quote.author}</cite>
                                    </blockquote>
                                    <div className="flex justify-end items-center mt-3 pt-2 border-t border-brand-light-border dark:border-brand-gray">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleShareViaEmail(quote)} className="p-1 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors" title="Share via Email">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </button>
                                            <button onClick={() => handleStartEdit(quote)} className="p-1 rounded-full text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors" title="Edit Quote">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => onRemoveQuote(quote.id)} className="p-1 rounded-full text-red-500 hover:bg-red-500/10" title="Remove Quote">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Your saved quotes will appear here. Click the bookmark icon on a quote to save it.</p>
            )}
        </div>
    );
};

export default SavedQuotesCard;