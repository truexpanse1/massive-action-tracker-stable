import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './Calendar';
import { CoachingNote, ActionItem } from '../src/services/coachingNotesService';

interface CoachingNotesJournalProps {
  userId: string;
  companyId: string;
  notes: CoachingNote[];
  onCreateNote: (note: Omit<CoachingNote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateNote: (id: string, updates: Partial<CoachingNote>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onAddToTargets: (actionItem: string, noteDate: string) => Promise<void>;
}

const CoachingNotesJournal: React.FC<CoachingNotesJournalProps> = ({
  userId,
  companyId,
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onAddToTargets,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [topicFocus, setTopicFocus] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionItem, setNewActionItem] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Get dates with notes for calendar highlighting
  const datesWithNotes = useMemo(() => {
    return notes.map(note => note.session_date);
  }, [notes]);

  // Filter notes by selected date or search term
  const filteredNotes = useMemo(() => {
    if (searchTerm) {
      return notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.topic_focus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.key_takeaways.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    return notes.filter(note => note.session_date === dateStr);
  }, [notes, selectedDate, searchTerm]);

  // Load note for editing
  const handleEditNote = (note: CoachingNote) => {
    setIsEditing(true);
    setEditingNoteId(note.id);
    setTitle(note.title);
    setTopicFocus(note.topic_focus || '');
    setKeyTakeaways(note.key_takeaways);
    setActionItems(note.action_items || []);
    setTags(note.tags || []);
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditingNoteId(null);
    setTitle('');
    setTopicFocus('');
    setKeyTakeaways('');
    setActionItems([]);
    setNewActionItem('');
    setTags([]);
    setNewTag('');
  };

  // Save note (create or update)
  const handleSaveNote = async () => {
    if (!title || !keyTakeaways) {
      alert('Please fill in Title and Key Takeaways');
      return;
    }

    const noteData = {
      user_id: userId,
      company_id: companyId,
      session_date: selectedDate.toISOString().split('T')[0],
      title,
      topic_focus: topicFocus,
      key_takeaways: keyTakeaways,
      action_items: actionItems,
      tags,
      resources: [],
    };

    try {
      if (editingNoteId) {
        await onUpdateNote(editingNoteId, noteData);
      } else {
        await onCreateNote(noteData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  // Add action item
  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, { text: newActionItem, completed: false, added_to_targets: false }]);
    setNewActionItem('');
  };

  // Remove action item
  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  // Toggle action item completion
  const handleToggleActionItem = (index: number) => {
    const updated = [...actionItems];
    updated[index].completed = !updated[index].completed;
    setActionItems(updated);
  };

  // Add tag
  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Add action item to daily targets
  const handleAddToTargets = async (actionItem: ActionItem, noteDate: string) => {
    try {
      await onAddToTargets(actionItem.text, noteDate);
      alert('Action item added to daily targets!');
    } catch (error) {
      console.error('Error adding to targets:', error);
      alert('Failed to add to targets');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar - Calendar & Search */}
      <div className="lg:col-span-3 space-y-6">
        <Calendar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          datesWithActivity={datesWithNotes}
        />

        {/* Search Bar */}
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">Search Notes</h3>
          <input
            type="text"
            placeholder="Search by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm text-brand-blue hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* New Note Button */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-brand-lime text-brand-ink font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition"
          >
            + New Coaching Note
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
        {isEditing ? (
          /* Note Editor */
          <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                {editingNoteId ? 'Edit Coaching Note' : 'New Coaching Note'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cold Calling Mastery Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white"
                />
              </div>

              {/* Topic/Focus */}
              <div>
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Topic / Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g., Objection Handling, Follow-up Strategies"
                  value={topicFocus}
                  onChange={(e) => setTopicFocus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white"
                />
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Key Insights & Takeaways *
                </label>
                <textarea
                  placeholder="What did you learn? What insights stood out? What strategies will you implement?"
                  value={keyTakeaways}
                  onChange={(e) => setKeyTakeaways(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white resize-none"
                />
              </div>

              {/* Action Items */}
              <div>
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Action Items (Speed of Implementation!)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add an action item..."
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem()}
                    className="flex-1 px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white"
                  />
                  <button
                    onClick={handleAddActionItem}
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                {actionItems.length > 0 && (
                  <ul className="space-y-2">
                    {actionItems.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-brand-ink p-2 rounded">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleActionItem(index)}
                          className="w-4 h-4"
                        />
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-brand-light-text dark:text-white'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleRemoveActionItem(index)}
                          className="text-brand-red hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add a tag (e.g., Sales, Mindset)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 bg-white dark:bg-brand-ink border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-brand-blue text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-brand-red"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 bg-brand-lime text-brand-ink font-bold py-3 px-6 rounded-lg hover:bg-green-400 transition"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white hover:bg-gray-100 dark:hover:bg-brand-gray transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Notes List */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
                {searchTerm ? `Search Results (${filteredNotes.length})` : `Notes for ${selectedDate.toLocaleDateString()}`}
              </h2>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="bg-brand-light-card dark:bg-brand-navy p-12 rounded-lg border border-brand-light-border dark:border-brand-gray text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {searchTerm ? 'No notes found matching your search.' : 'No coaching notes for this date.'}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-brand-lime text-brand-ink font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition"
                >
                  + Create First Note
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-1">
                        {note.title}
                      </h3>
                      {note.topic_focus && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Focus: {note.topic_focus}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(note.session_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-brand-blue hover:text-blue-700 text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this note?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="text-brand-red hover:text-red-700 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-brand-light-text dark:text-white mb-2">
                      Key Takeaways:
                    </h4>
                    <p className="text-brand-light-text dark:text-gray-300 whitespace-pre-wrap">
                      {note.key_takeaways}
                    </p>
                  </div>

                  {/* Action Items */}
                  {note.action_items && note.action_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-brand-light-text dark:text-white mb-2">
                        Action Items:
                      </h4>
                      <ul className="space-y-2">
                        {note.action_items.map((item, index) => (
                          <li key={index} className="flex items-center gap-3 text-sm">
                            <span className={item.completed ? 'text-gray-500 line-through' : 'text-brand-light-text dark:text-gray-300'}>
                              • {item.text}
                            </span>
                            {!item.added_to_targets && (
                              <button
                                onClick={() => handleAddToTargets(item, note.session_date)}
                                className="text-xs bg-brand-blue text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                              >
                                Add to Targets
                              </button>
                            )}
                            {item.added_to_targets && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                ✓ Added
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 dark:bg-brand-gray text-brand-light-text dark:text-white px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachingNotesJournal;
