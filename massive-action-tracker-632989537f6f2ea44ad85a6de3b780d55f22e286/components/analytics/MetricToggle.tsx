import React from 'react';

interface MetricToggleProps {
  activeMetrics: Record<string, boolean>;
  onToggle: (metric: string) => void;
}

const METRICS = [
  { key: 'revenue', label: 'Revenue', color: '#10B981' },
  { key: 'appointments', label: 'Appointments', color: '#3B82F6' },
  { key: 'calls', label: 'Calls', color: '#8B5CF6' },
  { key: 'leads', label: 'Leads', color: '#F59E0B' },
  { key: 'proposals', label: 'Proposals', color: '#EC4899' },
];

export const MetricToggle: React.FC<MetricToggleProps> = ({ 
  activeMetrics, 
  onToggle 
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-6">
      {METRICS.map(metric => {
        const isActive = activeMetrics[metric.key];
        return (
          <button
            key={metric.key}
            onClick={() => onToggle(metric.key)}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all duration-300
              ${isActive 
                ? 'opacity-100 shadow-lg transform hover:scale-105' 
                : 'opacity-40 hover:opacity-60'
              }
            `}
            style={{
              backgroundColor: isActive ? metric.color : '#CBD5E1',
              color: 'white',
              border: `3px solid ${isActive ? metric.color : 'transparent'}`,
            }}
          >
            {isActive && <span className="mr-2">✓</span>}
            {metric.label}
          </button>
        );
      })}
    </div>
  );
};

export default MetricToggle;
