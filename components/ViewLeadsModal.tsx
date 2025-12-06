

import React, { useMemo, useState } from 'react';
import { Contact, User } from '../types';

interface ViewLeadsModalProps {
    isOpen: boolean;
    onClose: () => void;
    leads: Contact[];
    users: User[];
}

const ViewLeadsModal: React.FC<ViewLeadsModalProps> = ({ isOpen, onClose, leads, users }) => {
    const [selectedRepId, setSelectedRepId] = useState<string>('all');

    const leadsByRep = useMemo(() => {
        const repsWithLeads = new Map<string, User>();
        leads.forEach(lead => {
            if (lead.userId && !repsWithLeads.has(lead.userId)) {
                const rep = users.find(u => u.id === lead.userId);
                if (rep) {
                    repsWithLeads.set(lead.userId, rep);
                }
            }
        });
        return Array.from(repsWithLeads.values());
    }, [leads, users]);

    const filteredLeads = useMemo(() => {
        if (selectedRepId === 'all') {
            return leads;
        }
        return leads.filter(lead => lead.userId === selectedRepId);
    }, [leads, selectedRepId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Leads Added Today ({leads.length})</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>

                {/* Filter Section */}
                <div className="p-3 border-b border-brand-light-border dark:border-brand-gray">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedRepId('all')}
                            className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${selectedRepId === 'all' ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'}`}
                        >
                            All ({leads.length})
                        </button>
                        {leadsByRep.map(rep => (
                            <button
                                key={rep.id}
                                onClick={() => setSelectedRepId(rep.id)}
                                className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${selectedRepId === rep.id ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'}`}
                            >
                                {rep.name} ({leads.filter(l => l.userId === rep.id).length})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {filteredLeads.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredLeads.map(lead => (
                                <li key={lead.id} className="p-2 bg-brand-light-bg dark:bg-brand-gray/20 rounded-md">
                                    <p className="font-semibold text-brand-light-text dark:text-gray-200 text-sm">{lead.name} {lead.company && `(${lead.company})`}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{lead.phone} &bull; {lead.email}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-center text-gray-500 p-8">No leads found for this selection.</p>
                    )}
                </div>
                <div className="p-4 border-t border-brand-light-border dark:border-brand-gray text-right">
                    <button onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewLeadsModal;