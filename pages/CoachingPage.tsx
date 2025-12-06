import React from 'react';
import { Quote } from '../types';
import QuotesCard from '../components/QuotesCard';
import BookRecommendationsCard from '../components/BookRecommendationsCard';
import SavedQuotesCard from '../components/SavedQuotesCard';

interface CoachingPageProps {
  savedQuotes: Quote[];
  onSaveQuote: (quote: Omit<Quote, 'id'>) => Promise<void>;
  onRemoveQuote: (quoteId: string) => Promise<void>;
}

const CoachingPage: React.FC<CoachingPageProps> = ({ savedQuotes, onSaveQuote, onRemoveQuote }) => {

  const handleSaveQuote = (quoteToSave: Omit<Quote, 'id'>) => {
    if (!savedQuotes.some(q => q.text === quoteToSave.text && q.author === quoteToSave.author)) {
      onSaveQuote(quoteToSave);
    } else {
      alert("This quote is already in your saved list.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <QuotesCard 
              onSaveQuote={handleSaveQuote}
              savedQuotes={savedQuotes}
            />
            <BookRecommendationsCard />
        </div>
        
        <div className="lg:col-span-2 space-y-8">
             <SavedQuotesCard 
              savedQuotes={savedQuotes}
              onSaveQuote={handleSaveQuote}
              onRemoveQuote={onRemoveQuote}
            />
        </div>
    </div>
  );
};

export default CoachingPage;