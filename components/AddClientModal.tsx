import React, { useState, useEffect } from 'react';
import { NewClient, Transaction, formatPhoneNumber, formatCurrency } from '../types';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: NewClient) => void;
    client: NewClient | null;
    transactions?: Transaction[]; // All transactions from Revenue tab
}

type TabType = 'contact' | 'financial' | 'transactions';

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave, client, transactions = [] }) => {
    const [formData, setFormData] = useState<Partial<NewClient>>({});
    const [activeTab, setActiveTab] = useState<TabType>('contact');

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
                city: '',
                state: '',
                zip: '',
                salesProcessLength: '',
                monthlyContractValue: 0,
                initialAmountCollected: 0,
                closeDate: new Date().toISOString().split('T')[0],
                stage: 'Contract Signed',
            });
        }
        setActiveTab('contact'); // Reset to contact tab when modal opens
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

    // Filter transactions for this client
    const clientTransactions = transactions.filter(
        t => t.clientName.toLowerCase() === formData.name?.toLowerCase()
    );

    // Calculate totals
    const totalCollected = clientTransactions.reduce((sum, t) => sum + t.amount, 0);
    const mcv = formData.monthlyContractValue || 0;
    const acv = mcv * 12;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">{client ? 'Edit Client' : 'Add New Client'}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-brand-light-border dark:border-brand-gray">
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                            activeTab === 'contact'
                                ? 'text-brand-blue border-b-2 border-brand-blue'
                                : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'
                        }`}
                    >
                        Contact Info
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                            activeTab === 'financial'
                                ? 'text-brand-blue border-b-2 border-brand-blue'
                                : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'
                        }`}
                    >
                        Financial
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex-1 py-3 px-4 text-sm font-semibold transition ${
                            activeTab === 'transactions'
                                ? 'text-brand-blue border-b-2 border-brand-blue'
                                : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'
                        }`}
                    >
                        Transactions ({clientTransactions.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Address</label>
                                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-300">City</label>
                                <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">State</label>
                                    <input type="text" name="state" value={formData.state || ''} onChange={handleChange} maxLength={2} placeholder="CA" className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Zip</label>
                                    <input type="text" name="zip" value={formData.zip || ''} onChange={handleChange} maxLength={10} placeholder="12345" className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            {/* Financial Summary */}
                            <div className="bg-brand-light-bg dark:bg-brand-gray/30 p-4 rounded-lg space-y-3">
                                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-3">Financial Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Contract Value (MCV)</p>
                                        <p className="text-2xl font-bold text-brand-lime">{formatCurrency(mcv)}/mo</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Annual Contract Value (ACV)</p>
                                        <p className="text-2xl font-bold text-brand-blue">{formatCurrency(acv)}/yr</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Collected</p>
                                        <p className="text-2xl font-bold text-brand-light-text dark:text-white">{formatCurrency(totalCollected)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Monthly Contract Value (MCV)</label>
                                    <input type="number" name="monthlyContractValue" value={formData.monthlyContractValue === undefined ? '' : formData.monthlyContractValue} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Initial Amount Collected</label>
                                    <input type="number" name="initialAmountCollected" value={formData.initialAmountCollected === undefined ? '' : formData.initialAmountCollected} onChange={handleChange} required className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Sales Process Length</label>
                                    <input type="text" name="salesProcessLength" placeholder="e.g., 3 months" value={formData.salesProcessLength || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Close Date</label>
                                    <input type="date" name="closeDate" value={formData.closeDate || ''} onChange={handleChange} className="mt-1 w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div>
                            <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">Transaction History</h3>
                            {clientTransactions.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transactions found for this client.</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {clientTransactions
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map(transaction => (
                                            <div key={transaction.id} className="bg-brand-light-bg dark:bg-brand-gray/30 p-3 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-brand-light-text dark:text-white">{transaction.product}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                                                    {transaction.isRecurring && (
                                                        <span className="inline-block mt-1 text-xs bg-brand-blue text-white px-2 py-0.5 rounded">Recurring</span>
                                                    )}
                                                </div>
                                                <p className="text-lg font-bold text-brand-lime">{formatCurrency(transaction.amount)}</p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-4 border-t border-brand-light-border dark:border-brand-gray space-x-2">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm">Save Client</button>
                </div>
            </div>
        </div>
    );
};

export default AddClientModal;
