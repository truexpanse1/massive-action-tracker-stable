import React from 'react';
import { CalendarEvent } from '../types';

interface EventsBlockProps {
    events: CalendarEvent[];
}

const EventsBlock: React.FC<EventsBlockProps> = ({ events }) => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-sm font-bold text-brand-red uppercase mb-2">Today's Events</h3>
            {events.length > 0 ? (
                <ul className="space-y-2">
                    {events.map(event => (
                        <li key={event.id}>
                            <p className="font-semibold text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.time}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-center text-gray-500 py-4">No events scheduled.</p>
            )}
        </div>
    );
};

export default EventsBlock;
