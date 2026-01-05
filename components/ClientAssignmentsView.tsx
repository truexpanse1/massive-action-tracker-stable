import React, { useState, useEffect } from 'react';
import {
  CoachingAssignment,
  CoachingSharedNote,
  fetchClientAssignments,
  fetchClientSharedNotes,
  updateAssignmentStatus,
  markNoteAsRead,
} from '../services/coachingAssignmentsService';
import CompletedAssignmentsDropdown from './CompletedAssignmentsDropdown';
import AssignmentDetailPopup from './AssignmentDetailPopup';

interface ClientAssignmentsViewProps {
  clientId: string;
  companyId: string;
  onAddToTargets?: (
    title: string,
    startDate: string,
    days: number,
    source: string
  ) => Promise<void>;
  onSaveToJournal?: (note: any) => Promise<void>;
}

const ClientAssignmentsView: React.FC<ClientAssignmentsViewProps> = ({
  clientId,
  companyId,
  onAddToTargets,
  onSaveToJournal,
}) => {
  const [assignments, setAssignments] = useState<CoachingAssignment[]>([]);
  const [sharedNotes, setSharedNotes] = useState<CoachingSharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<CoachingAssignment | null>(null);
  const [selectedCompletedAssignment, setSelectedCompletedAssignment] = useState<CoachingAssignment | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [reflection, setReflection] = useState('');
  const [saveToJournal, setSaveToJournal] = useState(true);
  const [difficulty, setDifficulty] = useState(3);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, notesData] = await Promise.all([
        fetchClientAssignments(clientId),
        fetchClientSharedNotes(clientId),
      ]);
      setAssignments(assignmentsData);
      setSharedNotes(notesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkNoteAsRead = async (noteId: string) => {
    try {
      await markNoteAsRead(noteId);
      await loadData();
    } catch (error) {
      console.error('Error marking note as read:', error);
    }
  };

  const handleAddToTargets = async (assignment: CoachingAssignment, saveToNotes: boolean = false) => {
    if (!onAddToTargets) {
      alert('Add to Targets feature not available');
      return;
    }

    try {
      // Calculate days until due date
      const today = new Date();
      const dueDate = new Date(assignment.due_date);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const days = Math.max(1, daysDiff); // At least 1 day

      // Add to targets
      await onAddToTargets(
        assignment.title,
        today.toISOString().split('T')[0],
        days,
        `Coach Assignment (${assignment.priority} priority)`
      );

      // Update status to in_progress
      await updateAssignmentStatus(assignment.id, 'in_progress');
      await loadData();
      
      let message = '✅ Added to your Implement Now targets!';
      if (saveToNotes) {
        message += ' Content saved to your coaching notes.';
      }
      alert(message);
    } catch (error) {
      console.error('Error adding to targets:', error);
      alert('Failed to add to targets');
    }
  };

  const handleMarkComplete = async (assignmentId: string, saveToNotes: boolean = false) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      // Mark assignment as complete
      await updateAssignmentStatus(assignmentId, 'completed', completionNote || undefined);
      
      // Save to coaching notes if requested
      if (saveToNotes && reflection) {
        // Create action item from the original assignment
        const actionItems = assignment.description ? [{
          text: assignment.description,
          completed: true
        }] : [];
        
        // Prepare the note data
        const noteData = {
          session_date: new Date().toISOString().split('T')[0],
          source: 'Coach Assignment',
          title: `[Completed] ${assignment.title}`,
          topic_focus: `Difficulty: ${['Easy', 'Fair', 'Medium', 'Hard', 'Very Hard'][difficulty - 1]}`,
          key_takeaways: reflection,
          action_items: actionItems,
          tags: ['completed-assignment', assignment.priority]
        };
        
        console.log('Saving to journal:', noteData);
        // Call onSaveToJournal callback if provided
        if (onSaveToJournal) {
          await onSaveToJournal(noteData);
        }
      }
      
      await loadData();
      setSelectedAssignment(null);
      setCompletionNote('');
      setReflection('');
      setSaveToJournal(true);
      setDifficulty(3);
      
      const message = saveToNotes 
        ? '✅ Assignment completed and saved to your Coaching Notes!'
        : '✅ Assignment marked as complete!';
      alert(message);
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment');
    }
  };

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const inProgressAssignments = assignments.filter((a) => a.status === 'in_progress');
  const completedAssignments = assignments.filter((a) => a.status === 'completed');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completed Assignments Dropdown */}
      <CompletedAssignmentsDropdown
        assignments={assignments}
        onSelectAssignment={setSelectedCompletedAssignment}
      />

      {/* Completed Assignment Detail Popup */}
      {selectedCompletedAssignment && (
        <AssignmentDetailPopup
          assignment={selectedCompletedAssignment}
          onClose={() => setSelectedCompletedAssignment(null)}
          onSaveAsNote={async (noteData) => {
            if (onSaveToJournal) {
              try {
                await onSaveToJournal({
                  session_date: new Date().toISOString().split('T')[0],
                  title: noteData.title,
                  topic_focus: noteData.source,
                  key_takeaways: noteData.keyTakeaways,
                  action_items: noteData.actionItems.map((item: string) => ({
                    text: item,
                    completed: true,
                    added_to_targets: false
                  })),
                  tags: ['completed-assignment', 'from-coach']
                });
              } catch (error) {
                console.error('Error saving to journal:', error);
                throw error;
              }
            }
          }}
          onAddToTargets={async (assignment) => {
            await handleAddToTargets(assignment, false);
          }}
        />
      )}
      {/* Shared Notes from Coach */}
      {sharedNotes.length > 0 && (
        <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📬 Notes from Your Coach
          </h3>
          <div className="space-y-3">
            {sharedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border-2 ${
                  note.is_read
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{note.title}</h4>
                  {!note.is_read && (
                    <button
                      onClick={() => handleMarkNoteAsRead(note.id)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full transition"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 New Assignments from Your Coach
          </h3>
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {assignment.title}
                    </h4>
                    {assignment.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        {assignment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-1 rounded-full font-semibold ${
                        assignment.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        assignment.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {assignment.priority.toUpperCase()}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToTargets(assignment, false)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm shadow-lg"
                  >
                    ➕ Add to Targets
                  </button>
                  <button
                    onClick={() => handleAddToTargets(assignment, true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                  >
                    ➕ Add to Targets + Save to Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Assignments */}
      {inProgressAssignments.length > 0 && (
        <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🔄 In Progress
          </h3>
          <div className="space-y-3">
            {inProgressAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  ✓ Mark Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Completed Assignments
          </h3>
          <div className="space-y-2">
            {completedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h4>
                    {assignment.completion_note && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Note: {assignment.completion_note}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 ml-4">
                    {assignment.completed_at && new Date(assignment.completed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assignments */}
      {assignments.length === 0 && sharedNotes.length === 0 && (
        <div className="bg-white dark:bg-brand-navy p-12 rounded-lg border border-brand-light-border dark:border-brand-gray text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No assignments or notes from your coach yet.
          </p>
        </div>
      )}

      {/* Enhanced Completion Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-brand-navy rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ✅ Complete Assignment
              </h3>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setCompletionNote('');
                  setReflection('');
                  setSaveToJournal(true);
                  setDifficulty(3);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Assignment Details */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {selectedAssignment.title}
              </h4>
              {selectedAssignment.description && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {selectedAssignment.description}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
              </div>
            </div>

            {/* Reflection Section */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                💭 Reflection: What did you learn? How did it go?
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your insights, challenges, and key takeaways..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 transition"
              />
            </div>

            {/* Difficulty Rating */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                📊 How challenging was this? (Optional)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 1, label: '😊 Easy' },
                  { value: 2, label: '🙂 Fair' },
                  { value: 3, label: '😐 Medium' },
                  { value: 4, label: '😓 Hard' },
                  { value: 5, label: '🔥 Very Hard' }
                ].map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => setDifficulty(rating.value)}
                    className={`py-2 px-1 rounded-lg font-semibold text-xs transition ${
                      difficulty === rating.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rating.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Completion Note (for coach) */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                📝 Note for your coach (Optional)
              </label>
              <textarea
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="Any questions or feedback for your coach?"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 transition"
              />
            </div>

            {/* Save to Journal Checkbox */}
            <label className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
              <input
                type="checkbox"
                checked={saveToJournal}
                onChange={(e) => setSaveToJournal(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="font-bold text-gray-900 dark:text-white text-sm">
                  💾 Save to my Coaching Notes & Journal
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Keep a record of this assignment and your reflection for future reference
                </div>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleMarkComplete(selectedAssignment.id, saveToJournal)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-lg transition shadow-lg"
              >
                {saveToJournal ? '✅ Complete & Save to Notes' : '✅ Mark Complete'}
              </button>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setCompletionNote('');
                  setReflection('');
                  setSaveToJournal(true);
                  setDifficulty(3);
                }}
                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAssignmentsView;
