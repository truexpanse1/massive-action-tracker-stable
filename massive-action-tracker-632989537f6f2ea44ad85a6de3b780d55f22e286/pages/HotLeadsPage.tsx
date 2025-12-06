import React, { useState, useMemo } from 'react';
import { Contact, User } from '../types';
import HotLeadCard from '@/components/HotLeadCard';
import StatCard from '@/components/StatCard'; // <-- THIS IS THE FIX
import { formatCurrency } from '../types';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

interface HotLeadsPageProps {
  hotLeads: Contact[];
  onAddHotLead: (lead: Contact) => void; // Not used here, but passed down
  onUpdateHotLead: (lead: Contact) => void;
  onDeleteHotLead: (leadId: string) => void;
  onConvertLead: (lead: Contact, initialAmountCollected: number) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  handleSetAppointment: () => void;
  onConvertToClient: (contact: Contact, initialAmountCollected: number) => void;
  onEmailLead: (lead: Contact) => void;
  onScheduleLead: (lead: Contact) => void;
}

const HotLeadsPage: React.FC<HotLeadsPageProps> = ({
  hotLeads,
  onUpdateHotLead,
  onDeleteHotLead,
  onConvertLead,
  selectedDate,
  onDateChange,
  handleSetAppointment,
  onConvertToClient,
  onEmailLead,
  onScheduleLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due-today'>('all');

  const filteredLeads = useMemo(() => {
    let leads = hotLeads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filter === 'overdue') {
      // Logic to determine if a lead has an overdue follow-up step
      leads = leads.filter(lead => {
        if (!lead.followUpSteps || !lead.hotLeadDate) return false;
        const nextStep = lead.followUpSteps.find(step => !step.isCompleted);
        if (!nextStep) return false; // All steps complete

        const hotLeadDate = new Date(lead.hotLeadDate);
        const dueDate = new Date(hotLeadDate);
        dueDate.setDate(hotLeadDate.getDate() + nextStep.dayOffset);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return dueDate < today;
      });
    } else if (filter === 'due-today') {
      // Logic to determine if a lead has a follow-up step due today
      leads = leads.filter(lead => {
        if (!lead.followUpSteps || !lead.hotLeadDate) return false;
        const nextStep = lead.followUpSteps.find(step => !step.isCompleted);
        if (!nextStep) return false;

        const hotLeadDate = new Date(lead.hotLeadDate);
        const dueDate = new Date(hotLeadDate);
        dueDate.setDate(hotLeadDate.getDate() + nextStep.dayOffset);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return dueDate.getTime() === today.getTime();
      });
    }

    return leads;
  }, [hotLeads, searchTerm, filter]);

  const stats = useMemo(() => {
    const totalLeads = hotLeads.length;
    const totalFollowUps = hotLeads.reduce((sum, lead) => sum + (lead.followUpSteps?.length || 0), 0);
    const completedFollowUps = hotLeads.reduce((sum, lead) => sum + (lead.followUpSteps?.filter(s => s.isCompleted).length || 0), 0);
    const followUpCompletionRate = totalFollowUps > 0 ? (completedFollowUps / totalFollowUps) * 100 : 0;

    const overdueLeads = hotLeads.filter(lead => {
      if (!lead.followUpSteps || !lead.hotLeadDate) return false;
      const nextStep = lead.followUpSteps.find(step => !step.isCompleted);
      if (!nextStep) return false;

      const hotLeadDate = new Date(lead.hotLeadDate);
      const dueDate = new Date(hotLeadDate);
      dueDate.setDate(hotLeadDate.getDate() + nextStep.dayOffset);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return dueDate < today;
    }).length;

    return {
      totalLeads,
      followUpCompletionRate: followUpCompletionRate.toFixed(1),
      overdueLeads,
      dueToday: filteredLeads.filter(lead => {
        if (!lead.followUpSteps || !lead.hotLeadDate) return false;
        const nextStep = lead.followUpSteps.find(step => !step.isCompleted);
        if (!nextStep) return false;

        const hotLeadDate = new Date(lead.hotLeadDate);
        const dueDate = new Date(hotLeadDate);
        dueDate.setDate(hotLeadDate.getDate() + nextStep.dayOffset);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return dueDate.getTime() === today.getTime();
      }).length,
    };
  }, [hotLeads, filteredLeads]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-ink dark:text-white">Hot Leads Management</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Hot Leads" value={stats.totalLeads} />
        <StatCard title="Follow-up Rate" value={`${stats.followUpCompletionRate}%`} />
        <StatCard title="Overdue Leads" value={stats.overdueLeads} isAlert={stats.overdueLeads > 0} />
        <StatCard title="Due Today" value={stats.dueToday} isAlert={stats.dueToday > 0} />
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-brand-blue text-white'
                : 'bg-gray-200 text-brand-ink hover:bg-gray-300 dark:bg-brand-gray dark:text-white dark:hover:bg-brand-gray-light'
            }`}
          >
            All Leads ({stats.totalLeads})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'overdue'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-brand-ink hover:bg-gray-300 dark:bg-brand-gray dark:text-white dark:hover:bg-brand-gray-light'
            }`}
          >
            Overdue ({stats.overdueLeads})
          </button>
          <button
            onClick={() => setFilter('due-today')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'due-today'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-brand-ink hover:bg-gray-300 dark:bg-brand-gray dark:text-white dark:hover:bg-brand-gray-light'
            }`}
          >
            Due Today ({stats.dueToday})
          </button>
        </div>

        <div className="flex space-x-4 items-center">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-full w-full md:w-64 dark:bg-brand-ink-light dark:border-brand-gray dark:text-white"
          />
          <button
            onClick={handleSetAppointment}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-lime text-brand-ink rounded-full font-semibold hover:bg-brand-lime-dark transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <HotLeadCard
              key={lead.id}
              lead={lead}
              onUpdate={onUpdateHotLead}
              onDelete={onDeleteHotLead}
              onConvert={onConvertLead}
              onEmail={onEmailLead}
              onSchedule={onScheduleLead}
            />
          ))
        ) : (
          <div className="lg:col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
            No hot leads match the current filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default HotLeadsPage;
