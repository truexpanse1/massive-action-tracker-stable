import React, { useState, useEffect } from 'react';
import { Contact, formatPhoneNumber } from '../types';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (leadData: Omit<Contact, 'id' | 'date' | 'prospecting' | 'dateAdded' | 'completedFollowUps'>) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [interestLevel, setInterestLevel] = useState(5);

    useEffect(() => {
        // Reset form when modal opens
        if (isOpen) {
            setName('');
            setCompany('');
            setPhone('');
            setEmail('');
            setInterestLevel(5);
        }
    }, [isOpen]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter a contact name.');
            return;
        }
        onSave({ name, company, phone, email, interestLevel });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Add New Lead</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Input Fields */}
                    <input type="text" placeholder="Contact Name *" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                    <input type="text" placeholder="Company (Optional)" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                    <input type="tel" placeholder="Phone Number (Optional)" value={phone} onChange={handlePhoneChange} className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                    <input type="email" placeholder="Email Address (Optional)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />

                    {/* Interest Level */}
                    <div className="pt-2">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Interest Level: <span className="font-bold text-brand-lime">{interestLevel}</span></label>
                        <input type="range" min="1" max="10" value={interestLevel} onChange={e => setInterestLevel(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-lime mt-1" />
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t border-brand-light-border dark:border-brand-gray space-x-2">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm">Save Lead</button>
                </div>
            </div>
        </div>
    );
};

export default AddLeadModal;