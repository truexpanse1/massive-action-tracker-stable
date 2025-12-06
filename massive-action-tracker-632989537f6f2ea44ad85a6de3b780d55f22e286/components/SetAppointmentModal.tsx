import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import DatePicker from './DatePicker';

interface SetAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { date: string, time: string, note: string }) => void;
    contact: Contact | null;
}

const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minuteOptions = ['00', '15', '30', '45'];
const periodOptions = ['AM', 'PM'];

const SetAppointmentModal: React.FC<SetAppointmentModalProps> = ({ isOpen, onClose, onSave, contact }) => {
    const [date, setDate] = useState('');
    const [hour, setHour] = useState('9');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');
    const [note, setNote] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            const now = new Date();
            let h = now.getHours();
            setPeriod(h >= 12 ? 'PM' : 'AM');
            h = h % 12 || 12;
            setHour(String(h));
            setMinute('00');
            setNote('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) {
            alert('Please select a date for the appointment.');
            return;
        }

        let hour24 = parseInt(hour, 10);
        if (period === 'PM' && hour24 < 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        const time = `${String(hour24).padStart(2, '0')}:${minute}`;
        
        onSave({ date, time, note });
    };

    if (!isOpen || !contact) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Set Appointment for {contact.name}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Date</label>
                            <DatePicker value={date} onChange={setDate} />
                        </div>
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
                    </div>
                    <div>
                        <label htmlFor="note" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="e.g., Discuss interior painting project..."
                            rows={3}
                            className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t border-brand-light-border dark:border-brand-gray space-x-2">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm">Save Appointment</button>
                </div>
            </div>
        </div>
    );
};

export default SetAppointmentModal;