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
  const [selectedTab, setSelectedTab] = useState<'notes' | 'assignments'>('notes');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isManager = userRole === 'Manager' || userRole === 'Admin';
  const isTeamMember = clients && clients.length > 0;

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

  // Client View - Minimal Powerful Layout
  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Two Column Layout: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Calendar */}
            <div className="bg-white dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                Calendar
              </h3>
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Date().getDate()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  All Dates
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-4">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* New Note Button */}
            <button
              onClick={() => setSelectedTab('notes')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg"
            >
              + New Coaching Note
            </button>

            {/* Tab Selector */}
            <div className="bg-white dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-2 flex gap-2">
              <button
                onClick={() => setSelectedTab('notes')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                  selectedTab === 'notes'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setSelectedTab('assignments')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition ${
                  selectedTab === 'assignments'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Assignments
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedTab === 'notes' ? (
              // Coaching Notes View
              <div className="bg-white dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {isTeamMember ? 'Coaching Notes & Assignments' : 'Coaching Notes & Journal'}
                </h2>
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
            ) : (
              // Assignments View
              <div className="bg-white dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Assignments & Tracking
                </h2>
                <ClientAssignmentsView
                  clientId={userId}
                  companyId={companyId}
                  onAddToTargets={onAddToTargets}
                />
              </div>
            )}
          </div>
        </div>

        {/* Resources Grid - Below Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
    </div>
  );
};

export default CoachingPage;
