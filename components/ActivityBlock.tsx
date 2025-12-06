
import React from 'react';

interface ActivityBlockProps {
    title: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}

const ActivityBlock: React.FC<ActivityBlockProps> = ({ title, value, onChange, rows = 4 }) => {
    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-sm font-bold text-brand-red uppercase mb-2">{title}</h3>
            <textarea 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm focus:outline-none focus:border-brand-blue transition-colors resize-none"
            />
        </div>
    );
};

export default ActivityBlock;