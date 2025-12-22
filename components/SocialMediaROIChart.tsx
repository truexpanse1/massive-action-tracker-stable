// SocialMediaROIChart.tsx - Track social media posts → leads → revenue

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User, Contact, Transaction } from '../src/types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SocialMediaROIChartProps {
  user: User;
}

type TimeRange = 'week' | 'month' | 'custom';

const SocialMediaROIChart: React.FC<SocialMediaROIChartProps> = ({ user }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [postedContent, setPostedContent] = useState<any[]>([]);
  const [socialLeads, setSocialLeads] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user.id, timeRange]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // Fetch posted content
      const { data: contentData, error: contentError } = await supabase
        .from('generated_content')
        .select('*')
        .eq('user_id', user.id)
        .eq('used', true)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (contentError) throw contentError;

      // Fetch social media leads
      const socialSources = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok'];
      const { data: leadsData, error: leadsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .in('lead_source', socialSources)
        .gte('dateAdded', startISO)
        .lte('dateAdded', endISO);

      if (leadsError) throw leadsError;

      // Fetch transactions (for revenue attribution)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) throw transactionsError;

      setPostedContent(contentData || []);
      setSocialLeads(leadsData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching social media ROI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    const days: string[] = [];
    const postsPerDay: number[] = [];
    const leadsPerDay: number[] = [];
    const revenuePerDay: number[] = [];

    // Generate date labels
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      days.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // Count posts for this day
      const postsCount = postedContent.filter(c => 
        c.created_at && c.created_at.startsWith(dateKey)
      ).length;
      postsPerDay.push(postsCount);

      // Count leads for this day
      const leadsCount = socialLeads.filter(l => 
        l.dateAdded && l.dateAdded.startsWith(dateKey)
      ).length;
      leadsPerDay.push(leadsCount);

      // Calculate revenue for this day (simplified - would need better attribution)
      const dayRevenue = transactions.filter(t => 
        t.date === dateKey
      ).reduce((sum, t) => sum + t.amount, 0);
      revenuePerDay.push(dayRevenue);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      labels: days,
      datasets: [
        {
          label: 'Posts Published',
          data: postsPerDay,
          borderColor: 'rgb(147, 51, 234)', // Purple
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
        },
        {
          label: 'Leads Generated',
          data: leadsPerDay,
          borderColor: 'rgb(59, 130, 246)', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
        },
        {
          label: 'Revenue ($)',
          data: revenuePerDay,
          borderColor: 'rgb(34, 197, 94)', // Green
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
        },
      ],
    };
  }, [postedContent, socialLeads, transactions, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Count',
          color: 'rgb(156, 163, 175)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Revenue ($)',
          color: 'rgb(156, 163, 175)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  const summaryStats = useMemo(() => {
    const totalPosts = postedContent.length;
    const totalLeads = socialLeads.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const conversionRate = totalPosts > 0 ? (totalLeads / totalPosts * 100).toFixed(1) : '0';
    const revenuePerPost = totalPosts > 0 ? (totalRevenue / totalPosts).toFixed(2) : '0';

    return {
      totalPosts,
      totalLeads,
      totalRevenue,
      conversionRate,
      revenuePerPost,
    };
  }, [postedContent, socialLeads, transactions]);

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-light-text dark:text-white">
            📊 Social Media ROI
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track content performance → leads → revenue
          </p>
        </div>

        {/* Time Range Buttons */}
        <div className="flex gap-2">
          {[
            { value: 'week' as TimeRange, label: 'Week' },
            { value: 'month' as TimeRange, label: 'Month' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeRange === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-80 mb-6">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Posts</p>
              <p className="text-2xl font-black text-brand-light-text dark:text-white">
                {summaryStats.totalPosts}
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Leads</p>
              <p className="text-2xl font-black text-brand-light-text dark:text-white">
                {summaryStats.totalLeads}
              </p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Revenue</p>
              <p className="text-2xl font-black text-brand-light-text dark:text-white">
                ${summaryStats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Conv. Rate</p>
              <p className="text-2xl font-black text-brand-light-text dark:text-white">
                {summaryStats.conversionRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">leads/post</p>
            </div>
            <div className="border-l-4 border-pink-600 pl-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">$/Post</p>
              <p className="text-2xl font-black text-brand-light-text dark:text-white">
                ${summaryStats.revenuePerPost}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">avg revenue</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialMediaROIChart;
