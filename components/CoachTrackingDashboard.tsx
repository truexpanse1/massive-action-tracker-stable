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

type FilterStatus = 'all' | 'completed' | 'in_progress' | 'pending';

const CoachTrackingDashboard: React.FC<CoachTrackingDashboardProps> = ({
  managerId,
  companyId,
  clients,
}) => {
  const [allAssignments, setAllAssignments] = useState<CoachingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkAssignForm, setShowBulkAssignForm] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  
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

  // Filter assignments based on selected status
  const filteredGroups = filterStatus === 'all' 
    ? groupedAssignments 
    : groupedAssignments.map(group => ({
        ...group,
        assignments: group.assignments.filter(a => a.status === filterStatus)
      })).filter(group => group.assignments.length > 0);

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
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Stats Bar with Clickable Filters */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            📊 Assignment Tracking
          </h3>
          <button
            onClick={() => setShowBulkAssignForm(!showBulkAssignForm)}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
          >
            {showBulkAssignForm ? '✕ Cancel' : '➕ New Assignment'}
          </button>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-lg transition cursor-pointer ${
              filterStatus === 'all' 
                ? 'bg-white/30 ring-2 ring-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="text-2xl font-bold text-white">{totalAssignments}</div>
            <div className="text-xs text-blue-100">Total</div>
          </button>
          
          <button
            onClick={() => setFilterStatus('completed')}
            className={`p-3 rounded-lg transition cursor-pointer ${
              filterStatus === 'completed' 
                ? 'bg-green-500/40 ring-2 ring-white' 
                : 'bg-green-500/20 hover:bg-green-500/30'
            }`}
          >
            <div className="text-2xl font-bold text-white">{completedCount}</div>
            <div className="text-xs text-blue-100">Completed</div>
          </button>
          
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`p-3 rounded-lg transition cursor-pointer ${
              filterStatus === 'in_progress' 
                ? 'bg-blue-500/40 ring-2 ring-white' 
                : 'bg-blue-500/20 hover:bg-blue-500/30'
            }`}
          >
            <div className="text-2xl font-bold text-white">{inProgressCount}</div>
            <div className="text-xs text-blue-100">In Progress</div>
          </button>
          
          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-3 rounded-lg transition cursor-pointer ${
              filterStatus === 'pending' 
                ? 'bg-yellow-500/40 ring-2 ring-white' 
                : 'bg-yellow-500/20 hover:bg-yellow-500/30'
            }`}
          >
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
            <div className="text-xs text-blue-100">Pending</div>
          </button>
          
          <div className="p-3 rounded-lg bg-purple-500/20">
            <div className="text-2xl font-bold text-white">{completionRate}%</div>
            <div className="text-xs text-blue-100">Rate</div>
          </div>
        </div>
        
        {filterStatus !== 'all' && (
          <div className="mt-2 text-sm text-white/80">
            Showing: <strong className="text-white">{filterStatus.replace('_', ' ').toUpperCase()}</strong> assignments
          </div>
        )}
      </div>

      {/* Bulk Assignment Form */}
      {showBulkAssignForm && (
        <div className="bg-white dark:bg-brand-navy p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-lg">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Assign to Multiple Clients
          </h4>

          <form onSubmit={handleBulkAssign} className="space-y-3">
            {/* Client Selection - Compact */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Clients *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className={`flex items-center gap-2 p-2 rounded border-2 cursor-pointer transition text-sm ${
                      selectedClients.includes(client.id)
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="w-4 h-4"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {client.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assignment Details - Compact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={bulkAssignment.title}
                  onChange={(e) => setBulkAssignment({ ...bulkAssignment, title: e.target.value })}
                  placeholder="e.g., Call 50 prospects"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={bulkAssignment.description}
                  onChange={(e) => setBulkAssignment({ ...bulkAssignment, description: e.target.value })}
                  placeholder="Details..."
                  rows={2}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={bulkAssignment.due_date}
                  onChange={(e) => setBulkAssignment({ ...bulkAssignment, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={bulkAssignment.priority}
                  onChange={(e) => setBulkAssignment({ ...bulkAssignment, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition"
            >
              Create for {selectedClients.length} Client(s)
            </button>
          </form>
        </div>
      )}

      {/* Compact Assignment List */}
      <div className="space-y-3">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">All Assignments</h4>

        {filteredGroups.length === 0 ? (
          <div className="bg-white dark:bg-brand-navy p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {filterStatus === 'all' 
                ? 'No assignments yet. Create one above!' 
                : `No ${filterStatus.replace('_', ' ')} assignments.`}
            </p>
          </div>
        ) : (
          filteredGroups.map((group, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-brand-navy rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow"
            >
              {/* Compact Header */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h5 className="text-base font-bold text-gray-900 dark:text-white flex-1">
                    {group.title}
                  </h5>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(group.priority)}`}>
                    {group.priority.toUpperCase()}
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {group.assignments.length} client(s) • {group.assignments.filter((a) => a.status === 'completed').length} completed
                </div>
              </div>

              {/* Compact Client List */}
              <div className="p-3 space-y-2">
                {group.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {getClientName(assignment.client_id)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Assigned: {new Date(assignment.created_at).toLocaleDateString()} | 
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                        {assignment.status === 'completed' && assignment.completed_at && (
                          <span className="text-green-600 dark:text-green-400 font-semibold ml-2">
                            ✅ Completed: {new Date(assignment.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {assignment.completion_note && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                          "{assignment.completion_note}"
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-3">
                      {assignment.status !== 'completed' && (
                        <button
                          onClick={() => handleManualComplete(assignment.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CoachTrackingDashboard;
