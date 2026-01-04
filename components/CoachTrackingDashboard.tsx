import React, { useState, useEffect } from 'react';
import {
  CoachingAssignment,
  fetchManagerAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../services/coachingAssignmentsService';
import { User } from '../types';

interface CoachTrackingDashboardProps {
  managerId: string;
  companyId: string;
  clients: User[];
}

interface AssignmentGroup {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignments: CoachingAssignment[];
}

const CoachTrackingDashboard: React.FC<CoachTrackingDashboardProps> = ({
  managerId,
  companyId,
  clients,
}) => {
  const [allAssignments, setAllAssignments] = useState<CoachingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkAssignForm, setShowBulkAssignForm] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Bulk assignment form
  const [bulkAssignment, setBulkAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  useEffect(() => {
    loadAllAssignments();
  }, [managerId]);

  const loadAllAssignments = async () => {
    setIsLoading(true);
    try {
      const assignments = await fetchManagerAssignments(managerId);
      setAllAssignments(assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group assignments by title (same assignment to multiple clients)
  const groupedAssignments: AssignmentGroup[] = [];
  const titleMap = new Map<string, CoachingAssignment[]>();

  allAssignments.forEach((assignment) => {
    const key = assignment.title;
    if (!titleMap.has(key)) {
      titleMap.set(key, []);
    }
    titleMap.get(key)!.push(assignment);
  });

  titleMap.forEach((assignments, title) => {
    groupedAssignments.push({
      title,
      description: assignments[0].description || '',
      priority: assignments[0].priority,
      assignments,
    });
  });

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedClients.length === 0) {
      alert('Please select at least one client');
      return;
    }

    if (!bulkAssignment.title || !bulkAssignment.due_date) {
      alert('Please fill in title and due date');
      return;
    }

    try {
      // Create assignment for each selected client
      const promises = selectedClients.map((clientId) =>
        createAssignment({
          company_id: companyId,
          manager_id: managerId,
          client_id: clientId,
          title: bulkAssignment.title,
          description: bulkAssignment.description || null,
          due_date: bulkAssignment.due_date,
          priority: bulkAssignment.priority,
        })
      );

      await Promise.all(promises);

      // Reset form
      setBulkAssignment({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
      });
      setSelectedClients([]);
      setShowBulkAssignForm(false);

      await loadAllAssignments();
      alert(`✅ Assignment created for ${selectedClients.length} client(s)!`);
    } catch (error) {
      console.error('Error creating bulk assignment:', error);
      alert('Failed to create assignments');
    }
  };

  const handleManualComplete = async (assignmentId: string) => {
    if (!confirm('Mark this assignment as completed (manually)?')) {
      return;
    }

    try {
      await updateAssignment(assignmentId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_note: 'Marked complete by coach during session',
      });
      await loadAllAssignments();
      alert('✅ Marked as complete');
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment?')) {
      return;
    }

    try {
      await deleteAssignment(assignmentId);
      await loadAllAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

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

  // Calculate overall stats
  const totalAssignments = allAssignments.length;
  const completedCount = allAssignments.filter((a) => a.status === 'completed').length;
  const inProgressCount = allAssignments.filter((a) => a.status === 'in_progress').length;
  const pendingCount = allAssignments.filter((a) => a.status === 'pending').length;
  const completionRate = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading tracking dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 rounded-2xl p-6 text-white shadow-2xl">
        <h2 className="text-3xl font-black mb-4">📊 Assignment Tracking Dashboard</h2>
        <p className="text-blue-100 mb-6">
          Track all your client assignments in one place. See who's completing, who's falling behind, and manage accountability.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{totalAssignments}</div>
            <div className="text-sm text-blue-100">Total</div>
          </div>
          <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{completedCount}</div>
            <div className="text-sm text-blue-100">Completed</div>
          </div>
          <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{inProgressCount}</div>
            <div className="text-sm text-blue-100">In Progress</div>
          </div>
          <div className="bg-yellow-500/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{pendingCount}</div>
            <div className="text-sm text-blue-100">Pending</div>
          </div>
          <div className="bg-purple-500/30 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="text-sm text-blue-100">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Bulk Assignment Button */}
      <button
        onClick={() => setShowBulkAssignForm(!showBulkAssignForm)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition text-lg"
      >
        {showBulkAssignForm ? '✕ Cancel' : '➕ Assign to Multiple Clients'}
      </button>

      {/* Bulk Assignment Form */}
      {showBulkAssignForm && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-purple-300 dark:border-purple-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Assign Action Item to Multiple Clients
          </h3>

          <form onSubmit={handleBulkAssign} className="space-y-4">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Clients *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      selectedClients.includes(client.id)
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {client.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assignment Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                value={bulkAssignment.title}
                onChange={(e) => setBulkAssignment({ ...bulkAssignment, title: e.target.value })}
                placeholder="e.g., Call 50 prospects this week"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={bulkAssignment.description}
                onChange={(e) => setBulkAssignment({ ...bulkAssignment, description: e.target.value })}
                placeholder="Additional details..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={bulkAssignment.due_date}
                  onChange={(e) => setBulkAssignment({ ...bulkAssignment, due_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={bulkAssignment.priority}
                  onChange={(e) => setBulkAssignment({ ...bulkAssignment, priority: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition"
            >
              Create Assignment for {selectedClients.length} Client(s)
            </button>
          </form>
        </div>
      )}

      {/* Grouped Assignments with Tracking Footer */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">All Assignments</h3>

        {groupedAssignments.length === 0 ? (
          <div className="bg-white dark:bg-brand-navy p-12 rounded-lg border border-brand-light-border dark:border-brand-gray text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No assignments created yet. Use the button above to get started!
            </p>
          </div>
        ) : (
          groupedAssignments.map((group, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-brand-navy rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
            >
              {/* Assignment Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 border-b-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                    {group.title}
                  </h4>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold ${getPriorityColor(group.priority)}`}>
                    {group.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                {group.description && (
                  <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Assigned to <strong>{group.assignments.length}</strong> client(s)
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    <strong>{group.assignments.filter((a) => a.status === 'completed').length}</strong> completed
                  </span>
                </div>
              </div>

              {/* Tracking Footer - Client List */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
                  📋 Client Tracking
                </h5>
                <div className="space-y-3">
                  {group.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {getClientName(assignment.client_id)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                            {assignment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <div>
                            📅 Assigned: {new Date(assignment.created_at).toLocaleDateString()} | 
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </div>
                          {assignment.status === 'in_progress' && (
                            <div className="text-blue-600 dark:text-blue-400 font-semibold">
                              ⏳ Added to targets - Client is working on it
                            </div>
                          )}
                          {assignment.status === 'completed' && assignment.completed_at && (
                            <div className="text-green-600 dark:text-green-400 font-semibold">
                              ✅ Completed: {new Date(assignment.completed_at).toLocaleDateString()}
                              {assignment.completion_note && (
                                <div className="text-gray-600 dark:text-gray-400 mt-1 italic">
                                  "{assignment.completion_note}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {assignment.status !== 'completed' && (
                          <button
                            onClick={() => handleManualComplete(assignment.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                            title="Mark as complete manually"
                          >
                            ✓ Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                          title="Delete assignment"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoachTrackingDashboard;
