import React, { useState } from 'react';
import { ActionItem } from '../src/services/coachingNotesService';

interface AddToTargetsModalProps {
  actionItem?: string;
  bulkActionItems?: ActionItem[];
  onClose: () => void;
  onSubmit: (days: number) => void;
}

const AddToTargetsModal: React.FC<AddToTargetsModalProps> = ({
  actionItem,
  bulkActionItems,
  onClose,
  onSubmit,
}) => {
  const [selectedDays, setSelectedDays] = useState(30);

  const dayOptions = [
    { value: 1, label: '1 Day', description: 'One-time task' },
    { value: 3, label: '3 Days', description: 'Quick sprint' },
    { value: 7, label: '7 Days', description: 'Weekly focus' },
    { value: 14, label: '14 Days', description: 'Two-week challenge' },
    { value: 30, label: '30 Days', description: 'Build the habit (Recommended)' },
  ];

  const handleConfirm = () => {
    onSubmit(selectedDays);
  };

  // Determine if we're in bulk mode
  const isBulkMode = bulkActionItems && bulkActionItems.length > 0;
  const itemsToAdd = isBulkMode 
    ? bulkActionItems.filter(item => !item.added_to_targets)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-brand-navy rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-brand-gray">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
              {isBulkMode ? 'Add Multiple Items to Daily Targets' : 'Add to Daily Targets'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isBulkMode 
                ? `How many days should these ${itemsToAdd.length} action items appear in your targets?`
                : 'How many days should this action item appear in your targets?'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-brand-red dark:hover:text-brand-red text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Action Item Preview */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
          <p className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2">
            {isBulkMode ? `Action Items (${itemsToAdd.length}):` : 'Action Item:'}
          </p>
          {isBulkMode ? (
            <ul className="space-y-2">
              {itemsToAdd.map((item, index) => (
                <li key={index} className="text-sm text-brand-light-text dark:text-white flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-brand-light-text dark:text-white">
              {actionItem}
            </p>
          )}
        </div>

        {/* Day Selection */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-bold text-brand-light-text dark:text-white mb-3">
            Select Duration:
          </label>
          {dayOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDays(option.value)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedDays === option.value
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-500'
                  : 'border-gray-200 dark:border-brand-gray bg-white dark:bg-brand-ink hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-brand-light-text dark:text-white">
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedDays === option.value
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-300 dark:border-brand-gray'
                  }`}
                >
                  {selectedDays === option.value && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recommendation Message */}
        {selectedDays === 30 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>💪 Excellent choice!</strong> Consistency over 30 days builds lasting habits and drives real results.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-brand-gray rounded-lg text-brand-light-text dark:text-white hover:bg-gray-100 dark:hover:bg-brand-gray transition font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-bold shadow-lg"
          >
            {isBulkMode 
              ? `Add All (${itemsToAdd.length}) to Next ${selectedDays} ${selectedDays === 1 ? 'Day' : 'Days'}`
              : `Add to Next ${selectedDays} ${selectedDays === 1 ? 'Day' : 'Days'}`
            }
          </button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          {isBulkMode
            ? `This will add all ${itemsToAdd.length} action items to your Top 6 Daily Targets for the next ${selectedDays} ${selectedDays === 1 ? 'day' : 'days'}`
            : `This will add the action item to your Top 6 Daily Targets for the next ${selectedDays} ${selectedDays === 1 ? 'day' : 'days'}`
          }
        </p>
      </div>
    </div>
  );
};

export default AddToTargetsModal;
