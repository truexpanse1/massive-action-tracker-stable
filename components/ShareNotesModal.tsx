import React, { useState, useMemo } from 'react';
import { CoachingNote } from '../src/services/coachingNotesService';
import { User } from '../types';
import { createSharedNote } from '../services/coachingAssignmentsService';

interface ShareNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachingNotes: CoachingNote[];
  clients: User[];
  managerId: string;
  companyId: string;
  onSuccess?: () => void;
}

const ShareNotesModal: React.FC<ShareNotesModalProps> = ({
  isOpen,
  onClose,
  coachingNotes,
  clients,
  managerId,
  companyId,
  onSuccess,
}) => {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Filter notes based on search
  const filteredNotes = useMemo(() => {
    return coachingNotes.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.key_takeaways?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.source?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coachingNotes, searchTerm]);

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    );
  };

  const selectAllNotes = () => {
    if (selectedNotes.length === filteredNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(filteredNotes.map((note) => note.id));
    }
  };

  const handleShare = async () => {
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }

    if (selectedNotes.length === 0) {
      alert('Please select at least one note to share');
      return;
    }

    setIsSharing(true);
    try {
      const client = clients.find((c) => c.id === selectedClient);
      if (!client) {
        alert('Client not found');
        return;
      }

      // Share each selected note
      const sharePromises = selectedNotes.map((noteId) => {
        const note = coachingNotes.find((n) => n.id === noteId);
        if (!note) return Promise.resolve();

        return createSharedNote({
          company_id: companyId,
          manager_id: managerId,
          client_id: selectedClient,
          title: note.title,
          content: `${note.key_takeaways || ''}\n\nSource: ${note.source || 'Coaching Session'}\nDate: ${new Date(note.session_date).toLocaleDateString()}`,
        });
      });

      await Promise.all(sharePromises);

      alert(`✅ Shared ${selectedNotes.length} note(s) with ${client.name}!`);
      
      // Reset form
      setSelectedNotes([]);
      setSelectedClient('');
      setSearchTerm('');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error sharing notes:', error);
      alert('Failed to share notes');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-brand-navy rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            📤 Share Coaching Notes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Client Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              👥 Select Client *
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:border-purple-500 dark:focus:border-purple-400 transition"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            {selectedClient && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Sharing with:
                </p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {clients.find((c) => c.id === selectedClient)?.name}
                </p>
              </div>
            )}
          </div>

          {/* Right: Note Selection */}
          <div className="col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                📝 Select Notes to Share
              </label>

              {/* Search Bar */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes by title, content, or source..."
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 focus:border-purple-500 dark:focus:border-purple-400 transition"
              />

              {/* Select All Button */}
              <button
                onClick={selectAllNotes}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline mb-3"
              >
                {selectedNotes.length === filteredNotes.length && filteredNotes.length > 0
                  ? '✓ Deselect All'
                  : '☐ Select All'}
              </button>

              {/* Notes List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No notes found. Create some coaching notes first!
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <label
                      key={note.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                        selectedNotes.includes(note.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note.id)}
                        onChange={() => toggleNoteSelection(note.id)}
                        className="w-5 h-5 mt-1 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {note.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {note.key_takeaways || note.topic_focus || 'No content'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(note.session_date).toLocaleDateString()}</span>
                          {note.source && (
                            <>
                              <span>•</span>
                              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {note.source}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Selected Count */}
            {selectedNotes.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  ✓ {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedClient || selectedNotes.length === 0 || isSharing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-lg"
          >
            {isSharing ? '⏳ Sharing...' : `📤 Share ${selectedNotes.length} Note${selectedNotes.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareNotesModal;
