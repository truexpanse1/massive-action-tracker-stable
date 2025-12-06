import React from 'react';
import { Contact, followUpSchedule } from '../types';

interface DailyFollowUpsProps {
    hotLeads: Contact[];
    onUpdateHotLead: (lead: Contact) => void;
    selectedDate: Date;
    onWin: (winMessage: string) => void;
}

const DailyFollowUps: React.FC<DailyFollowUpsProps> = ({ hotLeads, onUpdateHotLead, selectedDate, onWin }) => {
    
    const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
    const currentDateKey = getDateKey(selectedDate);

    const dueFollowUps = hotLeads.flatMap(lead => {
        // Use appointmentDate as the trigger for follow-ups
        if (!lead.appointmentDate) return [];

        const startDate = new Date(lead.appointmentDate + 'T00:00:00');
        
        return Object.entries(followUpSchedule).map(([day, activity]) => {
            const dayNumber = parseInt(day, 10);
            const dueDate = new Date(startDate);
            // Day 1 is on the appointment day itself, so subtract 1 from dayNumber
            dueDate.setDate(dueDate.getDate() + dayNumber -1); 
            
            if (getDateKey(dueDate) === currentDateKey) {
                return {
                    lead,
                    day: dayNumber,
                    activity,
                    isCompleted: !!lead.completedFollowUps?.[dayNumber]
                };
            }
            return null;
        }).filter(Boolean);
    });

    const handleFollowUpCompletion = (lead: Contact, day: number, activity: string) => {
        const wasCompleted = !!lead.completedFollowUps?.[day];
        if (wasCompleted) return;

        const newCompleted = { ...(lead.completedFollowUps || {}), [day]: currentDateKey };
        const updatedLead = { ...lead, completedFollowUps: newCompleted };
        onUpdateHotLead(updatedLead);
        onWin(`Follow-up: '${activity}' for ${lead.name}`);
    };

    if (dueFollowUps.length === 0) {
        return (
            <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h3 className="text-sm font-bold text-brand-red uppercase mb-2">Daily Follow-Ups</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">No follow-ups scheduled for today.</p>
            </div>
        );
    }

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-sm font-bold text-brand-red uppercase mb-3">Daily Follow-Ups</h3>
            <div className="space-y-3">
                {dueFollowUps.map(({ lead, day, activity, isCompleted }, index) => (
                    <div key={`${lead.id}-${day}`} className="flex items-start space-x-3">
                        <input 
                            type="checkbox"
                            id={`followup-${lead.id}-${day}`}
                            checked={isCompleted}
                            onChange={() => handleFollowUpCompletion(lead, day, activity)}
                            disabled={isCompleted}
                            className="h-5 w-5 mt-0.5 rounded bg-brand-light-border dark:bg-brand-gray border-gray-300 dark:border-gray-600 text-brand-blue focus:ring-brand-blue disabled:opacity-50"
                        />
                        <label htmlFor={`followup-${lead.id}-${day}`} className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-brand-light-text dark:text-gray-300'}`}>
                            <span className="font-semibold">{activity}</span> for {lead.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyFollowUps;