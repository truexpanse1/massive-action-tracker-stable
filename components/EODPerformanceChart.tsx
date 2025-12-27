import React, { useState, useEffect, useMemo } from 'react';
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
import { DayData, Transaction, Contact } from '../types';

interface EODPerformanceChartProps {
  allData: { [key: string]: DayData };
  transactions: Transaction[];
  hotLeads: Contact[];
  userId: string;
}

type DateRangeType = 'week' | 'month' | 'custom';

const METRIC_CONFIG = {
  newRevenue: {
    color: '#10B981',
    yAxisId: 'left',
    strokeWidth: 4,
    label: 'New Revenue',
  },
  recurringRevenue: {
    color: '#14B8A6',
    yAxisId: 'left',
    strokeWidth: 4,
    label: 'Recurring Revenue',
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
  texts: {
    color: '#F59E0B',
    yAxisId: 'right',
    strokeWidth: 3,
    label: 'Texts',
  },
  emails: {
    color: '#EC4899',
    yAxisId: 'right',
    strokeWidth: 3,
    label: 'Emails',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-brand-navy p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-brand-gray">
        <p className="font-semibold text-gray-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.name.includes('Revenue')
              ? `$${entry.value.toLocaleString()}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EODPerformanceChart: React.FC<EODPerformanceChartProps> = ({
  allData,
  transactions,
  hotLeads,
  userId,
}) => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeMetrics, setActiveMetrics] = useState({
    newRevenue: true,
    recurringRevenue: true,
    appointments: true,
    calls: true,
    texts: false,
    emails: false,
  });

  // Responsive chart margins for mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const chartMargin = isMobile 
    ? { top: 10, right: 10, left: 10, bottom: 10 }
    : { top: 20, right: 50, left: 50, bottom: 20 };

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
      let texts = 0;
      let emails = 0;
      let appointments = 0;
      let revenue = 0;

      if (dayData) {
        // Calls (SW, NA, LM)
        calls = (dayData.prospectingContacts || []).filter(
          c => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM
        ).length;

        // Texts (ST)
        texts = (dayData.prospectingContacts || []).filter(
          c => c.prospecting.ST
        ).length;

        // Emails (EP)
        emails = (dayData.prospectingContacts || []).filter(
          c => c.prospecting.EP
        ).length;

        // Appointments Set (SA)
        appointments = (dayData.prospectingContacts || []).filter(
          c => c.prospecting.SA
        ).length;
      }

      // Revenue from transactions - split into new and recurring
      const dayTransactions = transactions.filter(t => t.date === dateKey && t.userId === userId);
      
      let newRevenue = 0;
      let recurringRevenue = 0;
      
      dayTransactions.forEach(t => {
        // Check if this is the client's first transaction ever
        const clientFirstTransaction = transactions
          .filter(tr => tr.clientName.toLowerCase() === t.clientName.toLowerCase())
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        
        if (clientFirstTransaction?.date === dateKey) {
          newRevenue += t.amount;
        } else {
          recurringRevenue += t.amount;
        }
      });
      
      revenue = newRevenue + recurringRevenue;

      data.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue,
        newRevenue,
        recurringRevenue,
        appointments,
        calls,
        texts,
        emails,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [dateRange, allData, transactions, userId]);

  const hasActiveMetrics = Object.values(activeMetrics).some(v => v);

  const leftAxisColor = activeMetrics.newRevenue 
    ? METRIC_CONFIG.newRevenue.color 
    : activeMetrics.recurringRevenue 
    ? METRIC_CONFIG.recurringRevenue.color 
    : '#10B981';
  const rightAxisColor = activeMetrics.appointments
    ? METRIC_CONFIG.appointments.color
    : activeMetrics.calls
    ? METRIC_CONFIG.calls.color
    : '#3B82F6';

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-3 sm:p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-light-text dark:text-white mb-2">
          Performance Trends
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track your key performance indicators over time
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
        <div className="bg-white dark:bg-brand-gray/20 rounded-lg p-2 sm:p-4">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
              margin={chartMargin}
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                label={{
                  value: 'Revenue ($)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: leftAxisColor, fontWeight: 'bold' },
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
                  style: { fill: rightAxisColor, fontWeight: 'bold' },
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />

              {activeMetrics.newRevenue && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newRevenue"
                  stroke={METRIC_CONFIG.newRevenue.color}
                  strokeWidth={METRIC_CONFIG.newRevenue.strokeWidth}
                  name={METRIC_CONFIG.newRevenue.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeMetrics.recurringRevenue && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="recurringRevenue"
                  stroke={METRIC_CONFIG.recurringRevenue.color}
                  strokeWidth={METRIC_CONFIG.recurringRevenue.strokeWidth}
                  name={METRIC_CONFIG.recurringRevenue.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeMetrics.appointments && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="appointments"
                  stroke={METRIC_CONFIG.appointments.color}
                  strokeWidth={METRIC_CONFIG.appointments.strokeWidth}
                  name={METRIC_CONFIG.appointments.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeMetrics.calls && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="calls"
                  stroke={METRIC_CONFIG.calls.color}
                  strokeWidth={METRIC_CONFIG.calls.strokeWidth}
                  name={METRIC_CONFIG.calls.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeMetrics.texts && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="texts"
                  stroke={METRIC_CONFIG.texts.color}
                  strokeWidth={METRIC_CONFIG.texts.strokeWidth}
                  name={METRIC_CONFIG.texts.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeMetrics.emails && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="emails"
                  stroke={METRIC_CONFIG.emails.color}
                  strokeWidth={METRIC_CONFIG.emails.strokeWidth}
                  name={METRIC_CONFIG.emails.label}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(METRIC_CONFIG).map(([key, config]) => {
          const total = chartData.reduce((sum, d) => sum + (d[key] || 0), 0);
          const avg = chartData.length > 0 ? total / chartData.length : 0;

          return (
            <div
              key={key}
              className="bg-gray-50 dark:bg-brand-gray/20 p-4 rounded-lg border-l-4"
              style={{ borderColor: config.color }}
            >
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                {config.label}
              </p>
              <p className="text-2xl font-black text-brand-light-text dark:text-white">
                {key === 'revenue' ? `$${total.toLocaleString()}` : Math.round(total)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg: {key === 'revenue' ? `$${Math.round(avg).toLocaleString()}` : Math.round(avg)}/day
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EODPerformanceChart;
