// ConceptDetailModal.tsx
// Place this file in: /components/ConceptDetailModal.tsx

import React, { useState, useEffect } from 'react';
import { BusinessConcept } from '../types';
import { 
  getConceptNotes, 
  createConceptNote, 
  deleteConceptNote 
} from '../services/knowledgeBaseService';

interface ConceptDetailModalProps {
  concept: BusinessConcept;
  userId: string;
  onClose: () => void;
}

export default function ConceptDetailModal({ concept, userId, onClose }: ConceptDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content');
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  useEffect(() => {
    if (activeTab === 'notes') {
      loadNotes();
    }
  }, [activeTab]);

  async function loadNotes() {
    setIsLoadingNotes(true);
    try {
      const userNotes = await getConceptNotes(concept.id, userId);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;

    try {
      const note = await createConceptNote(concept.id, userId, newNote.trim());
      if (note) {
        setNotes([note, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to save note. Please try again.');
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm('Delete this note?')) return;

    try {
      const success = await deleteConceptNote(noteId);
      if (success) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {concept.title}
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="capitalize">{concept.category}</span>
                <span>•</span>
                <span className="capitalize">{concept.difficulty_level}</span>
                <span>•</span>
                <span>{concept.estimated_read_time} min read</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'content'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📖 Content
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 My Notes {notes.length > 0 && `(${notes.length})`}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'content' ? (
            <ConceptContent concept={concept} />
          ) : (
            <NotesTab
              notes={notes}
              newNote={newNote}
              setNewNote={setNewNote}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              isLoading={isLoadingNotes}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Concept Content Component
function ConceptContent({ concept }: { concept: BusinessConcept }) {
  return (
    <div className="space-y-6">
      {/* Definition */}
      {concept.definition && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📚 What It Is
          </h3>
          <p className="text-gray-700 leading-relaxed">{concept.definition}</p>
        </section>
      )}

      {/* Why It Matters */}
      {concept.why_it_matters && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            💡 Why It Matters
          </h3>
          <p className="text-gray-700 leading-relaxed">{concept.why_it_matters}</p>
        </section>
      )}

      {/* Key Principles */}
      {concept.key_principles && Array.isArray(concept.key_principles) && concept.key_principles.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🔑 Key Principles
          </h3>
          <div className="space-y-3">
            {concept.key_principles.map((principle: any, index: number) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {index + 1}. {principle.title}
                </h4>
                <p className="text-gray-700 text-sm">{principle.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Best Practices */}
      {concept.best_practices && Array.isArray(concept.best_practices) && concept.best_practices.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ✅ Best Practices
          </h3>
          <div className="space-y-3">
            {concept.best_practices.map((practice: any, index: number) => (
              <div key={index} className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {practice.title}
                </h4>
                <p className="text-gray-700 text-sm">{practice.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Common Mistakes */}
      {concept.common_mistakes && Array.isArray(concept.common_mistakes) && concept.common_mistakes.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            ⚠️ Common Mistakes
          </h3>
          <div className="space-y-3">
            {concept.common_mistakes.map((mistake: any, index: number) => (
              <div key={index} className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {mistake.title}
                </h4>
                <p className="text-gray-700 text-sm">{mistake.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Steps */}
      {concept.action_steps && Array.isArray(concept.action_steps) && concept.action_steps.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🎯 Action Steps
          </h3>
          <div className="space-y-2">
            {concept.action_steps.map((step: any, index: number) => (
              <div key={index} className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                  {step.step || index + 1}
                </span>
                <p className="text-gray-700 pt-1">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Expert Quotes */}
      {concept.expert_quotes && Array.isArray(concept.expert_quotes) && concept.expert_quotes.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            💬 Expert Quotes
          </h3>
          <div className="space-y-3">
            {concept.expert_quotes.map((quote: any, index: number) => (
              <blockquote key={index} className="border-l-4 border-blue-600 pl-4 italic text-gray-700">
                "{quote.text}"
                <footer className="text-sm text-gray-600 mt-1 not-italic">
                  — {quote.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Notes Tab Component
interface NotesTabProps {
  notes: any[];
  newNote: string;
  setNewNote: (value: string) => void;
  onAddNote: () => void;
  onDeleteNote: (noteId: string) => void;
  isLoading: boolean;
}

function NotesTab({ notes, newNote, setNewNote, onAddNote, onDeleteNote, isLoading }: NotesTabProps) {
  return (
    <div className="space-y-4">
      {/* Add Note */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Add a Note</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="What insights did you gain? What will you implement? What questions do you have?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
        <button
          onClick={onAddNote}
          disabled={!newNote.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Save Note
        </button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-200 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{note.note_text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-600">No notes yet. Add your first note above!</p>
        </div>
      )}
    </div>
  );
}
