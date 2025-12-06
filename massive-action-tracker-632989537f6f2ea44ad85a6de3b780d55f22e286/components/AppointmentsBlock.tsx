
import React from 'react';
import { CalendarEvent, formatTime12Hour } from '../types';

interface AppointmentsBlockProps {
    events: CalendarEvent[];
    onEventUpdate: (event: CalendarEvent) => void;
    onAddAppointment: () => void;
}

const AppointmentsBlock: React.FC<AppointmentsBlockProps> = ({ events, onEventUpdate, onAddAppointment }) => {
    
    const appointments = events.filter(e => e.type === 'Appointment');

    const handleConductedToggle = (event: CalendarEvent) => {
        onEventUpdate({ ...event, conducted: !event.conducted });
    };

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-brand-red uppercase">Today's Appointments</h3>
                <button onClick={onAddAppointment} className="bg-brand-lime text-brand-ink font-bold py-1 px-3 rounded-lg hover:bg-green-400 transition text-xs">
                    + Add
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {appointments.length > 0 ? (
                    appointments.map(event => (
                        <div key={event.id} className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={!!event.conducted}
                                onChange={() => handleConductedToggle(event)}
                                className="h-5 w-5 rounded bg-brand-light-border dark:bg-brand-gray border-gray-300 dark:border-gray-600 text-brand-lime focus:ring-brand-lime"
                            />
                            <div className="flex-grow">
                                <p className={`text-sm font-semibold ${event.conducted ? 'line-through text-gray-500' : 'text-brand-light-text dark:text-white'}`}>
                                    {event.client || event.title}
                                </p>
                                <p className={`text-xs ${event.conducted ? 'line-through text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {formatTime12Hour(event.time)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-center text-gray-500 py-4">No appointments scheduled for today.</p>
                )}
            </div>
        </div>
    );
};

export default AppointmentsBlock;