import React, { useState, useMemo } from 'react';
import Calendar from './Calendar';
import AddToTargetsModal from './AddToTargetsModal';
import { CoachingNote, ActionItem } from '../src/services/coachingNotesService';

interface CoachingNotesJournalProps {
  userId: string;
  companyId: string;
  notes: CoachingNote[];
  onCreateNote: (note: Omit<CoachingNote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateNote: (id: string, updates: Partial<CoachingNote>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onAddToTargets: (actionItem: string, noteDate: string, days: number, source?: string) => Promise<void>;
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
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  
  // Modal state for Add to Targets
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState<{ text: string; noteDate: string; source?: string } | null>(null);
  const [bulkActionItems, setBulkActionItems] = useState<{ items: ActionItem[]; noteDate: string; source?: string } | null>(null);

  // Form state
  const [source, setSource] = useState('');
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
    setSource(note.topic_focus || '');
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
    setSource('');
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
    if (newActionItem.trim()) {
      setActionItems([...actionItems, { text: newActionItem, completed: false }]);
      setNewActionItem('');
    }
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
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Handle Add to Targets click
  const handleAddToTargetsClick = (item: ActionItem, noteDate: string, source?: string) => {
    setSelectedActionItem({ text: item.text, noteDate, source });
    setIsModalOpen(true);
  };

  // Handle Add All to Targets click
  const handleAddAllToTargetsClick = (items: ActionItem[], noteDate: string, source?: string) => {
    setBulkActionItems({ items, noteDate, source });
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedActionItem(null);
    setBulkActionItems(null);
  };

  // Handle modal submit
  const handleModalSubmit = async (days: number) => {
    try {
      if (selectedActionItem) {
        await onAddToTargets(selectedActionItem.text, selectedActionItem.noteDate, days, selectedActionItem.source);
        // Mark as added in the database
        const note = notes.find(n => n.session_date === selectedActionItem.noteDate);
        if (note) {
          const itemIndex = note.action_items.findIndex(item => item.text === selectedActionItem.text);
          if (itemIndex !== -1) {
            const { markActionItemAddedToTargets } = await import('../src/services/coachingNotesService');
            await markActionItemAddedToTargets(note.id, itemIndex);
            // Update local state
            const updatedActionItems = [...note.action_items];
            updatedActionItems[itemIndex] = { ...updatedActionItems[itemIndex], added_to_targets: true };
            await onUpdateNote(note.id, { action_items: updatedActionItems });
          }
        }
      } else if (bulkActionItems) {
        const note = notes.find(n => n.session_date === bulkActionItems.noteDate);
        if (note) {
          const { markActionItemAddedToTargets } = await import('../src/services/coachingNotesService');
          for (let i = 0; i < bulkActionItems.items.length; i++) {
            const item = bulkActionItems.items[i];
            if (!item.added_to_targets) {
              await onAddToTargets(item.text, bulkActionItems.noteDate, days, bulkActionItems.source);
              // Mark as added in the database
              const itemIndex = note.action_items.findIndex(ai => ai.text === item.text);
              if (itemIndex !== -1) {
                await markActionItemAddedToTargets(note.id, itemIndex);
              }
            }
          }
          // Reload the note to get updated flags
          const updatedActionItems = note.action_items.map(item => {
            const wasAdded = bulkActionItems.items.find(bi => bi.text === item.text && !bi.added_to_targets);
            return wasAdded ? { ...item, added_to_targets: true } : item;
          });
          await onUpdateNote(note.id, { action_items: updatedActionItems });
        }
      }
      handleModalClose();
    } catch (error) {
      console.error('Error adding to targets:', error);
      alert('Failed to add to targets');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Left Sidebar - Calendar */}
        <div className="w-80 flex-shrink-0">
          <Calendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            datesWithActivity={datesWithNotes}
          />

          {/* Search Notes */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-brand-light-border dark:border-brand-gray bg-white dark:bg-brand-navy text-brand-light-text dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* New Coaching Note Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full mt-6 bg-brand-lime text-brand-ink font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition"
          >
            + New Coaching Note
          </button>
        </div>

        {/* Right Content - Notes or Form */}
        <div className="flex-1">
          {isEditing ? (
            /* Form */
            <div className="bg-brand-light-card dark:bg-brand-navy p-8 rounded-lg border-2 border-brand-light-border dark:border-brand-gray">
              <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-6">
                {editingNoteId ? 'Edit Coaching Note' : 'Create New Coaching Note'}
              </h2>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sales Pitch Workshop"
                  className="w-full px-4 py-2 rounded-lg border-2 border-brand-light-border dark:border-brand-gray bg-white dark:bg-gray-800 text-brand-light-text dark:text-white placeholder-gray-500"
                />
              </div>

              {/* Topic Focus */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Topic Focus
                </label>
                <input
                  type="text"
                  value={topicFocus}
                  onChange={(e) => setTopicFocus(e.target.value)}
                  placeholder="e.g., Sales Techniques"
                  className="w-full px-4 py-2 rounded-lg border-2 border-brand-light-border dark:border-brand-gray bg-white dark:bg-gray-800 text-brand-light-text dark:text-white placeholder-gray-500"
                />
              </div>

              {/* Key Takeaways */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Key Takeaways *
                </label>
                <textarea
                  value={keyTakeaways}
                  onChange={(e) => setKeyTakeaways(e.target.value)}
                  placeholder="Document the main insights from this coaching session..."
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border-2 border-brand-light-border dark:border-brand-gray bg-white dark:bg-gray-800 text-brand-light-text dark:text-white placeholder-gray-500 resize-none"
                />
              </div>

              {/* Action Items */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Action Items
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newActionItem}
                    onChange={(e) => setNewActionItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddActionItem()}
                    placeholder="Add an action item..."
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-brand-light-border dark:border-brand-gray bg-white dark:bg-gray-800 text-brand-light-text dark:text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleAddActionItem}
                    className="bg-brand-blue text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                <ul className="space-y-2">
                  {actionItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleActionItem(index)}
                        className="w-4 h-4"
                      />
                      <span className={item.completed ? 'line-through text-gray-500' : 'text-brand-light-text dark:text-white'}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleRemoveActionItem(index)}
                        className="ml-auto text-brand-red hover:text-red-700 text-sm font-bold"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-brand-light-border dark:border-brand-gray bg-white dark:bg-gray-800 text-brand-light-text dark:text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-brand-blue text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-brand-blue text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-200 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 bg-brand-lime text-brand-ink font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-400 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
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
                    className="bg-brand-light-card dark:bg-brand-navy rounded-lg border border-brand-light-border dark:border-brand-gray overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start p-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-1">
                          {note.title}
                        </h3>
                        {note.topic_focus && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {note.topic_focus.includes('Coach') ? '📌 From Coach' : `Source: ${note.topic_focus}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(note.session_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedNotes(prev => prev.includes(note.id) ? prev.filter(id => id !== note.id) : [...prev, note.id])}
                          className="text-brand-blue hover:text-blue-700 text-sm font-bold"
                          title={expandedNotes.includes(note.id) ? 'Shrink' : 'Expand'}
                        >
                          {expandedNotes.includes(note.id) ? '🔽 Shrink' : '▶️ Expand'}
                        </button>
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

                    {/* Expanded Content */}
                    {expandedNotes.includes(note.id) && (
                      <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 border-t border-brand-light-border dark:border-brand-gray p-6 space-y-4">
                        {/* Key Takeaways */}
                        <div>
                          <h4 className="text-sm font-bold text-brand-light-text dark:text-white mb-2">
                            Key Takeaways:
                          </h4>
                          <p className="text-brand-light-text dark:text-gray-300 whitespace-pre-wrap text-sm">
                            {note.key_takeaways}
                          </p>
                        </div>

                        {/* Action Items */}
                        {note.action_items && note.action_items.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-brand-light-text dark:text-white">
                                Action Items:
                              </h4>
                              {note.action_items.some(item => !item.added_to_targets) && (
                                <button
                                  onClick={() => handleAddAllToTargetsClick(note.action_items, note.session_date, note.topic_focus)}
                                  className="text-xs bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition font-bold shadow-md"
                                >
                                  Add All to Targets
                                </button>
                              )}
                            </div>
                            <ul className="space-y-2">
                              {note.action_items.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-sm">
                                  <span className={item.completed ? 'text-gray-500 line-through' : 'text-brand-light-text dark:text-gray-300'}>
                                    • {item.text}
                                  </span>
                                  {!item.added_to_targets && (
                                    <button
                                      onClick={() => handleAddToTargetsClick(item, note.session_date, note.topic_focus)}
                                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition font-bold shadow-md"
                                    >
                                      Add to Targets
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-brand-blue text-white px-3 py-1 rounded-full text-xs font-bold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add to Targets Modal */}
      {isModalOpen && (
        <AddToTargetsModal
          actionItem={selectedActionItem?.text || ''}
          bulkActionItems={bulkActionItems?.items || []}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default CoachingNotesJournal;
