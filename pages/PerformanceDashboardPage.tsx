import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DayData, Transaction, User, Contact, EODSubmissions, formatCurrency } from '../types';
import { getPerformanceEvaluation } from '../services/geminiService';
import DatePicker from '../components/DatePicker';
import ActivityTrendsWidgetV2 from '../components/analytics/ActivityTrendsWidgetV2';


// --- TYPE DEFINITIONS ---
type ChartMetric = 'revenue' | 'appts' | 'calls' | 'leads';
type ChartType = 'line' | 'bar';

interface RawDetailData {
    revenue: Transaction[];
    appts: Contact[];
    calls: Contact[];
    leads: Contact[];
}
interface ActivityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalData: { label: string; metric: ChartMetric; data: RawDetailData; usersById: { [key: string]: User } } | null;
}

// New types for historical data
interface HistoricalDataset {
  userId: string;
  userName: string;
  color: string;
  data: number[];
}
interface HistoricalSummary {
    userId: string;
    userName: string;
    revenue: number;
    appts: number;
    calls: number;
    leads: number;
    deals: number;
}
interface HistoricalReport {
  labels: string[];
  datasets: HistoricalDataset[];
  summary: HistoricalSummary[];
}

interface RawHistoricalData {
    labels: string[];
    rawData: Record<string, Record<ChartMetric, number[]>>;
    summaryData: Record<string, HistoricalSummary>;
}

interface AlertsDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userId: string;
    eodSubmissions: EODSubmissions;
}

type AnalysisData = HistoricalSummary & {
    avgDealSize: number;
    callToApptRate: number;
    apptToDealRate: number;
    leadToDealRate: number;
};

// --- HELPER & SUB-COMPONENTS ---

const formatNumber = (value: number) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('en-US').format(value);
};

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ isOpen, onClose, modalData }) => {
    if (!isOpen || !modalData) return null;

    const { label, metric, data, usersById } = modalData;

    const metricTitles: Record<ChartMetric, string> = {
        revenue: "Revenue Transactions",
        appts: "Appointments Set",
        calls: "Calls Made",
        leads: "New Leads",
    };

    const renderContent = () => {
        switch (metric) {
            case 'revenue':
                return data.revenue.length > 0 ? (
                    <ul className="divide-y divide-brand-light-border dark:divide-brand-gray">
                        {data.revenue.map(t => (
                            <li key={t.id} className="py-2 flex justify-between">
                                <span>{t.clientName} ({usersById[t.userId!]?.name || 'Unknown'})</span>
                                <span className="font-bold text-brand-lime">{formatCurrency(t.amount)}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p>No revenue transactions for this period.</p>;
            
            case 'appts':
                return data.appts.length > 0 ? (
                    <ul className="divide-y divide-brand-light-border dark:divide-brand-gray">
                        {data.appts.map(c => (
                            <li key={c.id} className="py-2">{c.name} ({usersById[c.userId!]?.name || 'Unknown'})</li>
                        ))}
                    </ul>
                ) : <p>No appointments were set in this period.</p>;
            
            case 'calls':
                return data.calls.length > 0 ? (
                    <ul className="divide-y divide-brand-light-border dark:divide-brand-gray">
                        {data.calls.map(c => (
                            <li key={c.id} className="py-2">{c.name} ({usersById[c.userId!]?.name || 'Unknown'})</li>
                        ))}
                    </ul>
                ) : <p>No calls were made in this period.</p>;
            
            case 'leads':
                 return data.leads.length > 0 ? (
                    <ul className="divide-y divide-brand-light-border dark:divide-brand-gray">
                        {data.leads.map(c => (
                            <li key={c.id} className="py-2">{c.name} ({usersById[c.userId!]?.name || 'Unknown'})</li>
                        ))}
                    </ul>
                ) : <p>No new leads were added in this period.</p>;

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Details for {label}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <h3 className="font-bold text-lg mb-3 text-brand-light-text dark:text-white">{metricTitles[metric]}</h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlertsDetailModal: React.FC<AlertsDetailModalProps> = ({ isOpen, onClose, userName, userId, eodSubmissions }) => {
    if (!isOpen) return null;

    const submissionHistory = useMemo(() => {
        const history = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            
            // Skip weekends
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            const dateKey = d.toISOString().split('T')[0];
            const isSubmitted = eodSubmissions[userId]?.[dateKey];
            history.push({ date: d, dateKey, isSubmitted });
        }
        return history;
    }, [userId, eodSubmissions]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">EOD Reports: {userName}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase">Last 30 Days (Weekdays)</h3>
                    <ul className="space-y-2">
                        {submissionHistory.map(({ date, dateKey, isSubmitted }) => (
                            <li key={dateKey} className="flex justify-between items-center text-sm p-2 rounded-md bg-brand-light-bg dark:bg-brand-gray/20">
                                <span className="text-brand-light-text dark:text-white">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                {isSubmitted ? (
                                    <span className="text-brand-lime font-bold flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        Submitted
                                    </span>
                                ) : (
                                    <span className="text-brand-red font-bold flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        Missed
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const ReportWidget: React.FC<{ title: string; children: React.ReactNode; className?: string; }> = ({ title, children, className = '' }) => (
    <div className={`bg-brand-light-card dark:bg-brand-navy p-4 sm:p-6 rounded-lg border border-brand-light-border dark:border-brand-gray ${className}`}>
        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase mb-4">{title}</h3>
        {children}
    </div>
);

const InteractiveChart: React.FC<{
  data: { label: string; value: number; breakdown?: { name: string; value: number }[], details: RawDetailData }[];
  color: string;
  type: 'line' | 'bar';
  formatValue?: (value: number) => string;
  showBreakdown?: boolean;
  onPointClick?: (data: any) => void;
}> = ({ data, color, type, formatValue = (v) => v.toString(), showBreakdown = false, onPointClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ content: any; x: number; y: number } | null>(null);
    
    const width = 600;
    const height = 250;
    const padding = { top: 20, right: 10, bottom: 30, left: 50 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yScale = maxValue > 0 ? chartHeight / maxValue : 1;

    const barWidth = data.length > 0 ? Math.max(chartWidth / data.length - 10, 20) : 20;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const index = Math.floor((x - padding.left) / (chartWidth / data.length));
        if (index >= 0 && index < data.length) {
            const point = data[index];
            setTooltip({
                content: point,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        } else {
            setTooltip(null);
        }
    };

    const handleMouseLeave = () => setTooltip(null);

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || !onPointClick) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const index = Math.floor((x - padding.left) / (chartWidth / data.length));
        if (index >= 0 && index < data.length) {
            onPointClick(data[index]);
        }
    };

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {/* Y-axis */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                {/* X-axis */}
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />

                {/* Y-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const value = maxValue * fraction;
                    const yPos = height - padding.bottom - (chartHeight * fraction);
                    return (
                        <g key={fraction}>
                            <line x1={padding.left - 5} y1={yPos} x2={padding.left} y2={yPos} stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                            <text x={padding.left - 10} y={yPos + 4} textAnchor="end" className="text-xs fill-gray-500 dark:fill-gray-400">
                                {formatValue(value)}
                            </text>
                        </g>
                    );
                })}

                {/* Data visualization */}
                {type === 'bar' ? (
                    data.map((point, i) => {
                        const x = padding.left + (i * chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
                        const barHeight = point.value * yScale;
                        const y = height - padding.bottom - barHeight;
                        return (
                            <rect
                                key={i}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                className="transition-opacity hover:opacity-80"
                            />
                        );
                    })
                ) : (
                    <>
                        <polyline
                            points={data.map((point, i) => {
                                const x = padding.left + (i * chartWidth / (data.length - 1 || 1));
                                const y = height - padding.bottom - (point.value * yScale);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                        />
                        {data.map((point, i) => {
                            const x = padding.left + (i * chartWidth / (data.length - 1 || 1));
                            const y = height - padding.bottom - (point.value * yScale);
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={color}
                                    className="transition-all hover:r-6"
                                />
                            );
                        })}
                    </>
                )}

                {/* X-axis labels */}
                {data.map((point, i) => {
                    const x = type === 'bar' 
                        ? padding.left + (i * chartWidth / data.length) + (chartWidth / data.length) / 2
                        : padding.left + (i * chartWidth / (data.length - 1 || 1));
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - padding.bottom + 20}
                            textAnchor="middle"
                            className="text-xs fill-gray-500 dark:fill-gray-400"
                        >
                            {point.label}
                        </text>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="absolute bg-brand-navy dark:bg-brand-light-card text-white dark:text-brand-light-text p-2 rounded shadow-lg text-xs pointer-events-none border border-brand-gray dark:border-brand-light-border z-10"
                    style={{
                        left: tooltip.x + 10,
                        top: tooltip.y - 40,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="font-bold">{tooltip.content.label}</div>
                    <div>{formatValue(tooltip.content.value)}</div>
                    {showBreakdown && tooltip.content.breakdown && tooltip.content.breakdown.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-gray-600 dark:border-gray-300">
                            {tooltip.content.breakdown.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between gap-2">
                                    <span>{item.name}:</span>
                                    <span className="font-semibold">{formatValue(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

interface PerformanceDashboardPageProps {
    allData: { [dateKey: string]: DayData };
    transactions: Transaction[];
    users: User[];
    contextualUserId: string | null;
    setContextualUserId: (userId: string | null) => void;
    eodSubmissions: EODSubmissions;
}

const PerformanceDashboardPage: React.FC<PerformanceDashboardPageProps> = ({
    allData,
    transactions,
    users,
    contextualUserId,
    setContextualUserId,
    eodSubmissions
}) => {
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [chartMetric, setChartMetric] = useState<ChartMetric>('revenue');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof AnalysisData | 'userName'; direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' });
    const [modalData, setModalData] = useState<{ label: string; metric: ChartMetric; data: RawDetailData; usersById: { [key: string]: User } } | null>(null);
    const [alertsModalData, setAlertsModalData] = useState<{ userName: string; userId: string } | null>(null);
    const [aiEvaluation, setAiEvaluation] = useState<string>('');
    const [isEvaluating, setIsEvaluating] = useState(false);

    // DEBUG: Log transactions when component receives them
    useEffect(() => {
        console.log('[PERF DASHBOARD] Received transactions:', transactions.length);
        if (transactions.length > 0) {
            console.log('[PERF DASHBOARD] First transaction:', transactions[0]);
            console.log('[PERF DASHBOARD] Sample transaction dates:', transactions.slice(0, 5).map(t => t.date));
        }
    }, [transactions]);

    const salesReps = useMemo(() => {
        return users.filter(u => u.role === 'Sales Rep' && u.status === 'Active');
    }, [users]);

    // DEBUG: Log salesReps
    useEffect(() => {
        console.log('[PERF DASHBOARD] Sales Reps:', salesReps.map(r => ({ id: r.id, name: r.name })));
    }, [salesReps]);

    const usersById = useMemo(() => {
        const map: { [key: string]: User } = {};
        users.forEach(u => { map[u.id] = u; });
        return map;
    }, [users]);

    const focusedUser = useMemo(() => {
        if (contextualUserId) {
            return salesReps.find(u => u.id === contextualUserId) || null;
        }
        return null;
    }, [contextualUserId, salesReps]);

    const handleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const processData = (start: string, end: string): RawHistoricalData => {
        const labels: string[] = [];
        const rawData: Record<string, Record<ChartMetric, number[]>> = {};
        const summaryData: Record<string, HistoricalSummary> = {};

        salesReps.forEach(rep => {
            rawData[rep.id] = { revenue: [], appts: [], calls: [], leads: [] };
            summaryData[rep.id] = { userId: rep.id, userName: rep.name, revenue: 0, appts: 0, calls: 0, leads: 0, deals: 0 };
        });

        const startDate = new Date(start);
        const endDate = new Date(end);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            labels.push(dateKey);

            salesReps.forEach(rep => {
                const dayData = allData[dateKey];
                const userTransactions = transactions.filter(t => t.date === dateKey && t.userId === rep.id);
                
                // DEBUG: Log filtering results for first date
                if (labels.length === 1) {
                    console.log(`[PERF DASHBOARD] Date: ${dateKey}, Rep: ${rep.name} (${rep.id})`);
                    console.log(`[PERF DASHBOARD] Matching transactions:`, userTransactions.length);
                    console.log(`[PERF DASHBOARD] All transactions for this date:`, transactions.filter(t => t.date === dateKey).length);
                    if (userTransactions.length > 0) {
                        console.log(`[PERF DASHBOARD] First matching transaction:`, userTransactions[0]);
                    }
                }
                
                const dayRevenue = userTransactions.reduce((sum, t) => sum + t.amount, 0);
                const userContacts = dayData?.prospectingContacts?.filter(c => c.userId === rep.id) || [];
                const dayAppts = userContacts.filter(c => c.prospecting.SA).length;
                const dayCalls = userContacts.filter(c => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM).length;
                const dayLeads = userContacts.filter(c => c.name).length;

                rawData[rep.id].revenue.push(dayRevenue);
                rawData[rep.id].appts.push(dayAppts);
                rawData[rep.id].calls.push(dayCalls);
                rawData[rep.id].leads.push(dayLeads);

                summaryData[rep.id].revenue += dayRevenue;
                summaryData[rep.id].appts += dayAppts;
                summaryData[rep.id].calls += dayCalls;
                summaryData[rep.id].leads += dayLeads;
                summaryData[rep.id].deals += userTransactions.length;
            });
        }
        
        // DEBUG: Log final summary
        console.log('[PERF DASHBOARD] Final summary data:', summaryData);
        
        return { labels, rawData, summaryData };
    };

    useEffect(() => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        setSelectedDateRange({
            start: startOfYear.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        });
    }, []);

    const historicalData = useMemo(() => {
        if (!selectedDateRange.start || !selectedDateRange.end) {
            return { labels: [], rawData: {}, summaryData: {} };
        }
        return processData(selectedDateRange.start, selectedDateRange.end);
    }, [selectedDateRange, allData, transactions, salesReps]);

    const chartData = useMemo(() => {
        const { labels, rawData } = historicalData;
        const usersToShow = selectedUsers.length > 0 ? selectedUsers : salesReps.map(r => r.id);

        const datasets: HistoricalDataset[] = usersToShow.map(userId => {
            const user = usersById[userId];
            return {
                userId,
                userName: user?.name || 'Unknown',
                color: user?.color || '#10b981',
                data: rawData[userId]?.[chartMetric] || []
            };
        });

        return { labels, datasets };
    }, [historicalData, chartMetric, selectedUsers, salesReps, usersById]);

    const interactiveChartData = useMemo(() => {
        const { labels } = historicalData;
        return labels.map((label, i) => {
            let totalValue = 0;
            const breakdown: { name: string; value: number }[] = [];
            const details: RawDetailData = { revenue: [], appts: [], calls: [], leads: [] };

            chartData.datasets.forEach(ds => {
                const value = ds.data[i] || 0;
                totalValue += value;
                if (value > 0) {
                    breakdown.push({ name: ds.userName, value });
                }
            });

            const dateKey = label;
            const usersToShow = selectedUsers.length > 0 ? selectedUsers : salesReps.map(r => r.id);
            usersToShow.forEach(userId => {
                const userTransactions = transactions.filter(t => t.date === dateKey && t.userId === userId);
                details.revenue.push(...userTransactions);

                const dayData = allData[dateKey];
                const userContacts = dayData?.prospectingContacts?.filter(c => c.userId === userId) || [];
                details.appts.push(...userContacts.filter(c => c.prospecting.SA));
                details.calls.push(...userContacts.filter(c => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM));
                details.leads.push(...userContacts.filter(c => c.name));
            });

            return { label, value: totalValue, breakdown, details };
        });
    }, [chartData, historicalData, transactions, allData, selectedUsers, salesReps]);

    const analysisData = useMemo<AnalysisData[]>(() => {
        return Object.values(historicalData.summaryData).map(summary => {
            const avgDealSize = summary.deals > 0 ? summary.revenue / summary.deals : 0;
            const callToApptRate = summary.calls > 0 ? (summary.appts / summary.calls) * 100 : 0;
            const apptToDealRate = summary.appts > 0 ? (summary.deals / summary.appts) * 100 : 0;
            const leadToDealRate = summary.leads > 0 ? (summary.deals / summary.leads) * 100 : 0;
            return { ...summary, avgDealSize, callToApptRate, apptToDealRate, leadToDealRate };
        });
    }, [historicalData]);

    const sortedAnalysisData = useMemo(() => {
        const sorted = [...analysisData];
        sorted.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
        return sorted;
    }, [analysisData, sortConfig]);

    const requestSort = (key: keyof AnalysisData | 'userName') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortableHeader: React.FC<{ headerKey: keyof AnalysisData; label: string }> = ({ headerKey, label }) => (
        <th className="p-2 cursor-pointer hover:bg-brand-light-bg dark:hover:bg-brand-gray/50" onClick={() => requestSort(headerKey)}>
            {label} {sortConfig.key === headerKey && (sortConfig.direction === 'asc' ? '▲' : '▼')}
        </th>
    );

    const handleEvaluatePerformance = async () => {
        if (!focusedUser) return;
        setIsEvaluating(true);
        try {
            const userSummary = historicalData.summaryData[focusedUser.id];
            if (!userSummary) {
                setAiEvaluation('No data available for this user in the selected date range.');
                return;
            }

            const avgDealSize = userSummary.deals > 0 ? userSummary.revenue / userSummary.deals : 0;
            const callToApptRate = userSummary.calls > 0 ? (userSummary.appts / userSummary.calls) * 100 : 0;
            const apptToDealRate = userSummary.appts > 0 ? (userSummary.deals / userSummary.appts) * 100 : 0;

            const evaluation = await getPerformanceEvaluation({
                userName: focusedUser.name,
                dateRange: `${selectedDateRange.start} to ${selectedDateRange.end}`,
                revenue: userSummary.revenue,
                deals: userSummary.deals,
                avgDealSize,
                calls: userSummary.calls,
                appts: userSummary.appts,
                leads: userSummary.leads,
                callToApptRate,
                apptToDealRate
            });

            setAiEvaluation(evaluation);
        } catch (error) {
            console.error('Error getting AI evaluation:', error);
            setAiEvaluation('Failed to generate evaluation. Please try again.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const handlePointClick = (data: any) => {
        setModalData({ label: data.label, metric: chartMetric, data: data.details, usersById });
    };

    const metricFormatters: Record<ChartMetric, (value: number) => string> = {
        revenue: (v) => formatCurrency(v),
        appts: formatNumber,
        calls: formatNumber,
        leads: formatNumber
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <ActivityDetailModal isOpen={!!modalData} onClose={() => setModalData(null)} modalData={modalData} />
            <AlertsDetailModal
                isOpen={!!alertsModalData}
                onClose={() => setAlertsModalData(null)}
                userName={alertsModalData?.userName || ''}
                userId={alertsModalData?.userId || ''}
                eodSubmissions={eodSubmissions}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">
                    {focusedUser ? `${focusedUser.name}'s Performance` : 'Team Performance Dashboard'}
                </h1>
                {focusedUser && (
                    <button
                        onClick={() => setContextualUserId(null)}
                        className="px-4 py-2 bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white rounded-lg hover:bg-brand-light-bg dark:hover:bg-brand-gray transition"
                    >
                        ← Back to Team View
                    </button>
                )}
            </div>

            <ReportWidget title="Date Range">
                <DatePicker
                    startDate={selectedDateRange.start}
                    endDate={selectedDateRange.end}
                    onStartDateChange={(date) => setSelectedDateRange(prev => ({ ...prev, start: date }))}
                    onEndDateChange={(date) => setSelectedDateRange(prev => ({ ...prev, end: date }))}
                />
            </ReportWidget>

            {focusedUser && (
                <ReportWidget title="AI PERFORMANCE COACH">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Select one sales rep to generate an AI-powered performance evaluation for the selected date range.
                    </p>
                    <button
                        onClick={handleEvaluatePerformance}
                        disabled={isEvaluating}
                        className="w-full py-3 bg-brand-lime text-brand-navy font-bold rounded-lg hover:bg-brand-lime/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEvaluating ? 'Evaluating...' : 'Evaluate Performance'}
                    </button>
                    {aiEvaluation && (
                        <div className="mt-4 p-4 bg-brand-light-bg dark:bg-brand-gray/20 rounded-lg text-sm text-brand-light-text dark:text-white whitespace-pre-wrap">
                            {aiEvaluation}
                        </div>
                    )}
                </ReportWidget>
            )}

            <ReportWidget title="LEADERBOARD">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="p-2 cursor-pointer hover:bg-brand-light-bg dark:hover:bg-brand-gray/50" onClick={() => requestSort('userName')}>Rep Name</th>
                                <SortableHeader headerKey="revenue" label="Revenue" />
                                <SortableHeader headerKey="deals" label="Deals" />
                                <SortableHeader headerKey="avgDealSize" label="Avg Deal" />
                                <SortableHeader headerKey="calls" label="Calls" />
                                <SortableHeader headerKey="appts" label="Appts" />
                                <SortableHeader headerKey="callToApptRate" label="Call ▸ Appt %" />
                                <SortableHeader headerKey="apptToDealRate" label="Appt ▸ Deal %" />
                                <SortableHeader headerKey="leadToDealRate" label="Lead ▸ Deal %" />
                                <th className="p-2">EOD Alerts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAnalysisData.map(row => {
                                const user = usersById[row.userId];
                                const missedEODs = (() => {
                                    const today = new Date();
                                    let count = 0;
                                    for (let i = 0; i < 30; i++) {
                                        const d = new Date();
                                        d.setDate(today.getDate() - i);
                                        const dayOfWeek = d.getDay();
                                        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
                                        const dateKey = d.toISOString().split('T')[0];
                                        if (!eodSubmissions[row.userId]?.[dateKey]) count++;
                                    }
                                    return count;
                                })();

                                return (
                                    <tr key={row.userId} className="border-t border-brand-light-border dark:border-brand-gray hover:bg-brand-light-bg dark:hover:bg-brand-gray/20">
                                        <td className="p-2 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: user?.color || '#10b981' }}></span>
                                            <span className="font-semibold text-brand-light-text dark:text-white">{row.userName}</span>
                                        </td>
                                        <td className="p-2 text-brand-lime font-bold">{formatCurrency(row.revenue)}</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{row.deals}</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{formatCurrency(row.avgDealSize)}</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{row.calls}</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{row.appts}</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{row.callToApptRate.toFixed(1)}%</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{row.apptToDealRate.toFixed(1)}%</td>
                                        <td className="p-2 text-brand-light-text dark:text-white">{row.leadToDealRate.toFixed(1)}%</td>
                                        <td className="p-2">
                                            {missedEODs > 0 ? (
                                                <button
                                                    onClick={() => setAlertsModalData({ userName: row.userName, userId: row.userId })}
                                                    className="px-3 py-1 bg-brand-red text-white text-xs font-bold rounded hover:bg-brand-red/90 transition"
                                                >
                                                    {missedEODs} missed EODs
                                                </button>
                                            ) : (
                                                <span className="text-brand-lime text-xs font-bold">✓ All Clear</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ReportWidget>

            <ReportWidget title="ACTIVITY TRENDS">
                <ActivityTrendsWidgetV2
                    chartMetric={chartMetric}
                    setChartMetric={setChartMetric}
                    chartType={chartType}
                    setChartType={setChartType}
                    selectedUsers={selectedUsers}
                    handleUserSelection={handleUserSelection}
                    salesReps={salesReps}
                    interactiveChartData={interactiveChartData}
                    metricFormatters={metricFormatters}
                    handlePointClick={handlePointClick}
                />
            </ReportWidget>
        </div>
    );
};

export default PerformanceDashboardPage;
