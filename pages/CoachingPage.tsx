import React, { useState, useEffect } from 'react';
import { Quote, User } from '../types';
import QuotesCard from '../components/QuotesCard';
import SavedQuotesCard from '../components/SavedQuotesCard';
import CoachingNotesJournal from '../components/CoachingNotesJournal';
import ManagerCoachingAssignments from '../components/ManagerCoachingAssignments';
import ClientAssignmentsView from '../components/ClientAssignmentsView';
import CoachTrackingDashboard from '../components/CoachTrackingDashboard';
import {
  CoachingNote,
  fetchCoachingNotes,
  createCoachingNote,
  updateCoachingNote,
  deleteCoachingNote,
} from '../src/services/coachingNotesService';

interface CoachingPageProps {
  userId: string;
  companyId: string;
  userRole: string; // 'Sales Rep', 'Manager', 'Admin'
  clients?: User[]; // For managers - list of their clients
  savedQuotes?: Quote[];
  onSaveQuote?: (quote: Omit<Quote, 'id'>) => Promise<void>;
  onRemoveQuote?: (quoteId: string) => Promise<void>;
  onAddToTargets?: (actionItem: string, startDate: string, days: number, source?: string) => Promise<void>;
}

const CoachingPage: React.FC<CoachingPageProps> = ({
  userId,
  companyId,
  userRole,
  clients = [],
  savedQuotes = [],
  onSaveQuote,
  onRemoveQuote,
  onAddToTargets,
}) => {
  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Fetch coaching notes on mount
  useEffect(() => {
    loadCoachingNotes();
  }, [userId]);

  const loadCoachingNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const notes = await fetchCoachingNotes(userId);
      setCoachingNotes(notes);
    } catch (error) {
      console.error('Error loading coaching notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleCreateNote = async (note: Omit<CoachingNote, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newNote = await createCoachingNote(note);
      setCoachingNotes([newNote, ...coachingNotes]);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<CoachingNote>) => {
    try {
      const updatedNote = await updateCoachingNote(id, updates);
      setCoachingNotes(coachingNotes.map(note => note.id === id ? updatedNote : note));
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteCoachingNote(id);
      setCoachingNotes(coachingNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const handleAddToTargets = async (actionItem: string, startDate: string, days: number, source?: string) => {
    if (onAddToTargets) {
      await onAddToTargets(actionItem, startDate, days, source);
    } else {
      // Fallback: just show a message
      alert(`Action item will be added to targets for ${days} ${days === 1 ? 'day' : 'days'} starting ${startDate}: ${actionItem}`);
    }
  };

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

  const isManager = userRole === 'Manager' || userRole === 'Admin';

  return (
    <div className="space-y-8">
      {/* Hero Section - More Concise */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 dark:from-purple-700 dark:via-purple-800 dark:to-purple-900 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Coaching & Learning Hub
          </h1>
          <p className="text-lg md:text-xl mb-2 text-purple-100">
            Learn. Document. Implement. Repeat.
          </p>
          <p className="text-base mb-6 text-purple-200">
            Track your coaching sessions, capture key insights, and convert learnings into action
          </p>
          
          <a
            href={communityLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-transparent border-2 border-white hover:bg-black text-white font-black text-lg px-8 py-3 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Join Community →
          </a>
        </div>
      </div>

      {/* Manager Coaching Assignments - Only for Managers/Admins */}
      {isManager && clients.length > 0 && (
        <>
          <CoachTrackingDashboard
            managerId={userId}
            companyId={companyId}
            clients={clients}
          />
          <ManagerCoachingAssignments
            managerId={userId}
            companyId={companyId}
            clients={clients}
          />
        </>
      )}

      {/* Client Assignments View - Only for Sales Reps */}
      {!isManager && (
        <ClientAssignmentsView 
          clientId={userId} 
          onAddToTargets={onAddToTargets}
        />
      )}

      {/* Coaching Notes Journal - Main Feature */}
      <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
            Coaching Notes & Journal
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Document your coaching sessions, capture key takeaways, and create action items for immediate implementation.
          </p>
        </div>

        {isLoadingNotes ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading notes...</p>
          </div>
        ) : (
          <CoachingNotesJournal
            userId={userId}
            companyId={companyId}
            notes={coachingNotes}
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onAddToTargets={handleAddToTargets}
          />
        )}
      </div>

      {/* Resources Grid - Quotes Only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Daily Inspiration */}
        <div>
          <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">Daily Inspiration</h3>
          <QuotesCard 
            onSaveQuote={handleSaveQuote}
            savedQuotes={savedQuotes}
          />
        </div>
        
        {/* Right Column - Saved Quotes */}
        <div>
          <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">Saved Quotes</h3>
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
