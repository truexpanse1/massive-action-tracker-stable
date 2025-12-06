import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarEventType, eventTypes } from '../types';
import DatePicker from './DatePicker';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (eventData: CalendarEvent, originalDateKey: string | null, newDateKey: string) => void;
    onDelete: (eventId: string, dateKey: string) => void;
    date: Date | null;
    eventToEdit: CalendarEvent | null;
    onGoToDay?: (date: Date) => void;
}

const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minuteOptions = ['00', '30'];
const periodOptions = ['AM', 'PM'];

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSave, onDelete, date, eventToEdit, onGoToDay }) => {
    // Event details
    const [hour, setHour] = useState('9');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');
    const [title, setTitle] = useState('');
    const [client, setClient] = useState('');
    const [type, setType] = useState<CalendarEventType>('Appointment');
    const [details, setDetails] = useState('');
    
    // Date / Reschedule
    const [eventDateStr, setEventDateStr] = useState('');

    // Recurrence
    const [recurrenceOption, setRecurrenceOption] = useState('none');
    const [repeatWeeks, setRepeatWeeks] = useState(4);


    useEffect(() => {
        const targetDate = date || new Date();
        if (eventToEdit) {
            // Populate form with existing event data
            const [h, m] = eventToEdit.time.split(':').map(Number);
            const eventPeriod = h >= 12 ? 'PM' : 'AM';
            let eventHour12 = h % 12 || 12;

            setHour(String(eventHour12));
            setMinute(String(m).padStart(2, '0'));
            setPeriod(eventPeriod);
            setTitle(eventToEdit.title);
            setClient(eventToEdit.client || '');
            setType(eventToEdit.type);
            setDetails(eventToEdit.details || '');
            setRecurrenceOption('none'); // Disable recurrence editing for now
        } else {
            // Reset for new event
            const now = new Date();
            let h = now.getHours();
            const m = now.getMinutes();
            
            setPeriod(h >= 12 ? 'PM' : 'AM');
            h = h % 12 || 12;
            setHour(String(h));
            setMinute(m < 30 ? '00' : '30');
            setTitle('');
            setClient('');
            setType('Appointment');
            setDetails('');
            setRecurrenceOption('none');
            setRepeatWeeks(4);
        }
        
        // Set date fields for both new and edited events
        setEventDateStr(targetDate.toISOString().split('T')[0]);

    }, [eventToEdit, date, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !eventDateStr) {
            alert('Please provide at least a title and a full date.');
            return;
        }

        if (recurrenceOption === 'weekly' && (repeatWeeks <= 0 || repeatWeeks > 52)) {
            alert('Please enter a number of weeks between 1 and 52.');
            return;
        }
        
        let hour24 = parseInt(hour, 10);
        if (period === 'PM' && hour24 < 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        const time = `${String(hour24).padStart(2, '0')}:${minute}`;
        
        const originalDateKey = date ? date.toISOString().split('T')[0] : null;
        const newDateKey = eventDateStr;
        
        let eventData: CalendarEvent;
        if (eventToEdit) {
            eventData = {
                ...eventToEdit,
                time, title, type, details, client,
                isRecurring: false, // Detach from series upon edit
                groupId: undefined,
            };
        } else {
            const newId = Date.now().toString();
            eventData = {
                id: newId,
                time, title, type, details, client,
                isRecurring: recurrenceOption === 'weekly',
                groupId: recurrenceOption === 'weekly' ? `${newId}-${repeatWeeks}` : undefined,
            };
        }

        onSave(eventData, originalDateKey, newDateKey);
    };
    
    const handleDelete = () => {
        if (eventToEdit && date && window.confirm('Are you sure you want to delete this event?')) {
            onDelete(eventToEdit.id, date.toISOString().split('T')[0]);
        }
    }

    if (!isOpen || !date) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <div>
                        <h2 className="text-xl font-bold text-brand-light-text dark:text-white">{eventToEdit ? 'Edit Event' : 'Add Event'}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Date / Reschedule Fields */}
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Date</label>
                        <DatePicker value={eventDateStr} onChange={setEventDateStr} />
                    </div>
                    {/* Time and Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Time</label>
                            <div className="flex items-center gap-1">
                                <select value={hour} onChange={e => setHour(e.target.value)} className="w-1/3 bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white">
                                    {hourOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <select value={minute} onChange={e => setMinute(e.target.value)} className="w-1/3 bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white">
                                    {minuteOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <select value={period} onChange={e => setPeriod(e.target.value)} className="w-1/3 bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white">
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="type" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Type</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as CalendarEventType)} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white">
                                {eventTypes.map(eventType => <option key={eventType} value={eventType}>{eventType}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Title and Client */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Discovery Call" className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="client" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Client / Contact (Optional)</label>
                        <input type="text" id="client" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g., Jane Doe from Acme Inc." className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" />
                    </div>
                    {/* Details */}
                    <div>
                        <label htmlFor="details" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Details (Optional)</label>
                        <textarea id="details" value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g., Discuss Q4 proposal" rows={2} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" />
                    </div>
                    {/* Recurrence */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recurrence" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Repeats</label>
                            <select id="recurrence" value={recurrenceOption} onChange={e => setRecurrenceOption(e.target.value)} disabled={!!eventToEdit} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white disabled:opacity-50">
                                <option value="none">Does not repeat</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                        {recurrenceOption === 'weekly' && !eventToEdit && (
                             <div>
                                <label htmlFor="repeatWeeks" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Repeat for (weeks)</label>
                                <input 
                                    type="number" 
                                    id="repeatWeeks" 
                                    value={repeatWeeks}
                                    onChange={e => setRepeatWeeks(parseInt(e.target.value))}
                                    min="1"
                                    max="52"
                                    className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" 
                                />
                            </div>
                        )}
                    </div>
                     {eventToEdit && <p className="text-xs text-center text-gray-400 dark:text-gray-500">Editing an event will detach it from any recurring series.</p>}

                </form>
                <div className="flex justify-between items-center p-4 border-t border-brand-light-border dark:border-brand-gray">
                    <div className="flex gap-2">
                        {onGoToDay && date && (
                            <button type="button" onClick={() => onGoToDay(date)} className="bg-brand-lime text-brand-ink font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition text-sm">
                                Go to Day
                            </button>
                        )}
                        {eventToEdit && (
                            <button onClick={handleDelete} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition text-sm">Delete</button>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                        <button onClick={handleSubmit} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;