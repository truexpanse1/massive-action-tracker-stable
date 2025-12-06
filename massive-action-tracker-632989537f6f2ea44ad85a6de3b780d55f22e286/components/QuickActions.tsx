import React, { useState, useMemo } from 'react';
import { formatPhoneNumber } from '../types';
import DatePicker from './DatePicker';

interface QuickActionsProps {
  onSetAppointment: (data: { name: string, phone: string, email: string, date: string, time: string, interestLevel: number }) => void;
  onAddToHotLeads: (data: { name: string, phone: string, email: string, interestLevel: number }) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onSetAppointment, onAddToHotLeads }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [interestLevel, setInterestLevel] = useState(5);

  const timeOptions = useMemo(() => {
    const options: { display: string; value: string }[] = [];
    // Business hours from 7 AM to 8 PM
    for (let h = 7; h <= 20; h++) {
        for (let m of [0, 30]) {
            const hour12 = h % 12 || 12;
            const period = h >= 12 ? 'PM' : 'AM';
            const minuteStr = String(m).padStart(2, '0');
            const display = `${hour12}:${minuteStr} ${period}`;
            const value = `${String(h).padStart(2, '0')}:${minuteStr}`;
            options.push({ display, value });
        }
    }
    return options;
  }, []);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setDate('');
    setTime('');
    setInterestLevel(5);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleSetAppointment = () => {
    if (!name || !date || !time) {
      alert('Please fill in at least Name, a Date, and a Time for an appointment.');
      return;
    }
    onSetAppointment({ name, phone, email, date, time, interestLevel });
    resetForm();
  };

  const handleAddHotLead = () => {
    if (!name) {
      alert('Please fill in at least a Name to add a hot lead.');
      return;
    }
    onAddToHotLeads({ name, phone, email, interestLevel });
    resetForm();
  };

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">PIPELINE PROGRESS</h3>
      <div className="space-y-3">
        {/* Input Fields */}
        <input type="text" placeholder="Contact Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" />
        <input type="tel" placeholder="Phone Number (XXX) XXX-XXXX" value={phone} onChange={handlePhoneChange} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" />
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" />

        {/* Appointment Fields */}
        <div className="grid grid-cols-2 gap-2">
            <DatePicker value={date} onChange={setDate} />
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
                <select 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className={`w-full pl-8 bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text ${time ? 'dark:text-white' : 'dark:text-gray-400'} text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid appearance-none cursor-pointer`}
                >
                    <option value="">Time</option>
                    {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.display}</option>)}
                </select>
            </div>
        </div>

        {/* Interest Level */}
        <div className="pt-2">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Interest Level: <span className="font-bold text-brand-lime">{interestLevel}</span></label>
            <input type="range" min="1" max="10" value={interestLevel} onChange={e => setInterestLevel(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-lime mt-1" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={handleSetAppointment} className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm">Set Appointment</button>
            <button onClick={handleAddHotLead} className="bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm">Add to Hot Leads</button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;