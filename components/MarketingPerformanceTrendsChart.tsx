import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface MarketingPerformanceTrendsChartProps {
  userId: string;
  allData: { [key: string]: any };
  transactions: any[];
  contentData: any[];
  avatarsData: any[];
}

type DateRangeType = 'week' | 'month' | 'custom';

const METRIC_CONFIG = {
  revenue: {
    color: '#10B981',
    yAxisId: 'left',
    strokeWidth: 4,
    label: 'Revenue ($)',
  },
  appointments: {
    color: '#3B82F6',
    yAxisId: 'right',
    strokeWidth: 3,
    label: 'Appointments',
  },
  calls: {
    color: '#8B5CF6',
    yAxisId: 'right',
    strokeWidth: 3,
    label: 'Calls',
  },
  posts: {
    color: '#EC4899',
    yAxisId: 'right',
    strokeWidth: 3,
    label: 'Posts Created',
  },
  avatars: {
    color: '#F59E0B',
    yAxisId: 'right',
    strokeWidth: 3,
    label: 'Avatars Created',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-brand-navy p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-brand-gray">
        <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.name === 'Revenue ($)'
              ? `$${entry.value.toLocaleString()}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MarketingPerformanceTrendsChart: React.FC<MarketingPerformanceTrendsChartProps> = ({
  userId,
  allData,
  transactions,
  contentData,
  avatarsData,
}) => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeMetrics, setActiveMetrics] = useState({
    revenue: true,
    appointments: true,
    calls: true,
    posts: true,
    avatars: false,
  });

  const toggleMetric = (metric: string) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let endDate = new Date(today);

    if (dateRangeType === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // Last 7 days
    } else if (dateRangeType === 'month') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // Last 30 days
    } else {
      // Custom range
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
      }
    }

    return { start: startDate, end: endDate };
  }, [dateRangeType, customStartDate, customEndDate]);

  // Process data for the chart
  const chartData = useMemo(() => {
    const data: any[] = [];
    const { start, end } = dateRange;

    // Generate all dates in range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = allData[dateKey];

      // Calculate metrics for this day
      let calls = 0;
      let appointments = 0;
      let revenue = 0;
      let posts = 0;
      let avatars = 0;

      if (dayData) {
        // Calls (SW, NA, LM)
        calls = (dayData.prospectingContacts || []).filter(
          (c: any) => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM
        ).length;

        // Appointments Set (SA)
        appointments = (dayData.prospectingContacts || []).filter(
          (c: any) => c.prospecting.SA
        ).length;
      }

      // Revenue from transactions
      const dayTransactions = transactions.filter(t => t.date === dateKey && t.userId === userId);
      revenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Posts created on this day (content marked as used)
      posts = contentData.filter(c => {
        const createdDate = new Date(c.created_at).toISOString().split('T')[0];
        return createdDate === dateKey && c.used === true;
      }).length;

      // Avatars created on this day
      avatars = avatarsData.filter(a => {
        const createdDate = new Date(a.created_at).toISOString().split('T')[0];
        return createdDate === dateKey;
      }).length;

      data.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue,
        appointments,
        calls,
        posts,
        avatars,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [dateRange, allData, transactions, contentData, avatarsData, userId]);

  const hasActiveMetrics = Object.values(activeMetrics).some(v => v);

  const leftAxisColor = activeMetrics.revenue ? METRIC_CONFIG.revenue.color : '#10B981';
  const rightAxisColor = activeMetrics.appointments
    ? METRIC_CONFIG.appointments.color
    : activeMetrics.calls
    ? METRIC_CONFIG.calls.color
    : '#3B82F6';

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
          📊 Marketing Performance Trends
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track content activity → leads → revenue correlation
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex gap-2">
          <button
            onClick={() => setDateRangeType('week')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              dateRangeType === 'week'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRangeType('month')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              dateRangeType === 'month'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRangeType('custom')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              dateRangeType === 'custom'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'
            }`}
          >
            Custom
          </button>
        </div>

        {dateRangeType === 'custom' && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-brand-gray bg-white dark:bg-brand-navy text-brand-light-text dark:text-white"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-brand-gray bg-white dark:bg-brand-navy text-brand-light-text dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Metric Toggles */}
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => toggleMetric(key)}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
              activeMetrics[key as keyof typeof activeMetrics]
                ? 'opacity-100'
                : 'opacity-40'
            }`}
            style={{
              backgroundColor: activeMetrics[key as keyof typeof activeMetrics]
                ? config.color
                : '#E5E7EB',
              color: activeMetrics[key as keyof typeof activeMetrics] ? 'white' : '#6B7280',
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {!hasActiveMetrics ? (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-brand-gray/20 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Select at least one metric to display the chart
          </p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-brand-gray/20 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No data available for the selected period
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-gray/20 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:opacity-20" />

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
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                label={{
                  value: 'Revenue ($)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: leftAxisColor, fontWeight: 600 },
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
                  style: { fill: rightAxisColor, fontWeight: 600 },
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              {activeMetrics.revenue && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={METRIC_CONFIG.revenue.color}
                  strokeWidth={METRIC_CONFIG.revenue.strokeWidth}
                  dot={{ r: 6, fill: METRIC_CONFIG.revenue.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                  name="Revenue ($)"
                />
              )}

              {activeMetrics.appointments && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="appointments"
                  stroke={METRIC_CONFIG.appointments.color}
                  strokeWidth={METRIC_CONFIG.appointments.strokeWidth}
                  dot={{ r: 5, fill: METRIC_CONFIG.appointments.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Appointments"
                />
              )}

              {activeMetrics.calls && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calls"
                  stroke={METRIC_CONFIG.calls.color}
                  strokeWidth={METRIC_CONFIG.calls.strokeWidth}
                  dot={{ r: 5, fill: METRIC_CONFIG.calls.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Calls"
                />
              )}

              {activeMetrics.posts && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="posts"
                  stroke={METRIC_CONFIG.posts.color}
                  strokeWidth={METRIC_CONFIG.posts.strokeWidth}
                  dot={{ r: 5, fill: METRIC_CONFIG.posts.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Posts Created"
                />
              )}

              {activeMetrics.avatars && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avatars"
                  stroke={METRIC_CONFIG.avatars.color}
                  strokeWidth={METRIC_CONFIG.avatars.strokeWidth}
                  dot={{ r: 5, fill: METRIC_CONFIG.avatars.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Avatars Created"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => {
          const total = chartData.reduce((sum, day) => sum + (day[key] || 0), 0);
          const avg = chartData.length > 0 ? (total / chartData.length).toFixed(1) : '0';
          
          return (
            <div
              key={key}
              className="p-4 rounded-lg border-l-4"
              style={{ borderColor: config.color }}
            >
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                {config.label}
              </div>
              <div className="text-2xl font-bold text-brand-light-text dark:text-white">
                {key === 'revenue' ? `$${total.toLocaleString()}` : total}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg: {key === 'revenue' ? `$${parseFloat(avg).toLocaleString()}` : avg}/day
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketingPerformanceTrendsChart;
