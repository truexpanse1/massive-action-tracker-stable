
import React from 'react';
import { Contact, Role } from '../types';

interface NewLeadsBlockProps {
    leads: Contact[];
    userRole: Role;
    onAddLeadClick: () => void;
    onViewLeadsClick: () => void;
}

const NewLeadsBlock: React.FC<NewLeadsBlockProps> = ({ leads, userRole, onAddLeadClick, onViewLeadsClick }) => {
    const leadsCount = leads.length;

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-sm font-bold text-brand-red uppercase mb-2">New Leads Today</h3>
            
            {userRole === 'Manager' ? (
                <div className="text-center my-4">
                    <p className="text-6xl font-black text-brand-light-text dark:text-white">{leadsCount}</p>
                </div>
            ) : (
                <div className="my-4 min-h-[7rem] max-h-48 overflow-y-auto bg-brand-light-bg dark:bg-brand-gray/20 rounded p-2 space-y-1">
                    {leadsCount > 0 ? (
                        <ul>
                            {leads.map(lead => (
                                <li key={lead.id} className="text-sm font-medium text-brand-light-text dark:text-gray-300 truncate">
                                    - {lead.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                           <p className="text-xs text-center text-gray-500">Leads added today will appear here.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={onViewLeadsClick}
                    disabled={leadsCount === 0}
                    className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-brand-gray disabled:cursor-not-allowed"
                >
                    View Details
                </button>
                <button onClick={onAddLeadClick} className="w-full bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm">
                    + Add Lead
                </button>
            </div>
        </div>
    );
};

export default NewLeadsBlock;