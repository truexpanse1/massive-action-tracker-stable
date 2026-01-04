import React, { useState } from 'react';
import { CoachingAssignment } from '../services/coachingAssignmentsService';

interface AssignmentDetailPopupProps {
  assignment: CoachingAssignment | null;
  onClose: () => void;
  onSaveAsNote?: (noteData: {
    title: string;
    source: string;
    keyTakeaways: string;
    actionItems: string[];
  }) => Promise<void>;
  onAddToTargets?: (assignment: CoachingAssignment) => Promise<void>;
}

const AssignmentDetailPopup: React.FC<AssignmentDetailPopupProps> = ({
  assignment,
  onClose,
  onSaveAsNote,
  onAddToTargets,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!assignment) return null;

  const handleSaveAsNote = async () => {
    if (!onSaveAsNote) return;

    setIsSaving(true);
    try {
      await onSaveAsNote({
        title: `[Completed] ${assignment.title}`,
        source: 'Coach Assignment',
        keyTakeaways: assignment.completion_note || assignment.description || '',
        actionItems: assignment.description ? [assignment.description] : [],
      });
      alert('✅ Saved to your Coaching Notes!');
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToTargets = async () => {
    if (!onAddToTargets) return;

    try {
      await onAddToTargets(assignment);
      alert('✅ Added back to your targets!');
      onClose();
    } catch (error) {
      console.error('Error adding to targets:', error);
      alert('Failed to add to targets');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-brand-navy rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {assignment.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  assignment.priority === 'urgent'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : assignment.priority === 'high'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : assignment.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {assignment.priority.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ✅ Completed: {new Date(assignment.completed_at || '').toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Assignment Description */}
          {assignment.description && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                📋 Assignment Details
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            </div>
          )}

          {/* Completion Note */}
          {assignment.completion_note && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                💭 Your Reflection
              </h3>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignment.completion_note}
                </p>
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned Date</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {new Date(assignment.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Due Date</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {new Date(assignment.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Close
          </button>
          {onAddToTargets && (
            <button
              onClick={handleAddToTargets}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              ➕ Add to Targets
            </button>
          )}
          {onSaveAsNote && (
            <button
              onClick={handleSaveAsNote}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition"
            >
              {isSaving ? '⏳ Saving...' : '💾 Save as Note'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPopup;
