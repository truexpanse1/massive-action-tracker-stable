import React from 'react';
import { formatCurrency } from '../types';

interface BarChartProps {
  data: {name: string, revenue: number}[];
}

// Consistent color palette for products
const PRODUCT_COLORS = [
    '#2F81F7', '#34D399', '#FBBF24', '#A855F7', '#E53E3E', 
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#10B981',
];

const getProductColor = (productName: string, index: number) => {
    if (!productName) return '#cbd5e1'; // gray-300
    return PRODUCT_COLORS[index % PRODUCT_COLORS.length];
};

const BarChart: React.FC<BarChartProps> = ({data}) => {
    const top5 = data.slice(0, 5);
    if (top5.length === 0) return <p className="text-center text-sm text-gray-500 py-8">No revenue data for this period.</p>;
    
    const maxRevenue = Math.max(...top5.map(d => d.revenue), 1); // Avoid division by zero

    return (
        <div className="space-y-4 animate-fade-in">
            {top5.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                    <div className="w-28 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 truncate" title={item.name}>
                        {item.name}
                    </div>
                    <div className="flex-grow bg-gray-200 dark:bg-brand-gray rounded-full h-6">
                         <div className="h-6 rounded-full text-white text-xs flex items-center px-2" style={{ width: `${(item.revenue / maxRevenue) * 100}%`, backgroundColor: getProductColor(item.name, index) }}>
                             {formatCurrency(item.revenue)}
                         </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BarChart;