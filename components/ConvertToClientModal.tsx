import React, { useState, useEffect } from 'react';
import { Contact, formatCurrency } from '../types';

interface ConvertToClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (initialAmountCollected: number) => void;
    contact: Contact | null;
}

const ConvertToClientModal: React.FC<ConvertToClientModalProps> = ({ isOpen, onClose, onSave, contact }) => {
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 0) {
            alert('Please enter a valid, non-negative amount.');
            return;
        }
        onSave(numericAmount);
    };

    if (!isOpen || !contact) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-md flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Convert to Client</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        You are converting <span className="font-bold text-brand-light-text dark:text-white">{contact.name}</span> into a new client. Please enter the initial amount collected.
                    </p>
                    <div>
                        <label htmlFor="initialAmount" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Initial Amount Collected</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</span>
                            <input
                                id="initialAmount"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                                autoFocus
                                placeholder="e.g., 5000"
                                className="w-full pl-7 pr-4 py-2 bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            />
                        </div>
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t border-brand-light-border dark:border-brand-gray space-x-2">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="bg-brand-lime text-brand-ink font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition text-sm">Confirm & Convert</button>
                </div>
            </div>
        </div>
    );
};

export default ConvertToClientModal;