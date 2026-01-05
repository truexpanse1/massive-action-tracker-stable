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
  userRole: string;
  clients?: User[];
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
  const [showAssignments, setShowAssignments] = useState(false);

  const isManager = userRole === 'Manager' || userRole === 'Admin';

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
      alert(`Action item will be added to targets for ${days} ${days === 1 ? 'day' : 'days'} starting ${startDate}: ${actionItem}`);
    }
  };

  const handleSaveToJournal = async (noteData: any) => {
    try {
      // Create a new coaching note from the completed assignment
      await handleCreateNote({
        user_id: userId,
        company_id: companyId,
        session_date: noteData.session_date,
        title: noteData.title,
        topic_focus: noteData.topic_focus || 'From Coach Assignment',
        key_takeaways: noteData.key_takeaways,
        action_items: noteData.action_items || [],
        tags: noteData.tags || [],
      });
    } catch (error) {
      console.error('Error saving to journal:', error);
      throw error;
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

  // Manager View
  if (isManager) {
    return (
      <div className="space-y-8">
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
        <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
              Coaching Notes & Journal
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Document your coaching sessions and capture key takeaways.
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
      </div>
    );
  }

  // Client View - Simple & Powerful
  return (
    <div className="space-y-8">
      {/* Main Content Area */}
      {!showAssignments ? (
        // Coaching Notes View
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
            <>
              <CoachingNotesJournal
                userId={userId}
                companyId={companyId}
                notes={coachingNotes}
                onCreateNote={handleCreateNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onAddToTargets={handleAddToTargets}
              />
              
              {/* View Assignments Button */}
              <div className="mt-6 pt-6 border-t border-brand-light-border dark:border-brand-gray">
                <button
                  onClick={() => setShowAssignments(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg"
                >
                  📋 View Assignments
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        // Assignments View
        <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
                Assignments & Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View your pending, in-progress, and completed assignments.
              </p>
            </div>
            <button
              onClick={() => setShowAssignments(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              ← Back to Notes
            </button>
          </div>

          <ClientAssignmentsView
            clientId={userId}
            companyId={companyId}
            onAddToTargets={onAddToTargets}
            onSaveToJournal={handleSaveToJournal}
          />
        </div>
      )}

      {/* Resources Grid - Below Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">Daily Inspiration</h3>
          <QuotesCard
            onSaveQuote={handleSaveQuote}
            savedQuotes={savedQuotes}
          />
        </div>
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
