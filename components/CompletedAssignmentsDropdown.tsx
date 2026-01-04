import React, { useState, useMemo } from 'react';
import { CoachingAssignment } from '../services/coachingAssignmentsService';

interface CompletedAssignmentsDropdownProps {
  assignments: CoachingAssignment[];
  onSelectAssignment: (assignment: CoachingAssignment) => void;
}

const CompletedAssignmentsDropdown: React.FC<CompletedAssignmentsDropdownProps> = ({
  assignments,
  onSelectAssignment,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  // Group assignments by completion date
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: CoachingAssignment[] } = {};

    assignments
      .filter((a) => a.status === 'completed' && a.completed_at)
      .sort((a, b) => {
        const dateA = new Date(b.completed_at || '').getTime();
        const dateB = new Date(a.completed_at || '').getTime();
        return dateA - dateB;
      })
      .forEach((assignment) => {
        const date = new Date(assignment.completed_at || '').toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(assignment);
      });

    return groups;
  }, [assignments]);

  const toggleDate = (date: string) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const completedCount = assignments.filter((a) => a.status === 'completed').length;

  if (completedCount === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg flex items-center justify-between"
      >
        <span>✅ Completed Assignments ({completedCount})</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 bg-white dark:bg-brand-navy rounded-lg border-2 border-purple-300 dark:border-purple-700 overflow-hidden shadow-lg">
          {Object.entries(groupedByDate).map(([date, dateAssignments]) => (
            <div key={date} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {/* Date Header */}
              <button
                onClick={() => toggleDate(date)}
                className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center justify-between transition"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  📅 {date}
                </span>
                <span className="text-sm bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200 px-3 py-1 rounded-full font-bold">
                  {dateAssignments.length}
                </span>
              </button>

              {/* Assignments for this date */}
              {expandedDates.includes(date) && (
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50">
                  {dateAssignments.map((assignment) => (
                    <button
                      key={assignment.id}
                      onClick={() => {
                        onSelectAssignment(assignment);
                        setIsOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                        {assignment.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {assignment.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold ${
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
                        {assignment.completion_note && (
                          <span className="text-gray-500 dark:text-gray-400">
                            💭 Has note
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedAssignmentsDropdown;
