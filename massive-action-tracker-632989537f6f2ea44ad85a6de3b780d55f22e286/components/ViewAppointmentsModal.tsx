import React from 'react';
import { CalendarEvent, formatTime12Hour } from '../types';

interface ViewAppointmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointments: CalendarEvent[];
    onEditAppointment: (event: CalendarEvent) => void;
}

const ViewAppointmentsModal: React.FC<ViewAppointmentsModalProps> = ({ isOpen, onClose, appointments, onEditAppointment }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Today's Appointments ({appointments.length})</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    {appointments.length > 0 ? (
                        <ul className="space-y-3">
                            {appointments.map(appt => (
                                <li key={appt.id} className="p-3 bg-brand-light-bg dark:bg-brand-gray/20 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-brand-light-text dark:text-white">{appt.client || appt.title}</p>
                                        <p className="text-sm text-brand-blue font-semibold">{formatTime12Hour(appt.time)}</p>
                                        {appt.details && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{appt.details}</p>}
                                    </div>
                                    <button
                                        onClick={() => onEditAppointment(appt)}
                                        className="text-xs bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300 font-bold py-1 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-brand-gray/50 transition whitespace-nowrap"
                                    >
                                        View / Edit
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 p-8">No appointments scheduled for today.</p>
                    )}
                </div>
                <div className="p-4 border-t border-brand-light-border dark:border-brand-gray text-right">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewAppointmentsModal;