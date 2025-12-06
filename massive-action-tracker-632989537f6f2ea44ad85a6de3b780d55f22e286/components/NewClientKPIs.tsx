import React, { useMemo } from 'react';
import { NewClient, formatCurrency } from '../types';

interface NewClientKPIsProps {
  newClients: NewClient[];
}

const NewClientKPIs: React.FC<NewClientKPIsProps> = ({ newClients }) => {
    const metrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const clientsThisMonth = newClients.filter(client => {
            const closeDate = new Date(client.closeDate);
            return closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear;
        });

        const initialCollectedThisMonth = clientsThisMonth.reduce((sum, client) => sum + client.initialAmountCollected, 0);
        const newMCVThisMonth = clientsThisMonth.reduce((sum, client) => sum + (client.monthlyContractValue || 0), 0);
        const avgDealSize = clientsThisMonth.length > 0 ? initialCollectedThisMonth / clientsThisMonth.length : 0;
        
        return {
            clientsThisMonth: clientsThisMonth.length,
            initialCollectedThisMonth: formatCurrency(initialCollectedThisMonth),
            newMCVThisMonth: formatCurrency(newMCVThisMonth),
            avgDealSize: formatCurrency(avgDealSize),
        };
    }, [newClients]);

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
             <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">NEW CLIENT KPIS</h3>
             <div className="text-center">
                <p className="text-4xl font-black text-brand-lime">{metrics.clientsThisMonth}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">New Clients (Month)</p>
            </div>
             <div className="mt-4 space-y-2">
                <div className="flex justify-between items-baseline border-t border-dashed border-gray-200 dark:border-brand-gray pt-2">
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Initial Collected (Month):</span>
                    <span className="font-bold text-lg text-brand-light-text dark:text-white">{metrics.initialCollectedThisMonth}</span>
                </div>
                 <div className="flex justify-between items-baseline border-t border-dashed border-gray-200 dark:border-brand-gray pt-2">
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">New MCV (Month):</span>
                    <span className="font-bold text-lg text-brand-light-text dark:text-white">{metrics.newMCVThisMonth}</span>
                </div>
                 <div className="flex justify-between items-baseline border-t border-dashed border-gray-200 dark:border-brand-gray pt-2">
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Average Deal Size:</span>
                    <span className="font-bold text-lg text-brand-light-text dark:text-white">{metrics.avgDealSize}</span>
                </div>
             </div>
        </div>
    );
};

export default NewClientKPIs;