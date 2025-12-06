import React from 'react';
import { Contact, FollowUpStep } from '../types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface FollowUpTrackerProps {
  lead: Contact;
  onUpdate: (updatedLead: Contact) => void;
}

const FollowUpTracker: React.FC<FollowUpTrackerProps> = ({ lead, onUpdate }) => {
  if (!lead.followUpSteps || lead.followUpSteps.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No follow-up steps defined.</p>;
  }

  const handleToggleStep = (stepId: number) => {
    const updatedSteps = lead.followUpSteps!.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          isCompleted: !step.isCompleted,
          completedDate: step.isCompleted ? undefined : new Date().toISOString().split('T')[0],
        };
      }
      return step;
    });

    const updatedLead: Contact = {
      ...lead,
      followUpSteps: updatedSteps,
    };
    onUpdate(updatedLead);
  };

  const getDueDate = (step: FollowUpStep) => {
    if (!lead.hotLeadDate) return 'N/A';
    const hotLeadDate = new Date(lead.hotLeadDate);
    const dueDate = new Date(hotLeadDate);
    dueDate.setDate(hotLeadDate.getDate() + step.dayOffset);
    return dueDate.toISOString().split('T')[0];
  };

  return (
    <div className="mt-5 space-y-3">
      <h4 className="text-lg font-semibold text-brand-ink dark:text-white border-b border-gray-200 dark:border-brand-gray pb-1">
        9-Step Follow-up Tracker
      </h4>
      <div className="space-y-2">
        {lead.followUpSteps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              step.isCompleted
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-brand-gray dark:hover:bg-brand-gray-light'
            }`}
          >
            <div className="flex items-center">
              <button
                onClick={() => handleToggleStep(step.id)}
                className="mr-3 focus:outline-none"
                title={step.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
              >
                {step.isCompleted ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-gray-400 hover:text-brand-blue" />
                )}
              </button>
              <div>
                <p className={`font-medium ${step.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-brand-ink dark:text-white'}`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.nextAction}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-brand-ink dark:text-white">
                Due: {getDueDate(step)}
              </p>
              {step.isCompleted && (
                <p className="text-xs text-green-500">
                  Completed: {step.completedDate}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUpTracker;
