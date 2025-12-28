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
    const yMax = maxValue === 0 ? 100 : Math.ceil(maxValue / 4 / 10) * 10 * 4;
    const yTicks = [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax];
    
    const stepX = chartWidth / (data.length > 1 ? data.length - 1 : 1);

    const handleMouseOver = (e: React.MouseEvent, pointData: any, index: number) => {
        if (!svgRef.current) return;
        const tooltipWidth = 160;
        const svgRect = svgRef.current.getBoundingClientRect();
        
        let x = e.clientX - svgRect.left + 15;
        let y = e.clientY - svgRect.top;

        if (x + tooltipWidth > svgRect.width) {
            x = e.clientX - svgRect.left - tooltipWidth - 15;
        }
        
        setTooltip({ content: pointData, x, y });
    };
    
    const xLabels = data.map(d => d.label);
    let labelStep = 1;
    if (data.length > 10) labelStep = 2;
    if (data.length > 20) labelStep = 5;

    return (
        <div className="relative w-full h-full">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {yTicks.map(tick => {
                    const y = padding.top + chartHeight - (tick / yMax) * chartHeight;
                    return (
                        <g key={tick} className="text-gray-400 dark:text-gray-600 text-[10px]">
                            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeDasharray="2,2" />
                            <text x={padding.left - 8} y={y + 3} textAnchor="end" className="fill-current">{formatValue(tick)}</text>
                        </g>
                    );
                })}
                
                {data.map((d, i) => {
                    const x = padding.left + i * stepX;
                    return (
                        <g key={`x-axis-${i}`}>
                          <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeDasharray="2,2" />
                          {i % labelStep === 0 && (
                            <text x={x} y={height - 5} textAnchor="middle" className="text-gray-400 dark:text-gray-500 text-[10px] fill-current">{d.label.replace(' ', '\n')}</text>
                          )}
                        </g>
                    );
                })}

                {/* Data points */}
                {type === 'line' && (
                    <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        points={data.map((d, i) => {
                            const x = padding.left + i * stepX;
                            const y = yMax > 0 ? padding.top + chartHeight - (d.value / yMax) * chartHeight : padding.top + chartHeight;
                            return `${x},${y}`;
                        }).join(' ')}
                    />
                )}
                {data.map((d, i) => {
                    const x = padding.left + i * stepX;
                    const y = yMax > 0 ? padding.top + chartHeight - (d.value / yMax) * chartHeight : padding.top + chartHeight;
                    const barWidth = data.length > 1 ? stepX * 0.6 : chartWidth * 0.6;
                    
                    return (
                        <g key={`data-${i}`}>
                            {type === 'bar' && (
                                <rect
                                    x={x - barWidth / 2}
                                    y={y}
                                    width={barWidth}
                                    height={padding.top + chartHeight - y}
                                    fill={color}
                                    className="opacity-70"
                                    onMouseOver={(e) => handleMouseOver(e, d, i)}
                                    onMouseOut={() => setTooltip(null)}
                                    onClick={() => onPointClick && onPointClick(d)}
                                />
                            )}
                             {type === 'line' && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={color}
                                    className="cursor-pointer"
                                    onMouseOver={(e) => handleMouseOver(e, d, i)}
                                    onMouseOut={() => setTooltip(null)}
                                    onClick={() => onPointClick && onPointClick(d)}
                                />
                             )}
                        </g>
                    );
                })}
            </svg>
            {tooltip && (
                <div 
                    className="absolute bg-brand-navy text-white text-xs rounded p-2 shadow-lg pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <p className="font-bold">{tooltip.content.label}</p>
                    <p>Value: {formatValue(tooltip.content.value)}</p>
                    {showBreakdown && tooltip.content.breakdown && (
                        <div className="mt-1 border-t border-brand-gray pt-1">
                            {tooltip.content.breakdown.map((item: any) => (
                                <p key={item.name}>{item.name}: {formatValue(item.value)}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TeamKPIAnalysis: React.FC<{ summaryData: HistoricalSummary[] }> = ({ summaryData }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof AnalysisData; direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' });

    const analysisTableData = useMemo(() => {
        const data: AnalysisData[] = summaryData.map(summary => ({
            ...summary,
            avgDealSize: summary.deals > 0 ? summary.revenue / summary.deals : 0,
            callToApptRate: summary.calls > 0 ? (summary.appts / summary.calls) * 100 : 0,
            apptToDealRate: summary.appts > 0 ? (summary.deals / summary.appts) * 100 : 0,
            leadToDealRate: summary.leads > 0 ? (summary.deals / summary.leads) * 100 : 0,
        }));

        data.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return data;
    }, [summaryData, sortConfig]);

    const requestSort = (key: keyof AnalysisData) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ headerKey: keyof AnalysisData, label: string }> = ({ headerKey, label }) => {
        const isSorted = sortConfig.key === headerKey;
        const icon = isSorted ? (sortConfig.direction === 'desc' ? '▼' : '▲') : '';
        return (
            <th className="p-2 text-right cursor-pointer hover:bg-brand-light-bg dark:hover:bg-brand-gray/50" onClick={() => requestSort(headerKey)}>
                {label} <span className="text-xs">{icon}</span>
            </th>
        );
    };

    return (
        <ReportWidget title="Team KPI Analysis">
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
                        </tr>
                    </thead>
                    <tbody>
                        {analysisTableData.map(rep => (
                            <tr key={rep.userId} className="border-t border-brand-light-border dark:border-brand-gray font-medium text-brand-light-text dark:text-white">
                                <td className="p-2">{rep.userName}</td>
                                <td className="p-2 text-right font-bold text-brand-lime">{formatCurrency(rep.revenue)}</td>
                                <td className="p-2 text-right">{rep.deals}</td>
                                <td className="p-2 text-right">{formatCurrency(rep.avgDealSize)}</td>
                                <td className="p-2 text-right">{rep.calls}</td>
                                <td className="p-2 text-right">{rep.appts}</td>
                                <td className="p-2 text-right">{rep.callToApptRate.toFixed(1)}%</td>
                                <td className="p-2 text-right">{rep.apptToDealRate.toFixed(1)}%</td>
                                <td className="p-2 text-right">{rep.leadToDealRate.toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ReportWidget>
    );
};


// --- MAIN COMPONENT ---
interface PerformanceDashboardPageProps {
    allData: { [key: string]: DayData };
    transactions: Transaction[];
    users: User[];
    contextualUserId: string | null;
    setContextualUserId: (id: string | null) => void;
    eodSubmissions: EODSubmissions;
}

const PerformanceDashboardPage: React.FC<PerformanceDashboardPageProps> = ({ allData, transactions, users, contextualUserId, setContextualUserId, eodSubmissions }) => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const [dateRange, setDateRange] = useState({
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
    });

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [activeMetric, setActiveMetric] = useState<ChartMetric>('revenue');
    const [chartType, setChartType] = useState<ChartType>('line');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis'>('dashboard');


    // AI Evaluation State
    const [aiEval, setAiEval] = useState<{ score: number; suggestions: string; } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // Modal State
    const [detailModalData, setDetailModalData] = useState<{ label: string; metric: ChartMetric; data: RawDetailData, usersById: {[key: string]: User} } | null>(null);
    const [alertsModalUser, setAlertsModalUser] = useState<User | null>(null);

    const salesReps = useMemo(() => users.filter(u => u.role === 'Sales Rep' && u.status === 'Active'), [users]);
    const usersById = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);
    const userColors = useMemo(() => {
        const colors = ['#2F81F7', '#34D399', '#FBBF24', '#A855F7', '#E53E3E', '#EC4899', '#06B6D4'];
        return Object.fromEntries(salesReps.map((rep, i) => [rep.id, colors[i % colors.length]]));
    }, [salesReps]);

    // Set initial selected users
    useEffect(() => {
        if (contextualUserId) {
            setSelectedUsers([contextualUserId]);
        } else if (salesReps.length > 0) {
            setSelectedUsers(salesReps.map(r => r.id));
        }
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
        
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            labels.push(dateKey);

            salesReps.forEach(rep => {
                const dayData = allData[dateKey];
                const userTransactions = transactions.filter(t => t.date === dateKey && t.userId === rep.id);
                
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
        return { labels, rawData, summaryData };
    };

    const historicalData = useMemo(() => processData(dateRange.start, dateRange.end), [dateRange, allData, transactions]);

    const chartData = useMemo((): HistoricalReport => {
        const datasets = selectedUsers.map(userId => {
            const user = salesReps.find(r => r.id === userId);
            return {
                userId: userId,
                userName: user?.name || 'Unknown',
                color: userColors[userId],
                data: historicalData.rawData[userId]?.[activeMetric] || [],
            };
        });
        
        const summary = Object.keys(historicalData.summaryData)
            .map(key => historicalData.summaryData[key])
            .sort((a, b) => b.revenue - a.revenue);

        return { labels: historicalData.labels.map(l => new Date(l + 'T00:00:00').toLocaleDateString('en-us', {month: 'short', day: 'numeric'})), datasets, summary };
    }, [historicalData, selectedUsers, activeMetric, userColors, salesReps]);
    
    // AI Evaluation Logic
    const handleAIEvaluation = async () => {
        if (selectedUsers.length !== 1) {
            alert("Please select exactly one sales rep to evaluate.");
            return;
        }
        setIsAiLoading(true);
        setAiEval(null);

        const repId = selectedUsers[0];
        const summary = historicalData.summaryData[repId];
        const timeframeDays = (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 3600 * 24) + 1;
        
        try {
            const result = await getPerformanceEvaluation({
                revenue: summary.revenue,
                calls: summary.calls,
                appts: summary.appts,
                deals: summary.deals,
                timeframeDays: Math.round(timeframeDays)
            });
            setAiEval(result);
        } catch (error) {
            console.error(error);
            alert("Failed to get AI evaluation.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const alerts = useMemo(() => {
        return salesReps.map(user => {
            let missedReports = 0;
            const today = new Date();
            for (let i = 1; i <= 30; i++) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                if (d.getDay() === 0 || d.getDay() === 6) continue;
                const dateKey = d.toISOString().split('T')[0];
                if (!eodSubmissions[user.id]?.[dateKey]) {
                    missedReports++;
                }
            }
            return { user, missedReports };
        }).filter(alert => alert.missedReports >= 3)
        .sort((a,b) => b.missedReports - a.missedReports);
    }, [salesReps, eodSubmissions]);


    return (
        <>
        <ActivityDetailModal isOpen={!!detailModalData} onClose={() => setDetailModalData(null)} modalData={detailModalData} />
        <AlertsDetailModal isOpen={!!alertsModalUser} onClose={() => setAlertsModalUser(null)} userName={alertsModalUser?.name || ''} userId={alertsModalUser?.id || ''} eodSubmissions={eodSubmissions} />
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-brand-light-text dark:text-white">Performance Dashboard</h1>
                {contextualUserId && <button onClick={() => { setContextualUserId(null); setSelectedUsers(salesReps.map(r => r.id)); }} className="text-sm text-brand-blue hover:underline">&larr; Back to Full Dashboard</button>}
                <div className="flex items-center gap-2">
                    <DatePicker value={dateRange.start} onChange={value => setDateRange(prev => ({ ...prev, start: value }))} />
                    <span className="font-semibold text-gray-500">to</span>
                    <DatePicker value={dateRange.end} onChange={value => setDateRange(prev => ({ ...prev, end: value }))} />
                </div>
            </div>

            <div className="flex items-center border-b border-brand-light-border dark:border-brand-gray">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 dark:text-gray-400 hover:text-brand-blue/80'}`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'analysis' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 dark:text-gray-400 hover:text-brand-blue/80'}`}
                >
                    KPI Analysis
                </button>
            </div>
            
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    <div className="lg:col-span-3 space-y-6">
                        <ReportWidget title="Select Sales Reps">
                            <div className="space-y-2">
                            {salesReps.map(rep => (
                                <label key={rep.id} className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" checked={selectedUsers.includes(rep.id)} onChange={() => handleUserSelection(rep.id)}
                                        className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500" style={{ accentColor: userColors[rep.id] }} />
                                    <span className="text-sm font-medium text-brand-light-text dark:text-white">{rep.name}</span>
                                </label>
                            ))}
                            </div>
                        </ReportWidget>

                        <ReportWidget title="Alerts & Notifications">
                            {alerts.length > 0 ? (
                            <ul className="space-y-2">
                                {alerts.map(({user, missedReports}) => (
                                    <li key={user.id} className="text-sm flex justify-between items-center">
                                        <span className="text-brand-light-text dark:text-gray-300">{user.name}</span>
                                        <button onClick={() => setAlertsModalUser(user)} className="text-brand-red font-bold hover:underline">{missedReports} missed EODs</button>
                                    </li>
                                ))}
                            </ul>
                            ) : <p className="text-xs text-gray-500">No critical alerts.</p>}
                        </ReportWidget>

                        <ReportWidget title="AI Performance Coach">
                            <div className="space-y-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Select one sales rep to generate an AI-powered performance evaluation for the selected date range.</p>
                                <button onClick={handleAIEvaluation} disabled={isAiLoading || selectedUsers.length !== 1} className="w-full bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-brand-gray">
                                    {isAiLoading ? 'Analyzing...' : 'Evaluate Performance'}
                                </button>
                                {aiEval && (
                                    <div className="p-3 bg-brand-light-bg dark:bg-brand-gray/20 rounded-md animate-fade-in">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-brand-light-text dark:text-white">Activity Score:</h4>
                                            <p className="text-2xl font-black text-brand-lime">{aiEval.score}<span className="text-base">/100</span></p>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            <h5 className="font-bold mb-1">Suggestions:</h5>
                                            {aiEval.suggestions}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ReportWidget>
                    </div>
                    <div className="lg:col-span-9 space-y-6">
                        <ReportWidget title="Leaderboard">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <tr>
                                            <th className="p-2">Rep</th>
                                            <th className="p-2 text-right">Revenue</th>
                                            <th className="p-2 text-right">Deals</th>
                                            <th className="p-2 text-right">Appts</th>
                                            <th className="p-2 text-right">Calls</th>
                                            <th className="p-2 text-right">Leads</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartData.summary.map(s => (
                                            <tr key={s.userId} className={`border-t border-brand-light-border dark:border-brand-gray font-medium ${selectedUsers.includes(s.userId) ? 'text-brand-light-text dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                                <td className="p-2 flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{backgroundColor: userColors[s.userId]}}></span>{s.userName}</td>
                                                <td className="p-2 text-right font-bold text-brand-lime">{formatCurrency(s.revenue)}</td>
                                                <td className="p-2 text-right">{s.deals}</td>
                                                <td className="p-2 text-right">{s.appts}</td>
                                                <td className="p-2 text-right">{s.calls}</td>
                                                <td className="p-2 text-right">{s.leads}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ReportWidget>

                                              <ReportWidget title="Activity Trends">
                            <ActivityTrendsWidgetV2
                                labels={chartData.labels}
                                rawData={historicalData.rawData}
                                selectedUsers={selectedUsers}
                                userColors={userColors}
                                usersById={usersById}
                            />
                        </ReportWidget>
                    </div>
                </div>
            )}

            {activeTab === 'analysis' && (
                <div className="animate-fade-in">
                    <TeamKPIAnalysis summaryData={chartData.summary} />
                </div>
            )}
        </div>
        </>
    );
};

export default PerformanceDashboardPage;