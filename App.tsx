import React, { useState, useEffect, useMemo } from 'react';
import { Contact, User, DayData, Transaction, initializeDayData, initializeFollowUpSteps } from './types';
import Header from './components/Header';
import DayView from './pages/DayView';
import HotLeadsPage from './pages/HotLeadsPage';
import NewClientsPage from './pages/NewClientsPage';
import RevenuePage from './pages/RevenuePage';
import CoachingPage from './pages/CoachingPage';
import AIImagesPageEnhanced from './pages/AIImagesPageEnhanced';
import AIContentPage from './pages/AIContentPage';
import AddClientModal from './components/AddClientModal'; // Import the modal

// Mock Data for Demo
const mockUser: User = { id: 'user-1', name: 'Don Smith', email: 'don@example.com', role: 'Manager', status: 'Active' };
const mockTeamUsers: User[] = [mockUser];
const mockTransactions: Transaction[] = [];
const mockAllData: DayData[] = [initializeDayData(new Date().toISOString().split('T')[0])];
const mockHotLeads: Contact[] = [
  { id: 'lead-1', name: 'John Williams', company: 'No Company', date: '2023-11-01', phone: '5551234567', email: 'john@example.com', interestLevel: 5, prospecting: {}, isHot: true, hotLeadDate: '2023-11-01', followUpSteps: initializeFollowUpSteps() },
  { id: 'lead-2', name: 'Don Smith', company: 'Websmith Designs', date: '2023-11-05', phone: '5559876543', email: 'don.s@example.com', interestLevel: 7, prospecting: {}, isHot: true, hotLeadDate: '2023-11-05', followUpSteps: initializeFollowUpSteps() },
  { id: 'lead-3', name: 'john doe', company: 'No Company', date: '2023-11-10', phone: '5551112222', email: 'doe@example.com', interestLevel: 5, prospecting: {}, isHot: true, hotLeadDate: '2023-11-10', followUpSteps: initializeFollowUpSteps() },
];
const mockClients: Contact[] = [];

const App: React.FC = () => {
  const [view, setView] = useState('hot-leads');
  const [user, setUser] = useState<User | null>(mockUser);
  const [allData, setAllData] = useState<DayData[]>(mockAllData);
  const [hotLeads, setHotLeads] = useState<Contact[]>(mockHotLeads);
  const [clients, setClients] = useState<Contact[]>(mockClients);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [teamUsers, setTeamUsers] = useState<User[]>(mockTeamUsers);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Modal State for AddClientModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Contact | null>(null);

  // Handlers
  const handleUpsertDayData = (data: DayData) => {
    setAllData(prevData => {
      const existingIndex = prevData.findIndex(d => d.date === data.date);
      if (existingIndex > -1) {
        return prevData.map((d, i) => i === existingIndex ? data : d);
      }
      return [...prevData, data];
    });
  };

  const handleAddWin = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const handleAddHotLead = (lead: Contact) => {
    setHotLeads(prev => [...prev, lead]);
  };

  const handleUpdateHotLead = (updatedLead: Contact) => {
    if (updatedLead.isHot && !hotLeads.some(l => l.id === updatedLead.id)) {
      // New hot lead from Prospecting tab
      setHotLeads(prev => [...prev, updatedLead]);
    } else if (!updatedLead.isHot) {
      // Lead marked as not hot
      setHotLeads(prev => prev.filter(l => l.id !== updatedLead.id));
    } else {
      // Existing hot lead update (e.g., follow-up step completed)
      setHotLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    }
  };

  const handleDeleteHotLead = (leadId: string) => {
    setHotLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleConvertToClient = (lead: Contact, initialAmountCollected: number) => {
    const newClient: Contact = { ...lead, isHot: false, hotLeadDate: undefined, followUpSteps: undefined };
    setClients(prev => [...prev, newClient]);
    setHotLeads(prev => prev.filter(l => l.id !== lead.id));
    // Add transaction logic here if needed
  };

  const handleSaveClient = (client: Contact) => {
    // Logic for saving a new lead/client from the modal
    if (editingClient) {
      // Logic for editing an existing client/lead (not fully implemented in mock)
    } else {
      // Logic for adding a brand new lead/client
      // We will add the new contact to the hotLeads array for simplicity,
      // assuming the modal is used to quickly add a lead that is immediately hot.
      const newLead: Contact = {
        ...client,
        id: `lead-${Date.now()}`,
        isHot: true,
        hotLeadDate: new Date().toISOString().split('T')[0],
        followUpSteps: initializeFollowUpSteps(),
      };
      handleAddHotLead(newLead);
    }
    setIsModalOpen(false);
  };

  const handleSetAppointment = () => {
    setEditingClient(null); // Clear any previous editing state
    setIsModalOpen(true);
  };

  const handleEmailLead = (lead: Contact) => {
    console.log(`Simulating email to ${lead.email}`);
    // In a real app, this would open an email client or a compose modal
  };

  const handleScheduleLead = (lead: Contact) => {
    console.log(`Simulating scheduling for ${lead.name}`);
    // In a real app, this would open a calendar/scheduling modal
  };

  // Render Logic
  const renderView = () => {
    switch (view) {
      case 'new-clients':
        return <NewClientsPage clients={clients} onUpdateClient={() => {}} />;
      case 'revenue':
        return <RevenuePage transactions={transactions} />;
      case 'hot-leads':
        return (
          <>
            <HotLeadsPage
              hotLeads={hotLeads}
              onAddHotLead={handleAddHotLead}
              onUpdateHotLead={handleUpdateHotLead}
              onDeleteHotLead={handleDeleteHotLead}
              onConvertLead={handleConvertToClient}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              handleSetAppointment={handleSetAppointment}
              onConvertToClient={handleConvertToClient}
              onEmailLead={handleEmailLead}
              onScheduleLead={handleScheduleLead}
            />
            <AddClientModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveClient}
              client={editingClient}
            />
          </>
        );
      case 'coaching':
        return <CoachingPage />;
      case 'ai-images':
        return <AIImagesPageEnhanced />;
      case 'ai-content':
        return <AIContentPage />;
      default:
        return <DayView user={user!} onDataChange={handleUpsertDayData} allData={allData} selectedDate={selectedDate} onDateChange={setSelectedDate} onAddWin={handleAddWin} onAddHotLead={handleAddHotLead} onUpdateHotLead={handleUpdateHotLead} hotLeads={hotLeads} transactions={transactions} users={teamUsers} onNavigateToRevenue={() => setView('revenue')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light-bg dark:bg-brand-ink">
      <Header currentView={view} setView={setView} isDemoMode={isDemoMode} />
      <main className="flex-grow p-3 sm:p-4 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
