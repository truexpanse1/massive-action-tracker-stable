import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

interface InteractiveChartProps {
  activeMetrics: Record<string, boolean>;
  data: any[];
}

const METRIC_CONFIG = {
  revenue: { 
    color: '#10B981', 
    yAxisId: 'left',
    strokeWidth: 4,
    type: 'monotone' as const,
    label: 'Revenue ($)',
  },
  appointments: { 
    color: '#3B82F6', 
    yAxisId: 'right',
    strokeWidth: 3,
    type: 'monotone' as const,
    label: 'Appointments',
  },
  calls: { 
    color: '#8B5CF6', 
    yAxisId: 'right',
    strokeWidth: 3,
    type: 'monotone' as const,
    label: 'Calls',
  },
  leads: { 
    color: '#F59E0B', 
    yAxisId: 'right',
    strokeWidth: 3,
    type: 'monotone' as const,
    label: 'New Leads',
  },
  proposals: { 
    color: '#EC4899', 
    yAxisId: 'right',
    strokeWidth: 3,
    type: 'monotone' as const,
    label: 'Proposals',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.name === 'Revenue ($)' 
              ? `$${(entry.value / 1000).toFixed(1)}K` 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ 
  activeMetrics,
  data 
}) => {
  const hasActiveMetrics = Object.values(activeMetrics).some(v => v);
  
  if (!hasActiveMetrics) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Select at least one metric to display the chart
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No data available for the selected period</p>
      </div>
    );
  }

  const leftAxisColor = activeMetrics.revenue ? METRIC_CONFIG.revenue.color : '#10B981';
  const rightAxisColor = activeMetrics.appointments 
    ? METRIC_CONFIG.appointments.color 
    : activeMetrics.calls 
    ? METRIC_CONFIG.calls.color 
    : '#3B82F6';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart 
          data={data} 
          margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          
          <XAxis 
            dataKey="date" 
            stroke="#64748B"
            style={{ fontSize: 12, fontWeight: 600 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          
          <YAxis 
            yAxisId="left"
            stroke={leftAxisColor}
            style={{ fontSize: 12, fontWeight: 600 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            label={{ 
              value: 'Revenue ($)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: leftAxisColor, fontWeight: 'bold' }
            }}
          />
          
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke={rightAxisColor}
            style={{ fontSize: 12, fontWeight: 600 }}
            label={{ 
              value: 'Count', 
              angle: 90, 
              position: 'insideRight',
              style: { fill: rightAxisColor, fontWeight: 'bold' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            iconType="line"
          />

          {activeMetrics.revenue && (
            <>
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="none"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                yAxisId="left"
                isAnimationActive={true}
                animationDuration={500}
              />
              <Line
                type={METRIC_CONFIG.revenue.type}
                dataKey="revenue"
                stroke={METRIC_CONFIG.revenue.color}
                strokeWidth={METRIC_CONFIG.revenue.strokeWidth}
                yAxisId="left"
                dot={{ r: 4, fill: METRIC_CONFIG.revenue.color }}
                activeDot={{ r: 6 }}
                name={METRIC_CONFIG.revenue.label}
                isAnimationActive={true}
                animationDuration={500}
              />
            </>
          )}

          {activeMetrics.appointments && (
            <Line
              type={METRIC_CONFIG.appointments.type}
              dataKey="appointments"
              stroke={METRIC_CONFIG.appointments.color}
              strokeWidth={METRIC_CONFIG.appointments.strokeWidth}
              yAxisId="right"
              dot={{ r: 3, fill: METRIC_CONFIG.appointments.color }}
              activeDot={{ r: 5 }}
              name={METRIC_CONFIG.appointments.label}
              isAnimationActive={true}
              animationDuration={500}
            />
          )}

          {activeMetrics.calls && (
            <Line
              type={METRIC_CONFIG.calls.type}
              dataKey="calls"
              stroke={METRIC_CONFIG.calls.color}
              strokeWidth={METRIC_CONFIG.calls.strokeWidth}
              yAxisId="right"
              dot={{ r: 3, fill: METRIC_CONFIG.calls.color }}
              activeDot={{ r: 5 }}
              name={METRIC_CONFIG.calls.label}
              isAnimationActive={true}
              animationDuration={500}
            />
          )}

          {activeMetrics.leads && (
            <Line
              type={METRIC_CONFIG.leads.type}
              dataKey="leads"
              stroke={METRIC_CONFIG.leads.color}
              strokeWidth={METRIC_CONFIG.leads.strokeWidth}
              yAxisId="right"
              dot={{ r: 3, fill: METRIC_CONFIG.leads.color }}
              activeDot={{ r: 5 }}
              name={METRIC_CONFIG.leads.label}
              isAnimationActive={true}
              animationDuration={500}
            />
          )}

          {activeMetrics.proposals && (
            <Line
              type={METRIC_CONFIG.proposals.type}
              dataKey="proposals"
              stroke={METRIC_CONFIG.proposals.color}
              strokeWidth={METRIC_CONFIG.proposals.strokeWidth}
              yAxisId="right"
              dot={{ r: 3, fill: METRIC_CONFIG.proposals.color }}
              activeDot={{ r: 5 }}
              name={METRIC_CONFIG.proposals.label}
              isAnimationActive={true}
              animationDuration={500}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InteractiveChart;
