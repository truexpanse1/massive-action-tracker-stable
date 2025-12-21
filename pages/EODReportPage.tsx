

import React, { useState, useMemo, useEffect } from 'react';
import { DayData, Transaction, getInitialDayData, formatCurrency, Contact } from '../types';
import Calendar from '../components/Calendar';
import EODPerformanceChart from '../components/EODPerformanceChart';
import DreamClientStudioStats from '../components/DreamClientStudioStats';

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

    const currentData = useMemo(() => allData[currentDateKey] || getInitialDayData(), [allData, currentDateKey]);
    const isSubmitted = currentData.eodSubmitted;

    useEffect(() => {
        setTalkTime(currentData.talkTime || '');
    }, [currentData]);

    const dailyKpis = useMemo(() => {
        // Activity
        const callsMade = (currentData.prospectingContacts || []).filter(c => c.prospecting.SW || c.prospecting.NA || c.prospecting.LM).length;
        const proposalsSent = (currentData.prospectingContacts || []).filter(c => c.prospecting.EP).length;
        const texts = (currentData.prospectingContacts || []).filter(c => c.prospecting.ST).length;
        const totalContacts = (currentData.prospectingContacts || []).length;

        // Pipeline
        const newLeads = hotLeads.filter(l => l.dateAdded && l.dateAdded.startsWith(currentDateKey)).length;
        const demosHeld = (currentData.events || []).filter(e => e.type === 'Appointment' && e.conducted).length;
        const quotesSent = proposalsSent; // Same as proposals sent
        const apptsSet = (currentData.prospectingContacts || []).filter(c => c.prospecting.SA).length;
        
        // Results
        const todaysTransactions = transactions.filter(t => t.date === currentDateKey);
        const closedDeals = todaysTransactions.length;
        const revenueCollected = todaysTransactions.reduce((sum, t) => sum + t.amount, 0);
        const avgDeal = closedDeals > 0 ? revenueCollected / closedDeals : 0;
        const acv = todaysTransactions.filter(t => t.isRecurring).reduce((sum, t) => sum + t.amount * 12, 0);

        // Conversion Rates
        const callToApptRate = callsMade > 0 ? ((apptsSet / callsMade) * 100).toFixed(1) : '0';
        const leadToApptRate = newLeads > 0 ? ((apptsSet / newLeads) * 100).toFixed(1) : '0';
        const demoToCloseRate = demosHeld > 0 ? ((closedDeals / demosHeld) * 100).toFixed(1) : '0';

        return {
            callsMade, proposalsSent, texts, totalContacts,
            newLeads, demosHeld, quotesSent, apptsSet,
            closedDeals, revenueCollected, avgDeal, acv,
            callToApptRate, leadToApptRate, demoToCloseRate
        };
    }, [currentData, hotLeads, transactions, currentDateKey]);


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
                        <KPI_Card label="Proposals Sent" value={dailyKpis.proposalsSent} />
                        <KPI_Card label="Texts Sent" value={dailyKpis.texts} />
                        <KPI_Card label="Total Contacts" value={dailyKpis.totalContacts} />
                    </Column>
                    <Column title="Pipeline" subtitle="Progress">
                        <KPI_Card label="New Leads" value={dailyKpis.newLeads} />
                        <KPI_Card label="Demos Held" value={dailyKpis.demosHeld} />
                        <KPI_Card label="Quotes Sent" value={dailyKpis.quotesSent} />
                        <KPI_Card label="Appts Set" value={dailyKpis.apptsSet} />
                    </Column>
                     <Column title="Results" subtitle="Outcome">
                        <KPI_Card label="Closed Deals" value={dailyKpis.closedDeals} />
                        <KPI_Card label="Revenue Collected" value={formatCurrency(dailyKpis.revenueCollected)} />
                        <KPI_Card label="Call → Appt Rate" value={`${dailyKpis.callToApptRate}%`} />
                        <KPI_Card label="Demo → Close Rate" value={`${dailyKpis.demoToCloseRate}%`} />
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