import React from 'react';
import { followUpSchedule } from '../types';

const FollowUpGuide: React.FC = () => {
  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-sm font-bold text-brand-red uppercase mb-3 text-center">30-Day Follow-Up Plan</h3>
      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
        {Object.entries(followUpSchedule).map(([day, activity]) => (
          <li key={day} className="flex justify-between items-center">
            <span className="font-semibold">Day {day}</span>
            <span>{activity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FollowUpGuide;