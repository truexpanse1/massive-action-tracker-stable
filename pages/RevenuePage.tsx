

import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, formatCurrency } from '../types';
import Calendar from '../components/Calendar';
import IndustrySelector from '../components/IndustrySelector';
import RevenueAIEvaluator from '../components/RevenueAIEvaluator';
import DatePicker from '../components/DatePicker';
import BarChart from '../components/BarChart';


interface RevenuePageProps {
  transactions: Transaction[];
  onSaveTransaction: (transaction: Transaction) => Promise<void>;
  onDeleteTransaction: (transactionId: string) => Promise<void>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  initialState: { viewMode: 'daily' | 'analysis', dateRange?: { start: string, end: string }} | null;
  onInitialStateConsumed: () => void;
}

const RevenuePage: React.FC<RevenuePageProps> = ({ transactions, onSaveTransaction, onDeleteTransaction, selectedDate, onDateChange, initialState, onInitialStateConsumed }) => {
    const [viewMode, setViewMode] = useState<'daily' | 'analysis'>('daily');
    
    const [clientName, setClientName] = useState('');
    const [product, setProduct] = useState('');
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [userProducts, setUserProducts] = useState<string[]>(() => Array.from(new Set(transactions.map(t => t.product))));
    const [analyzedProduct, setAnalyzedProduct] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const [dateRange, setDateRange] = useState({ start: thirtyDaysAgo.toISOString().split('T')[0], end: today });

    const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

    useEffect(() => {
        if (initialState) {
            setViewMode(initialState.viewMode);
            if (initialState.dateRange) {
                setDateRange(initialState.dateRange);
            }
            onInitialStateConsumed();
        }
    }, [initialState, onInitialStateConsumed]);
    
    useEffect(() => { 
        resetForm();
        setAnalyzedProduct(null);
    }, [selectedDate]);
    
    const transactionsForSelectedDate = useMemo(() => {
        const key = getDateKey(selectedDate);
        return (transactions || []).filter(t => t.date === key).sort((a,b) => a.clientName.localeCompare(b.clientName));
    }, [transactions, selectedDate]);
    
    const uniqueProductsToday = useMemo(() => {
        return Array.from(new Set(transactionsForSelectedDate.map(t => t.product)));
    }, [transactionsForSelectedDate]);
    
    const contributionData = useMemo(() => {
        if (!analyzedProduct) return null;

        const date = selectedDate;
        const todayKey = date.toISOString().split('T')[0];
        
        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const startOfWeekKey = startOfWeek.toISOString().split('T')[0];
        const endOfWeekKey = endOfWeek.toISOString().split('T')[0];

        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();

        let totals = { day: 0, week: 0, month: 0, year: 0 };
        let productTotals = { day: 0, week: 0, month: 0, year: 0 };

        (transactions || []).forEach(t => {
            const transactionDate = new Date(t.date + 'T00:00:00');

            if (t.date === todayKey) totals.day += t.amount;
            if (t.date >= startOfWeekKey && t.date <= endOfWeekKey) totals.week += t.amount;
            if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) totals.month += t.amount;
            if (transactionDate.getFullYear() === currentYear) totals.year += t.amount;

            if (t.product === analyzedProduct) {
                if (t.date === todayKey) productTotals.day += t.amount;
                if (t.date >= startOfWeekKey && t.date <= endOfWeekKey) productTotals.week += t.amount;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) productTotals.month += t.amount;
                if (transactionDate.getFullYear() === currentYear) productTotals.year += t.amount;
            }
        });

        const calculatePercentage = (part: number, whole: number) => whole > 0 ? ((part / whole) * 100).toFixed(1) + '%' : '0.0%';

        return {
            day: calculatePercentage(productTotals.day, totals.day),
            week: calculatePercentage(productTotals.week, totals.week),
            month: calculatePercentage(productTotals.month, totals.month),
            year: calculatePercentage(productTotals.year, totals.year),
        };
    }, [analyzedProduct, transactions, selectedDate]);


    const analysisData = useMemo(() => {
        const { start, end } = dateRange;
        const filtered = (transactions || []).filter(t => t.date >= start && t.date <= end);
        
        const productBreakdown: Record<string, { revenue: number, count: number }> = {};
        let totalRevenue = 0;

        filtered.forEach(t => {
            if (!productBreakdown[t.product]) productBreakdown[t.product] = { revenue: 0, count: 0 };
            productBreakdown[t.product].revenue += t.amount;
            productBreakdown[t.product].count += 1;
            totalRevenue += t.amount;
        });

        const productChartData = Object.entries(productBreakdown).map(([product, data]) => ({ product, ...data })).sort((a, b) => b.revenue - a.revenue);
        const revenueOverTime: Record<string, number> = {};
        const startDate = new Date(start + 'T00:00:00'), endDate = new Date(end + 'T00:00:00');
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) revenueOverTime[d.toISOString().split('T')[0]] = 0;
        filtered.forEach(t => { revenueOverTime[t.date] = (revenueOverTime[t.date] || 0) + t.amount; });
        const timeChartData = Object.entries(revenueOverTime).map(([date, revenue]) => ({ date, revenue }));

        return { totalRevenue, totalTransactions: filtered.length, avgDealSize: filtered.length > 0 ? totalRevenue / filtered.length : 0, productChartData, timeChartData };

    }, [transactions, dateRange]);


    const resetForm = () => { setClientName(''); setProduct(''); setAmount(''); setIsRecurring(false); setEditingId(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const numericAmount = parseFloat(amount);
        if (!clientName || !product || isNaN(numericAmount) || numericAmount < 0) {
            alert('Please fill out all fields with valid data.');
            setIsSubmitting(false);
            return;
        }

        const transactionData: Transaction = {
            id: editingId || `new-${Date.now()}`,
            date: getDateKey(selectedDate),
            clientName, product, amount: numericAmount, isRecurring
        };
        
        try {
            await onSaveTransaction(transactionData);
            if (!userProducts.includes(product)) setUserProducts(prev => [...prev, product].sort());
            resetForm();
        } catch (error) {
            console.error("Failed to save transaction:", error);
            alert("Could not save the transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (transaction: Transaction) => { setEditingId(transaction.id); setClientName(transaction.clientName); setProduct(transaction.product); setAmount(transaction.amount.toString()); setIsRecurring(transaction.isRecurring); };
    const handleDelete = (id: string) => { if (window.confirm('Are you sure you want to delete this transaction?')) onDeleteTransaction(id); };
    const handleProductSelect = (productName: string) => { setProduct(productName); document.getElementById('clientNameInput')?.focus(); }
    
     const LineChart: React.FC<{data: {date: string, revenue: number}[]}> = ({data}) => {
        if (data.length === 0) return <p className="text-center text-sm text-gray-500 py-8">No data for this period.</p>;
        const width = 500, height = 200, padding = 30;
        const maxRevenue = Math.max(...data.map(d => d.revenue), 0);
        const yMax = maxRevenue === 0 ? 1000 : Math.ceil(maxRevenue * 1.1);
        const points = data.map((d, i) => `${(i / (data.length -1)) * (width - padding*2) + padding},${height - padding - (d.revenue / yMax) * (height - padding*2)}`).join(' ');
        return ( <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto"><line x1={padding} y1={height - padding} x2={width - padding} y2={height-padding} stroke="#4b5563" /><line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#4b5563" /><polyline fill="none" stroke="#34D399" strokeWidth="2" points={points} /><text x="10" y="15" className="text-[10px] fill-gray-400">{formatCurrency(yMax)}</text><text x="10" y={height-padding+3} className="text-[10px] fill-gray-400">{formatCurrency(0)}</text></svg> );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h1 className="text-2xl font-bold text-brand-light-text dark:text-white">Revenue Center</h1>
                <div className="flex items-center bg-brand-light-bg dark:bg-brand-ink p-1 rounded-lg border border-brand-light-border dark:border-brand-gray">
                    <button onClick={() => setViewMode('daily')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'daily' ? 'bg-brand-blue text-white' : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'}`}>Daily Entry</button>
                    <button onClick={() => setViewMode('analysis')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${viewMode === 'analysis' ? 'bg-brand-blue text-white' : 'text-gray-500 dark:text-gray-400 hover:text-brand-light-text dark:hover:text-white'}`}>Analysis</button>
                </div>
            </div>

            {viewMode === 'daily' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="space-y-8"><Calendar selectedDate={selectedDate} onDateChange={onDateChange} /><IndustrySelector onProductSelect={handleProductSelect} /></div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">{editingId ? 'EDIT' : 'ADD'} TRANSACTION</h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><input id="clientNameInput" type="text" placeholder="Client / Company Name" value={clientName} onChange={e => setClientName(e.target.value)} required className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" /><div><input list="product-list" type="text" placeholder="Product / Service" value={product} onChange={e => setProduct(e.target.value)} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" /><datalist id="product-list">{userProducts.map(p => <option key={p} value={p} />)}</datalist></div></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center"><input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid" /><label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-500 dark:text-gray-400"><input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded bg-brand-light-border dark:bg-brand-gray border-gray-300 dark:border-gray-600 text-brand-lime focus:ring-brand-lime" /><span>Recurring (MCV)</span></label></div>
                                <div className="flex items-center gap-2 pt-2"><button type="submit" disabled={isSubmitting} className="flex-grow bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-brand-gray">{isSubmitting ? 'Saving...' : (editingId ? 'Update Transaction' : 'Add Transaction')}</button>{editingId && <button type="button" onClick={resetForm} className="bg-brand-gray text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>}</div>
                            </form>
                        </div>
                         <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                            <h3 className="text-lg font-bold mb-2 text-brand-light-text dark:text-white">Transactions for {selectedDate.toLocaleDateString()}</h3>
                            <div className="overflow-x-auto max-h-96">
                                 <table className="w-full text-sm text-left"><thead className="bg-brand-light-bg dark:bg-brand-gray/50 text-xs uppercase text-gray-500 dark:text-gray-400 sticky top-0"><tr><th className="p-2">Client</th><th className="p-2">Product</th><th className="p-2 text-right">Amount</th><th className="p-2 text-center">MCV</th><th className="p-2 text-right">ACV</th><th className="p-2 text-center">Actions</th></tr></thead>
                                    <tbody>{transactionsForSelectedDate.map(t => (<tr key={t.id} className="border-b border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white"><td className="p-2 font-medium">{t.clientName}</td><td className="p-2 text-gray-500 dark:text-gray-400">{t.product}</td><td className="p-2 text-right font-semibold text-brand-lime">{formatCurrency(t.amount)}</td><td className="p-2 text-center">{t.isRecurring ? '✅' : '-'}</td><td className="p-2 text-right text-gray-500 dark:text-gray-400">{t.isRecurring ? formatCurrency(t.amount * 12) : '-'}</td><td className="p-2 text-center space-x-2"><button onClick={() => handleEdit(t)} className="text-xs text-blue-400 hover:underline">Edit</button><button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:underline">Del</button></td></tr>))}
                                        {transactionsForSelectedDate.length === 0 && (<tr><td colSpan={6} className="text-center p-4 text-gray-500 dark:text-gray-400">No transactions for this day.</td></tr>)}</tbody>
                                </table>
                            </div>
                            {uniqueProductsToday.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-dashed border-brand-light-border dark:border-brand-gray">
                                    <h4 className="text-md font-bold text-brand-light-text dark:text-white mb-3">Product Contribution Analysis</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Select a product from today's transactions to see its revenue contribution to the total sales for different periods (relative to {selectedDate.toLocaleDateString()}).</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {uniqueProductsToday.map(product => (
                                            <button
                                                key={product}
                                                onClick={() => setAnalyzedProduct(product)}
                                                className={`text-xs font-bold py-1 px-3 rounded-full transition-colors ${analyzedProduct === product ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'}`}
                                            >
                                                {product}
                                            </button>
                                        ))}
                                    </div>
                                    {analyzedProduct && contributionData && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-brand-light-bg dark:bg-brand-ink rounded-lg animate-fade-in">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.day}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Day's Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.week}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Week's Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.month}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Month's Revenue</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-brand-blue">{contributionData.year}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">of Year's Revenue</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray flex flex-col md:flex-row items-center justify-between gap-4"><h2 className="text-lg font-bold text-brand-light-text dark:text-white">Date Range Analysis</h2><div className="flex items-center gap-2"><DatePicker value={dateRange.start} onChange={value => setDateRange(prev => ({...prev, start: value}))} className="w-32" /><span className="font-semibold text-gray-500">to</span><DatePicker value={dateRange.end} onChange={value => setDateRange(prev => ({...prev, end: value}))} className="w-32" /></div></div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center"><h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Revenue</h4><p className="text-4xl font-black text-brand-lime">{formatCurrency(analysisData.totalRevenue)}</p></div>
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center"><h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Transactions</h4><p className="text-4xl font-black text-brand-light-text dark:text-white">{analysisData.totalTransactions}</p></div>
                         <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center"><h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Avg. Deal Size</h4><p className="text-4xl font-black text-brand-blue">{formatCurrency(analysisData.avgDealSize)}</p></div>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray"><h3 className="text-lg font-bold mb-4 text-brand-light-text dark:text-white">Top Products by Revenue</h3><BarChart data={analysisData.productChartData.map(d => ({ name: d.product, revenue: d.revenue }))} /></div>
                        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray"><h3 className="text-lg font-bold mb-4 text-brand-light-text dark:text-white">Revenue Over Time</h3><LineChart data={analysisData.timeChartData} /></div>
                     </div>
                     <RevenueAIEvaluator productData={analysisData.productChartData} timeframeText={`${dateRange.start} to ${dateRange.end}`} />
                </div>
            )}
        </div>
    );
};

export default RevenuePage;