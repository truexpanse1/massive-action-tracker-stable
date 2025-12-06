import React, { useMemo } from 'react';

interface InsightCardsProps {
  activeMetrics: Record<string, boolean>;
  data: any[];
}

const METRIC_CONFIG = {
  revenue: { label: 'Total Revenue', color: '#10B981', format: (v: number) => `$${(v / 1000).toFixed(1)}K` },
  appointments: { label: 'Total Appointments', color: '#3B82F6', format: (v: number) => v.toString() },
  calls: { label: 'Total Calls', color: '#8B5CF6', format: (v: number) => v.toString() },
  leads: { label: 'Total Leads', color: '#F59E0B', format: (v: number) => v.toString() },
  proposals: { label: 'Total Proposals', color: '#EC4899', format: (v: number) => v.toString() },
};

export const InsightCards: React.FC<InsightCardsProps> = ({ 
  activeMetrics,
  data 
}) => {
  const insights = useMemo(() => {
    if (!data || data.length === 0) return [];

    const activeMetricKeys = Object.keys(activeMetrics).filter(k => activeMetrics[k]);
    
    return activeMetricKeys.slice(0, 3).map(metricKey => {
      const config = METRIC_CONFIG[metricKey as keyof typeof METRIC_CONFIG];
      const total = data.reduce((sum, item) => sum + (item[metricKey] || 0), 0);
      const average = total / data.length;
      const trend = data.length > 1 
        ? ((data[data.length - 1][metricKey] || 0) - (data[0][metricKey] || 0)) / (data[0][metricKey] || 1) * 100
        : 0;

      return {
        label: config.label,
        value: config.format(total),
        average: config.format(Math.round(average)),
        trend: trend.toFixed(1),
        color: config.color,
        isPositive: trend >= 0,
      };
    });
  }, [activeMetrics, data]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {insights.map((insight, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow duration-300"
          style={{ borderLeftColor: insight.color }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {insight.label}
            </h3>
            <div 
              className={`text-xs font-bold px-2 py-1 rounded ${
                insight.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {insight.isPositive ? '↑' : '↓'} {Math.abs(parseFloat(insight.trend))}%
            </div>
          </div>
          
          <div className="mb-2">
            <p 
              className="text-3xl font-bold"
              style={{ color: insight.color }}
            >
              {insight.value}
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            <span className="font-medium">Avg per day:</span> {insight.average}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightCards;
