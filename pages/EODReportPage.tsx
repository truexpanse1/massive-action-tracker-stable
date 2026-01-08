

import React, { useState, useMemo, useEffect } from 'react';
import { DayData, Transaction, getInitialDayData, formatCurrency, Contact } from '../types';
import Calendar from '../components/Calendar';
import EODPerformanceChart from '../components/EODPerformanceChart';
import DreamClientStudioStats from '../components/DreamClientStudioStats';
import { supabase } from '../src/services/supabaseClient';

// --- PROPS INTERFACE ---
interface EODReportPageProps {
  allData: { [key: string]: DayData };
  hotLeads: Contact[];
  transactions: Transaction[];
  onSubmission: (dateKey: string) => void;
  onDataChange: (dateKey: string, data: DayData) => void;
  userId: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// --- SUB-COMPONENTS ---
const KPI_Card: React.FC<{
  label: string;
  value: string | number;
  isInput?: boolean;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
}> = ({ label, value, isInput = false, onInputChange, disabled }) => (
  <div className="bg-brand-light-bg dark:bg-brand-gray/20 p-3 rounded-md">
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</p>
    {isInput ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onInputChange?.(e.target.value)}
        disabled={disabled}
        placeholder="e.g., 2.5 hours"
        className="w-full bg-transparent text-2xl font-black text-brand-light-text dark:text-white mt-1 p-0 border-none focus:ring-0"
      />
    ) : (
      <p className="text-2xl font-black text-brand-light-text dark:text-white mt-1">{value}</p>
    )}
  </div>
);

const Column: React.FC<{ title: string; subtitle: string; children: React.ReactNode; }> = ({ title, subtitle, children }) => (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
        <h2 className="text-lg font-bold text-brand-light-text dark:text-white">{title}</h2>
        <p className="text-xs text-brand-red font-semibold mb-4">{subtitle}</p>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);


// --- MAIN COMPONENT ---
const EODReportPage: React.FC<EODReportPageProps> = ({ allData, hotLeads, transactions, onSubmission, onDataChange, userId, selectedDate, onDateChange }) => {
    const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
    const currentDateKey = getDateKey(selectedDate);
    
    const [talkTime, setTalkTime] = useState('');
    const [contentPostedCount, setContentPostedCount] = useState(0);

    const currentData = useMemo(() => allData[currentDateKey] || getInitialDayData(), [allData, currentDateKey]);
    const isSubmitted = currentData.eodSubmitted;

    useEffect(() => {
        setTalkTime(currentData.talkTime || '');
    }, [currentData]);

    // Fetch Content Posted count for selected date from Scorecard
    useEffect(() => {
        const fetchContentPosted = async () => {
            try {
                const { data, error } = await supabase
                    .from('generated_content')
                    .select('id')
                    .eq('assigned_to', userId)
                    .eq('used', true)
                    .gte('created_at', `${currentDateKey}T00:00:00`)
                    .lte('created_at', `${currentDateKey}T23:59:59`);
                
                if (error) throw error;
                setContentPostedCount(data?.length || 0);
            } catch (error) {
                console.error('Error fetching content posted count:', error);
                setContentPostedCount(0);
            }
        };
        
        fetchContentPosted();
    }, [userId, currentDateKey]);

    const dailyKpis = useMemo(() => {
        // Activity
        const callsMade = (currentData.prospectingContacts || []).filter(c => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM).length;
        // Count any contact with at least one non-empty piece of information (matches Day View logic)
        const prospectsCollected = (currentData.prospectingContacts || []).filter(
            (c) => (c.name && c.name.trim()) || 
                   (c.company && c.company.trim()) || 
                   (c.phone && c.phone.trim()) || 
                   (c.email && c.email.trim())
        ).length;
        const texts = (currentData.prospectingContacts || []).filter(c => c.prospecting.ST).length;
        const socialMediaTouches = contentPostedCount; // Synced with Scorecard Content Posted metric

        // Pipeline
        const newLeads = hotLeads.filter(l => l.dateAdded && l.dateAdded.startsWith(currentDateKey)).length;
        const demosHeld = (currentData.events || []).filter(e => e.type === 'Appointment' && e.conducted).length;
        const proposalsSent = (currentData.prospectingContacts || []).filter(c => c.prospecting.EP).length; // EP button clicks
        const apptsSet = (currentData.prospectingContacts || []).filter(c => c.prospecting.SA).length;
        
        // Results - Distinguish between new and existing clients
        const todaysTransactions = transactions.filter(t => t.date === currentDateKey);
        
        // Identify new vs existing clients
        const newClientTransactions = todaysTransactions.filter(t => {
            // Check if this client had any transactions before today
            const clientFirstTransaction = transactions
                .filter(tr => tr.clientName.toLowerCase() === t.clientName.toLowerCase())
                .sort((a, b) => a.date.localeCompare(b.date))[0];
            return clientFirstTransaction?.date === currentDateKey;
        });
        
        const existingClientTransactions = todaysTransactions.filter(t => {
            const clientFirstTransaction = transactions
                .filter(tr => tr.clientName.toLowerCase() === t.clientName.toLowerCase())
                .sort((a, b) => a.date.localeCompare(b.date))[0];
            return clientFirstTransaction?.date !== currentDateKey;
        });
        
        // New metrics
        const newClosedDeals = newClientTransactions.length;
        const newRevenue = newClientTransactions.reduce((sum, t) => sum + t.amount, 0);
        const recurringRevenue = existingClientTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalRevenue = newRevenue + recurringRevenue;
        const percentNewRevenue = totalRevenue > 0 ? ((newRevenue / totalRevenue) * 100).toFixed(1) : '0';
        
        // Legacy metrics (kept for compatibility)
        const closedDeals = todaysTransactions.length;
        const revenueCollected = todaysTransactions.reduce((sum, t) => sum + t.amount, 0);
        const avgDeal = closedDeals > 0 ? revenueCollected / closedDeals : 0;
        const acv = todaysTransactions.filter(t => t.isRecurring).reduce((sum, t) => sum + t.amount * 12, 0);

        // Conversion Rates
        const callToApptRate = callsMade > 0 ? ((apptsSet / callsMade) * 100).toFixed(1) : '0';
        const leadToApptRate = newLeads > 0 ? ((apptsSet / newLeads) * 100).toFixed(1) : '0';
        const demoToCloseRate = demosHeld > 0 ? ((closedDeals / demosHeld) * 100).toFixed(1) : '0';

        return {
            callsMade, prospectsCollected, texts, socialMediaTouches,
            newLeads, demosHeld, proposalsSent, apptsSet,
            closedDeals, revenueCollected, avgDeal, acv,
            newClosedDeals, newRevenue, recurringRevenue, percentNewRevenue,
            callToApptRate, leadToApptRate, demoToCloseRate
        };
    }, [currentData, hotLeads, transactions, currentDateKey, contentPostedCount]);


    const handleSubmit = async () => {
        const updatedData = {
            ...currentData,
            talkTime: talkTime,
            eodSubmitted: true,
        };
        await onDataChange(currentDateKey, updatedData);
        onSubmission(currentDateKey);
    };

    return (
        <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column (Calendar & Submit) */}
            <div className="lg:col-span-1 space-y-8">
                <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
                 <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray text-center">
                    <h3 className="font-bold text-brand-light-text dark:text-white">Submit Report</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Submit your report to lock in today's numbers.</p>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitted}
                        className="w-full bg-brand-lime text-brand-ink font-black py-3 px-6 rounded-lg hover:bg-green-400 transition text-md disabled:bg-brand-gray disabled:cursor-not-allowed disabled:text-gray-500"
                    >
                        {isSubmitted ? `Submitted for ${selectedDate.toLocaleDateString()}` : 'Submit EOD Report'}
                    </button>
                 </div>
            </div>

            {/* Right Column (KPIs) */}
            <div className="lg:col-span-3">
                <div className="text-left mb-6">
                    <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">End of Day Report</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Column title="Activity" subtitle="Input">
                        <KPI_Card label="Calls Made" value={dailyKpis.callsMade} />
                        <KPI_Card label="Prospects Collected" value={dailyKpis.prospectsCollected} />
                        <KPI_Card label="Texts Sent" value={dailyKpis.texts} />
                        <KPI_Card label="Social Media Posts" value={dailyKpis.socialMediaTouches} />
                    </Column>
                    <Column title="Pipeline" subtitle="Progress">
                        <KPI_Card label="New Leads" value={dailyKpis.newLeads} />
                        <KPI_Card label="Demos Held" value={dailyKpis.demosHeld} />
                        <KPI_Card label="Proposals Sent" value={dailyKpis.proposalsSent} />
                        <KPI_Card label="Appts Set" value={dailyKpis.apptsSet} />
                    </Column>
                     <Column title="Results" subtitle="Outcome">
                        <KPI_Card label="New Closed Deals" value={dailyKpis.newClosedDeals} />
                        <KPI_Card label="New Revenue" value={formatCurrency(dailyKpis.newRevenue)} />
                        <KPI_Card label="Recurring Revenue" value={formatCurrency(dailyKpis.recurringRevenue)} />
                        <KPI_Card label="% New Revenue" value={`${dailyKpis.percentNewRevenue}%`} />
                    </Column>
                </div>
            </div>
        </div>

        {/* Dream Client Studio Stats */}
        <DreamClientStudioStats
            userId={userId}
            selectedDate={selectedDate}
        />

        {/* Performance Chart Section */}
        <EODPerformanceChart
            allData={allData}
            transactions={transactions}
            hotLeads={hotLeads}
            userId={userId}
        />
        </div>
    );
};

export default EODReportPage;