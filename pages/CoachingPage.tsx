import React from 'react';
import { Quote, User } from '../types';
import QuotesCard from '../components/QuotesCard';
import BookRecommendationsCard from '../components/BookRecommendationsCard';
import SavedQuotesCard from '../components/SavedQuotesCard';
import BusinessMasteryKnowledgeBase from '../components/BusinessMasteryKnowledgeBase';

interface CoachingPageProps {
  user: User;
  savedQuotes?: Quote[];
  onSaveQuote?: (quote: Omit<Quote, 'id'>) => Promise<void>;
  onRemoveQuote?: (quoteId: string) => Promise<void>;
}

const CoachingPage: React.FC<CoachingPageProps> = ({ user, savedQuotes = [], onSaveQuote, onRemoveQuote }) => {

  // Safety check for user
  if (!user || !user.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSaveQuote = (quoteToSave: Omit<Quote, 'id'>) => {
    if (!savedQuotes.some(q => q.text === quoteToSave.text && q.author === quoteToSave.author)) {
      if (onSaveQuote) {
        onSaveQuote(quoteToSave);
      }
    } else {
      alert("This quote is already in your saved list.");
    }
  };

  // GHL Community Link - Massive Action Nation (Public Invite)
  const communityLink = "https://truexpanse.app.clientclub.net/communities/groups/massive-action-nation/home?invite=6942bb7b7b52699851bdbb0f";

  return (
    <div className="space-y-8">
      {/* Hero Section - Massive Action Coaching Strategies */}
      <div className="bg-gradient-to-br from-brand-blue via-blue-600 to-blue-800 dark:from-brand-blue dark:via-blue-700 dark:to-blue-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Massive Action Coaching Strategies
          </h1>
          <p className="text-xl md:text-2xl mb-2 text-blue-100">
            Exclusive Training from TrueXpanse
          </p>
          <p className="text-lg mb-8 text-blue-200">
            Maximize your MAT results with advanced coaching, video tutorials, and proven strategies
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">What's Inside:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎥</div>
                <div>
                  <p className="font-bold mb-1">Video Tutorials</p>
                  <p className="text-sm text-blue-100">Step-by-step MAT training</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📈</div>
                <div>
                  <p className="font-bold mb-1">Growth Strategies</p>
                  <p className="text-sm text-blue-100">Scale your sales results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">💪</div>
                <div>
                  <p className="font-bold mb-1">Advanced Tactics</p>
                  <p className="text-sm text-blue-100">Elite-level techniques</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={communityLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-red hover:bg-red-700 text-white font-black text-xl px-12 py-5 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Join the Community →
          </a>
          
          <p className="text-sm text-blue-200 mt-4">
            Access exclusive content and connect with other high-performers
          </p>
        </div>
      </div>

      {/* Secondary Content - Quotes and Books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <QuotesCard 
            onSaveQuote={handleSaveQuote}
            savedQuotes={savedQuotes}
          />
          <BusinessMasteryKnowledgeBase userId={user.id} />
        </div>
        
        <div className="lg:col-span-2 space-y-8">
          <SavedQuotesCard 
            savedQuotes={savedQuotes}
            onSaveQuote={handleSaveQuote}
            onRemoveQuote={onRemoveQuote}
          />
        </div>
      </div>
    </div>
  );
};

export default CoachingPage;
