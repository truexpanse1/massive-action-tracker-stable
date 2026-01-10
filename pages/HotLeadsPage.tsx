import React, { useState, useMemo } from 'react';
import { Contact, CalendarEvent, formatPhoneNumber, followUpSchedule } from '../src/types';
import Calendar from '../components/Calendar';
import QuickActions from '../components/QuickActions';
import SetAppointmentModal from '../components/SetAppointmentModal';
import ConvertToClientModal from '../components/ConvertToClientModal';
import DatePicker from '../components/DatePicker';
import ProposalBuilderModal from '../components/ProposalBuilderModal';

interface HotLeadsPageProps {
  hotLeads: Contact[];
  onAddHotLead: (leadData: Omit<Contact, 'id'>) => Promise<Contact | null>;
  onUpdateHotLead: (lead: Contact) => void;
  onDeleteHotLead: (leadId: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  handleSetAppointment: (appointment: { client: string, lead: string, time: string, details?: string }, date: Date) => void;
  onConvertToClient: (contact: Contact, initialAmountCollected: number) => void;
}

const HotLeadsPage: React.FC<HotLeadsPageProps> = ({ hotLeads, onAddHotLead, onUpdateHotLead, onDeleteHotLead, selectedDate, onDateChange, handleSetAppointment, onConvertToClient }) => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState<string | null>(null);
  const [isCalendarFiltered, setIsCalendarFiltered] = useState(false);
  const [showFollowUpLegend, setShowFollowUpLegend] = useState(false);

  // Get dates that have hot leads
  const datesWithLeads = useMemo(() => {
    const dates = new Set<string>();
    hotLeads.forEach(lead => {
      if (lead.dateAdded) {
        const dateKey = lead.dateAdded.split('T')[0];
        dates.add(dateKey);
      }
    });
    return Array.from(dates);
  }, [hotLeads]);

  // Filter leads based on calendar selection
  const filteredLeads = useMemo(() => {
    const sorted = [...hotLeads].sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());
    
    if (!isCalendarFiltered) {
      return sorted;
    }
    
    const selectedDateKey = selectedDate.toISOString().split('T')[0];
    return sorted.filter(lead => lead.dateAdded && lead.dateAdded.startsWith(selectedDateKey));
  }, [hotLeads, selectedDate, isCalendarFiltered]);

  const handleLeadChange = (id: string, field: keyof Omit<Contact, 'id'>, value: string | number) => {
    const leadToUpdate = hotLeads.find(l => l.id === id);
    if (!leadToUpdate) return;
    const updatedValue = field === 'phone' ? formatPhoneNumber(String(value)) : value;
    onUpdateHotLead({ ...leadToUpdate, [field]: updatedValue });
  };

  const handleRemoveLead = (id: string) => {
    if (window.confirm("Are you sure you want to remove this hot lead?")) {
        onDeleteHotLead(id);
    }
  };

  const handleAddLead = () => {
    const newLead: Omit<Contact, 'id'> = {
      name: '', company: '', date: new Date().toISOString().split('T')[0], phone: '', email: '',
      interestLevel: 5, prospecting: {}, dateAdded: new Date().toISOString(), completedFollowUps: {}
    };
    onAddHotLead(newLead);
  };
  
  const handleOpenAppointmentModal = (lead: Contact) => {
      setSelectedLead(lead);
      setIsAppointmentModalOpen(true);
  };

  const handleOpenConvertToClientModal = (lead: Contact) => {
      setSelectedLead(lead);
      setIsConvertModalOpen(true);
  };

  const handleOpenProposalModal = (lead: Contact) => {
      setSelectedLead(lead);
      setIsProposalModalOpen(true);
  };

  const handleProposalSuccess = () => {
      setIsProposalModalOpen(false);
      alert('Proposal generated successfully!');
      // Optionally refresh hot leads to update proposal_count
  };
  
  const handleSaveAppointment = ({ date, time, note }: { date: string, time: string, note: string }) => {
    if (!selectedLead) return;
    const appointmentDate = new Date(`${date}T${time}`);
    handleSetAppointment({ client: selectedLead.name, lead: 'Hot Lead', time: time, details: note }, appointmentDate);
    onUpdateHotLead({ ...selectedLead, appointmentDate: date });
    setIsAppointmentModalOpen(false);
  };

  const handleConfirmConvertToClient = (amount: number) => {
    if (!selectedLead) return;
    onConvertToClient(selectedLead, amount);
    setIsConvertModalOpen(false);
  }

  const handleQuickSetAppointment = (data: { name: string, phone: string, email: string, date: string, time: string, interestLevel: number }) => {
    const appointmentDate = new Date(`${data.date}T${data.time}`);
    handleSetAppointment({ client: data.name, lead: 'Hot Lead', time: data.time }, appointmentDate);
  };
  
  const handleQuickAddToHotLeads = (data: { name: string, phone: string, email: string, interestLevel: number }) => {
    const newLead: Omit<Contact, 'id'> = {
        name: data.name, company: '', date: new Date().toISOString().split('T')[0], phone: data.phone, email: data.email,
        interestLevel: data.interestLevel, prospecting: {}, dateAdded: new Date().toISOString(), completedFollowUps: {}
    };
    onAddHotLead(newLead);
    alert(`${data.name} added to Hot Leads!`);
  };

  const handleCalendarDateChange = (date: Date) => {
    onDateChange(date);
    setIsCalendarFiltered(true);
  };

  const handleShowAllLeads = () => {
    setIsCalendarFiltered(false);
  };

  return (
    <>
     <SetAppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} onSave={handleSaveAppointment} contact={selectedLead} />
     <ConvertToClientModal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} onSave={handleConfirmConvertToClient} contact={selectedLead} />
     {selectedLead && (
       <ProposalBuilderModal 
         isOpen={isProposalModalOpen} 
         onClose={() => setIsProposalModalOpen(false)} 
         onSuccess={handleProposalSuccess}
         user={{ id: '', company_id: '', name: '', email: '', role: 'User' }}
         hotLead={{
           id: parseInt(selectedLead.id) || 0,
           company_name: selectedLead.company || 'Unknown Company',
           contact_name: selectedLead.name,
           contact_email: selectedLead.email,
           contact_phone: selectedLead.phone,
           industry: undefined
         }}
       />
     )}
     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-8">
            <Calendar 
              selectedDate={selectedDate} 
              onDateChange={handleCalendarDateChange}
              datesWithActivity={datesWithLeads}
            />
             <QuickActions onSetAppointment={handleQuickSetAppointment} onAddToHotLeads={handleQuickAddToHotLeads} />
        </div>
        <div className="lg:col-span-9">
            <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-brand-light-text dark:text-white">
                    Hot Leads
                    {isCalendarFiltered && (
                      <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                        - {selectedDate.toLocaleDateString()} ({filteredLeads.length})
                      </span>
                    )}
                  </h1>
                  {isCalendarFiltered && (
                    <button
                      onClick={handleShowAllLeads}
                      className="text-sm bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-brand-gray/70 transition"
                    >
                      Show All Leads
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleAddLead} className="bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm whitespace-nowrap">+ Add New Lead</button>
                </div>
              </div>
              
              {showFollowUpLegend && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-brand-gray/30 border border-brand-blue/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-brand-blue uppercase">📋 30-Day Follow-Up Plan</h3>
                    <button
                      onClick={() => setShowFollowUpLegend(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Follow-ups begin on the appointment date. Complete each step to maximize conversion.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {Object.entries(followUpSchedule).map(([day, activity]) => (
                      <div key={day} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="font-bold text-brand-blue min-w-[60px]">Day {day}:</span>
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left table-auto">
                  <thead className="bg-brand-light-bg dark:bg-brand-gray/50 text-xs uppercase text-gray-500 dark:text-gray-400 hidden sm:table-header-group">
                    <tr>
                      <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3 hidden md:table-cell">Email</th>
                      <th className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>Follow-ups</span>
                          <button
                            onClick={() => setShowFollowUpLegend(!showFollowUpLegend)}
                            className="text-brand-blue hover:text-blue-600 font-bold text-sm"
                            title="View 30-Day Follow-Up Plan"
                          >
                            ℹ️
                          </button>
                        </div>
                      </th><th className="p-3">Actions</th><th className="p-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <React.Fragment key={lead.id}>
                      <tr className="border-b border-brand-light-border dark:border-brand-gray">
                        <td className="p-2" data-label="Name"><input type="text" value={lead.name} onBlur={e => handleLeadChange(lead.id, 'name', e.target.value)} onChange={e => handleLeadChange(lead.id, 'name', e.target.value)} className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white" /></td>
                        <td className="p-2" data-label="Phone"><input type="tel" value={lead.phone} onBlur={e => handleLeadChange(lead.id, 'phone', e.target.value)} onChange={e => handleLeadChange(lead.id, 'phone', e.target.value)} className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white" /></td>
                        <td className="p-2 hidden md:table-cell" data-label="Email"><input type="email" value={lead.email} onBlur={e => handleLeadChange(lead.id, 'email', e.target.value)} onChange={e => handleLeadChange(lead.id, 'email', e.target.value)} className="w-full bg-transparent p-1 text-sm focus:outline-none focus:bg-brand-light-bg dark:focus:bg-brand-gray/50 rounded dark:text-white" /></td>
                        <td className="p-2 text-center"><button onClick={() => setExpandedFollowUps(expandedFollowUps === lead.id ? null : lead.id)} className="font-bold text-brand-blue hover:underline" disabled={!lead.appointmentDate} title={!lead.appointmentDate ? "Set an appointment to start follow-ups" : "View Follow-up Plan"}>{lead.completedFollowUps ? Object.keys(lead.completedFollowUps).length : 0} / {Object.keys(followUpSchedule).length}</button></td>
                        <td className="p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"><button onClick={() => handleOpenAppointmentModal(lead)} className="bg-brand-blue text-white font-bold py-2 px-3 rounded-md hover:bg-blue-700 transition text-xs whitespace-nowrap">Set Appt</button><button onClick={() => handleOpenProposalModal(lead)} className="bg-purple-600 text-white font-bold py-2 px-3 rounded-md hover:bg-purple-700 transition text-xs whitespace-nowrap">📄 Proposal</button><button onClick={() => handleOpenConvertToClientModal(lead)} className="bg-brand-lime text-brand-ink font-bold py-2 px-3 rounded-md hover:bg-green-400 transition text-xs whitespace-nowrap">Convert</button></td>
                        <td className="p-2 text-center"><button onClick={() => handleRemoveLead(lead.id)} className="text-red-500 hover:text-red-400 font-bold text-xl" title="Remove Lead">&times;</button></td>
                      </tr>
                      {expandedFollowUps === lead.id && (<tr><td colSpan={6} className="p-3 bg-brand-light-bg dark:bg-brand-gray/20"><h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Follow-up Plan (Starts: {lead.appointmentDate})</h4><ul className="text-xs space-y-1">{Object.entries(followUpSchedule).map(([day, activity]) => { const isCompleted = lead.completedFollowUps && lead.completedFollowUps[parseInt(day,10)]; return (<li key={day} className={`flex items-center ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}><span className="font-bold w-12">Day {day}:</span><span>{activity}</span></li>)})}</ul></td></tr>)}
                      </React.Fragment>
                    ))}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-500 dark:text-gray-400">
                          {isCalendarFiltered 
                            ? `No hot leads added on ${selectedDate.toLocaleDateString()}.` 
                            : 'No hot leads yet. Add some from the Prospecting page!'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default HotLeadsPage;
