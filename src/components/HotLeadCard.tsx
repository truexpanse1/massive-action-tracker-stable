import React, { useState } from 'react';
import { Contact } from '../types';
import FollowUpTracker from './FollowUpTracker';
import { PhoneIcon, EnvelopeIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface HotLeadCardProps {
  lead: Contact;
  onUpdate: (updatedLead: Contact) => void;
  onDelete: (leadId: string) => void;
  onConvert: (lead: Contact, initialAmountCollected: number) => void;
  onEmail: (lead: Contact) => void;
  onSchedule: (lead: Contact) => void;
}

const HotLeadCard: React.FC<HotLeadCardProps> = ({
  lead,
  onUpdate,
  onDelete,
  onConvert,
  onEmail,
  onSchedule,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [initialAmount, setInitialAmount] = useState(0);

  const handleMarkNotHot = () => {
    const updatedLead: Contact = {
      ...lead,
      isHot: false,
      hotLeadDate: undefined,
      followUpSteps: undefined,
    };
    onUpdate(updatedLead);
  };

  const handleConvert = () => {
    if (initialAmount > 0) {
      onConvert(lead, initialAmount);
      setIsConverting(false);
    } else {
      alert('Please enter a valid initial amount collected.');
    }
  };

  const nextStep = lead.followUpSteps?.find(step => !step.isCompleted);
  const nextAction = nextStep ? `${nextStep.name} (Day ${nextStep.dayOffset})` : 'All steps complete!';
  const nextActionStatus = nextStep ? 'Due' : 'Complete';

  return (
    <div className="bg-white dark:bg-brand-ink-light rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-brand-gray">
      {/* Header/Summary Section */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-brand-ink dark:text-white">
              {lead.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lead.company || 'No Company'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              lead.interestLevel >= 8
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}
          >
            Interest {lead.interestLevel}/10
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-brand-ink dark:text-white">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-brand-lime" />
            <span className="font-semibold mr-1">Next Action:</span> {nextAction}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Hot Since: {lead.hotLeadDate}
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="p-5 border-t border-gray-200 dark:border-brand-gray">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-brand-ink dark:text-white">
              <PhoneIcon className="w-4 h-4 mr-2 text-brand-blue" />
              <a href={`tel:${lead.phone}`} className="hover:underline">
                {lead.phone}
              </a>
            </div>
            <div className="flex items-center text-sm text-brand-ink dark:text-white">
              <EnvelopeIcon className="w-4 h-4 mr-2 text-brand-blue" />
              <a href={`mailto:${lead.email}`} className="hover:underline">
                {lead.email}
              </a>
            </div>
          </div>

          {/* Follow-up Tracker */}
          <FollowUpTracker lead={lead} onUpdate={onUpdate} />

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onEmail(lead); }}
              className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-blue-600 transition"
            >
              Email Lead
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSchedule(lead); }}
              className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium text-brand-ink bg-brand-lime rounded-lg hover:bg-brand-lime-dark transition"
            >
              Schedule
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsConverting(true); }}
              className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
            >
              Convert to Client
            </button>
          </div>

          {/* Convert Modal/Form */}
          {isConverting && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-brand-gray rounded-lg space-y-2">
              <p className="text-sm font-semibold text-brand-ink dark:text-white">
                Convert to Client
              </p>
              <input
                type="number"
                placeholder="Initial Amount Collected ($)"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-brand-ink-light dark:border-brand-gray dark:text-white"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleConvert}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  Confirm Conversion
                </button>
                <button
                  onClick={() => setIsConverting(false)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-brand-ink bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200 dark:border-brand-gray">
            <button
              onClick={(e) => { e.stopPropagation(); handleMarkNotHot(); }}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 transition"
            >
              Mark Not Hot
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
            >
              Delete Lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotLeadCard;
