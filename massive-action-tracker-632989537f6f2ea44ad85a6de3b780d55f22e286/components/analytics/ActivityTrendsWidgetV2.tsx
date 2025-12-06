import React, { useState, useMemo } from 'react';
import MetricToggle from './MetricToggle';
import InteractiveChart from './InteractiveChart';
import InsightCards from './InsightCards';

interface ActivityTrendsWidgetV2Props {
  labels: string[];
  rawData: Record<string, Record<'revenue' | 'appts' | 'calls' | 'leads', number[]>>;
  selectedUsers: string[];
  userColors: Record<string, string>;
  usersById: Record<string, { name: string }>;
}

export const ActivityTrendsWidgetV2: React.FC<ActivityTrendsWidgetV2Props> = ({ 
  labels, 
  rawData, 
  selectedUsers,
  userColors,
  usersById
}) => {
  const [activeMetrics, setActiveMetrics] = useState({
    revenue: true,
    appointments: true,
    calls: true,
    leads: false,
    proposals: false,
  });

  const toggleMetric = (metric: string) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Transform the data for our chart component
  const chartData = useMemo(() => {
    if (selectedUsers.length === 0) {
      return [];
    }

    // Aggregate data across all selected users
    return labels.map((label, index) => {
      let revenue = 0;
      let appointments = 0;
      let calls = 0;
      let leads = 0;
      let proposals = 0; // Note: proposals not in current data, using 0

      selectedUsers.forEach(userId => {
        const userData = rawData[userId];
        if (userData) {
          revenue += userData.revenue?.[index] || 0;
          appointments += userData.appts?.[index] || 0;
          calls += userData.calls?.[index] || 0;
          leads += userData.leads?.[index] || 0;
        }
      });

      return {
        date: label,
        revenue,
        appointments,
        calls,
        leads,
        proposals,
      };
    });
  }, [labels, rawData, selectedUsers]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Click to toggle metrics on/off • Hover for details • Compare trends across time
        </p>
        {selectedUsers.length > 1 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Showing combined data for {selectedUsers.length} selected rep{selectedUsers.length > 1 ? 's' : ''}
          </p>
        )}
        {selectedUsers.length === 1 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Showing data for {usersById[selectedUsers[0]]?.name || 'Unknown'}
          </p>
        )}
      </div>
      
      <MetricToggle 
        activeMetrics={activeMetrics}
        onToggle={toggleMetric}
      />
      
      <InteractiveChart 
        activeMetrics={activeMetrics}
        data={chartData}
      />
      
      <InsightCards 
        activeMetrics={activeMetrics}
        data={chartData}
      />
    </div>
  );
};

export default ActivityTrendsWidgetV2;
