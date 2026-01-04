import React, { useState, useEffect } from 'react';
import {
  CoachingAssignment,
  CoachingSharedNote,
  fetchClientAssignmentsByManager,
  createAssignment,
  createSharedNote,
  deleteAssignment,
  updateAssignment,
  getClientCompletionStats,
} from '../services/coachingAssignmentsService';
import { User } from '../types';

interface ManagerCoachingAssignmentsProps {
  managerId: string;
  companyId: string;
  clients: User[]; // List of clients (Sales Reps) in the company
}

const ManagerCoachingAssignments: React.FC<ManagerCoachingAssignmentsProps> = ({
  managerId,
  companyId,
  clients,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [assignments, setAssignments] = useState<CoachingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [completionStats, setCompletionStats] = useState<any>(null);

  // Assignment form state
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  // Note form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
  });

  // Load assignments when client is selected
  useEffect(() => {
    if (selectedClientId) {
      loadClientData();
    } else {
      setAssignments([]);
      setCompletionStats(null);
    }
  }, [selectedClientId]);

  const loadClientData = async () => {
    if (!selectedClientId) return;

    setIsLoading(true);
    try {
      const [assignmentsData, statsData] = await Promise.all([
        fetchClientAssignmentsByManager(managerId, selectedClientId),
        getClientCompletionStats(selectedClientId),
      ]);
      setAssignments(assignmentsData);
      setCompletionStats(statsData);
    } catch (error) {
      console.error('Error loading client data:', error);
      alert('Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      alert('Please select a client first');
      return;
    }

    if (!newAssignment.title || !newAssignment.due_date) {
      alert('Please fill in title and due date');
      return;
    }

    try {
      await createAssignment({
        company_id: companyId,
        manager_id: managerId,
        client_id: selectedClientId,
        title: newAssignment.title,
        description: newAssignment.description || null,
        due_date: newAssignment.due_date,
        priority: newAssignment.priority,
      });

      // Reset form
      setNewAssignment({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
      });
      setShowAssignmentForm(false);

      // Reload data
      await loadClientData();
      alert('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      alert('Please select a client first');
      return;
    }

    if (!newNote.title || !newNote.content) {
      alert('Please fill in title and content');
      return;
    }

    try {
      await createSharedNote({
        company_id: companyId,
        manager_id: managerId,
        client_id: selectedClientId,
        title: newNote.title,
        content: newNote.content,
      });

      // Reset form
      setNewNote({
        title: '',
        content: '',
      });
      setShowNoteForm(false);

      alert('Note shared with client successfully!');
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to share note');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await deleteAssignment(assignmentId);
      await loadClientData();
      alert('Assignment deleted');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
        <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">
          🎯 Coach Your Clients
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select a client to assign action items, share coaching notes, and track their progress.
        </p>

        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Select a Client --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
      </div>

      {/* Client Selected - Show Actions */}
      {selectedClientId && selectedClient && (
        <>
          {/* Completion Stats */}
          {completionStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completionStats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{completionStats.completed}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{completionStats.in_progress}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">In Progress</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{completionStats.pending}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{completionStats.overdue}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Overdue</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {showAssignmentForm ? '✕ Cancel' : '+ Assign Action Item'}
            </button>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {showNoteForm ? '✕ Cancel' : '📝 Share Coaching Note'}
            </button>
          </div>

          {/* Assignment Form */}
          {showAssignmentForm && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Create Assignment for {selectedClient.name}
              </h4>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="e.g., Call 50 prospects this week"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    placeholder="Additional details or instructions..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newAssignment.priority}
                      onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Create Assignment
                </button>
              </form>
            </div>
          )}

          {/* Note Form */}
          {showNoteForm && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Share Note with {selectedClient.name}
              </h4>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="e.g., Week 1 Coaching Notes"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Your coaching notes, feedback, or guidance..."
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Share Note
                </button>
              </form>
            </div>
          )}

          {/* Assignments List */}
          <div className="bg-white dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Assignments for {selectedClient.name}
            </h4>

            {isLoading ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
            ) : assignments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No assignments yet. Create one above!
              </p>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h5>
                        {assignment.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                        {assignment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    {assignment.completion_note && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">Client Note:</p>
                        <p className="text-sm text-green-700 dark:text-green-400">{assignment.completion_note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerCoachingAssignments;
