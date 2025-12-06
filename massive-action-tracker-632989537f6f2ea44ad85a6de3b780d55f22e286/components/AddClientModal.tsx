import React, { useState, useEffect } from 'react';
import { NewClient, formatPhoneNumber } from '../types';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: NewClient) => void;
    client: NewClient | null;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave, client }) => {
    const [formData, setFormData] = useState<Partial<NewClient>>({});

    useEffect(() => {
        if (client) {
            setFormData(client);
        } else {
            // Default values for a new client
            setFormData({
                id: `manual-${Date.now()}`,
                name: '',
                company: '',
                phone: '',
                email: '',
                address: '',
                salesProcessLength: '',
                monthlyContractValue: 0,
                initialAmountCollected: 0,
                closeDate: new Date().toISOString().split('T')[0],
                stage: 'Contract Signed',
            });
        }
    }, [client, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            const num = parseFloat(value);
            setFormData(prev => ({
                ...prev,
                [name]: isNaN(num) ? undefined : num,
            }));
        } else if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.initialAmountCollected == null) {
            alert('Please provide at least a client name and initial amount collected.');
            return;
        }
        onSave(formData as NewClient);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">{client ? 'Edit Client' : 'Add New Client'}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Column 1 */}
                        <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Name</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Company</label>
                            <input type="text" name="company" value={formData.company || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Phone</label>
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>

                        {/* Column 2 */}
                        <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Sales Process Length</label>
                            <input type="text" name="salesProcessLength" placeholder="e.g., 3 months" value={formData.salesProcessLength || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Address</label>
                            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Monthly Contract Value (MCV)</label>
                            <input type="number" name="monthlyContractValue" value={formData.monthlyContractValue === undefined ? '' : formData.monthlyContractValue} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Initial Amount Collected</label>
                            <input type="number" name="initialAmountCollected" value={formData.initialAmountCollected === undefined ? '' : formData.initialAmountCollected} onChange={handleChange} required className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                        </div>
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t border-brand-light-border dark:border-brand-gray space-x-2">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm">Save Client</button>
                </div>
            </div>
        </div>
    );
};

export default AddClientModal;