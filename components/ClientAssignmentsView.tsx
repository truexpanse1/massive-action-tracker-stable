import React, { useState, useEffect } from 'react';
import {
  CoachingAssignment,
  CoachingSharedNote,
  fetchClientAssignments,
  fetchClientSharedNotes,
  updateAssignmentStatus,
  markNoteAsRead,
} from '../services/coachingAssignmentsService';

interface ClientAssignmentsViewProps {
  clientId: string;
  onAddToTargets?: (actionItem: string, startDate: string, days: number, source?: string) => Promise<void>;
}

const ClientAssignmentsView: React.FC<ClientAssignmentsViewProps> = ({ clientId, onAddToTargets }) => {
  const [assignments, setAssignments] = useState<CoachingAssignment[]>([]);
  const [sharedNotes, setSharedNotes] = useState<CoachingSharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<CoachingAssignment | null>(null);
  const [completionNote, setCompletionNote] = useState('');

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
      console.error('Error loading client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (noteId: string) => {
    try {
      await markNoteAsRead(noteId);
      setSharedNotes(sharedNotes.map(note => 
        note.id === noteId ? { ...note, is_read: true, read_at: new Date().toISOString() } : note
      ));
    } catch (error) {
      console.error('Error marking note as read:', error);
    }
  };

  const handleAddToTargets = async (assignment: CoachingAssignment) => {
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
      alert('✅ Added to your Implement Now targets!');
    } catch (error) {
      console.error('Error adding to targets:', error);
      alert('Failed to add to targets');
    }
  };

  const handleMarkComplete = async (assignmentId: string) => {
    try {
      await updateAssignmentStatus(assignmentId, 'completed', completionNote || undefined);
      await loadData();
      setSelectedAssignment(null);
      setCompletionNote('');
      alert('✅ Assignment marked as complete!');
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  const unreadNotes = sharedNotes.filter(note => !note.is_read);
  const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading your assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unread Coaching Notes */}
      {unreadNotes.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-700">
          <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
            📝 New Coaching Notes from Your Coach
          </h3>
          <div className="space-y-3">
            {unreadNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{note.title}</h4>
                  <button
                    onClick={() => handleMarkAsRead(note.id)}
                    className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
                  >
                    Mark as Read
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending/In Progress Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Your Action Items
          </h3>
          <div className="space-y-3">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`p-4 rounded-lg border-2 ${
                  isOverdue(assignment.due_date, assignment.status)
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h4>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.description}</p>
                    )}
                  </div>
                  {isOverdue(assignment.due_date, assignment.status) && (
                    <span className="ml-4 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                      OVERDUE
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getPriorityColor(assignment.priority)}`}>
                    {assignment.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  {assignment.status === 'pending' && (
                    <button
                      onClick={() => handleAddToTargets(assignment)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm shadow-lg"
                    >
                      ➕ Add to Targets
                    </button>
                  )}
                  {assignment.status === 'in_progress' && (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                      ✓ Mark Complete
                    </button>
                  )}
                </div>
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

      {/* Completion Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-brand-navy rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Mark as Complete
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>{selectedAssignment.title}</strong>
            </p>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Add a note for your coach (optional):
            </label>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="What did you accomplish? Any challenges?"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setCompletionNote('');
                }}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkComplete(selectedAssignment.id)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAssignmentsView;
