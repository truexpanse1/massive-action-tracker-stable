
import React from 'react';
import { RevenueData } from '../types';

type Period = 'today' | 'week' | 'month' | 'ytd' | 'mcv' | 'acv';

interface RevenueCardProps {
    data: RevenueData;
    onNavigate: (period: Period) => void;
}

const RevenueButton: React.FC<{
    label: string;
    value: string;
    onClick: () => void;
}> = ({ label, value, onClick }) => (
    <div className="flex items-center justify-between">
        <button 
            onClick={onClick}
            className="text-sm font-medium text-left flex items-center rounded px-2 py-1 transition-colors w-1/3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray/50"
        >
            <span className="text-brand-red mr-2">•</span> {label}
        </button>
        <p 
            className="w-2/3 bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md px-2 py-1 text-sm text-brand-light-text dark:text-white text-right font-semibold"
        >
            {value || '$0.00'}
        </p>
    </div>
);

const RevenueCard: React.FC<RevenueCardProps> = ({ data, onNavigate }) => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">REVENUE GENERATED</h3>
            <div className="space-y-3">
                <RevenueButton label="TODAY" value={data.today} onClick={() => onNavigate('today')} />
                <RevenueButton label="WEEK" value={data.week} onClick={() => onNavigate('week')} />
                <RevenueButton label="MONTH" value={data.month} onClick={() => onNavigate('month')} />
                <RevenueButton label="YTD" value={data.ytd} onClick={() => onNavigate('ytd')} />
                <RevenueButton label="MCV" value={data.mcv} onClick={() => onNavigate('mcv')} />
                <RevenueButton label="ACV" value={data.acv} onClick={() => onNavigate('acv')} />
            </div>
        </div>
    );
};

export default RevenueCard;