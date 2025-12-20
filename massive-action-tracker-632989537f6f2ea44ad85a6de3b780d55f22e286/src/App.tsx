import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

import {
  View,
  User,
  Role,
  DayData,
  Transaction,
  Contact,
  Quote,
  NewClient,
  CalendarEvent,
  getInitialDayData,
  UserStatus,
  EODSubmissions,
} from './types';

// Page Components
import LandingPage from '../pages/LandingPage';
import Header from '../components/Header';
import DayView from '../pages/DayView';
import ProspectingPage from '../pages/ProspectingPage';
import HotLeadsPage from '../pages/HotLeadsPage';
import NewClientsPage from '../pages/NewClientsPage';
import RevenuePage from '../pages/RevenuePage';
import MonthViewPage from '../pages/MonthViewPage';
import AIImagesPage from '../pages/AIImagesPage';
import AIContentPage from '../pages/AIContentPage';
import CoachingPage from '../pages/CoachingPage';
import TeamControlPage from '../pages/TeamControlPage';
import PerformanceDashboardPage from '../pages/PerformanceDashboardPage';
import EODReportPage from '../pages/EODReportPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Components
import ChatIcon from '../components/ChatIcon';
import ChatBot from '../components/ChatBot';
import Confetti from '../components/Confetti';

const isDemoMode = false; // Production mode enabled - Final Fix Applied

const FullPageError: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink text-center p-4">
    <div className="bg-brand-light-card dark:bg-brand-navy p-8 rounded-lg border border-brand-light-border dark:border-brand-gray max-w-lg">
      <h2 className="text-2xl font-bold text-brand-red mb-4">
        Application Error
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        This can happen if the app can't connect to the database or if there's a
        problem with your account credentials. Please check your internet
        connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<View>('day-view');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [allData, setAllData] = useState<{ [key: string]: DayData }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hotLeads, setHotLeads] = useState<Contact[]>([]);
  const [newClients, setNewClients] = useState<NewClient[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [contextualUserId, setContextualUserId] = useState<string | null>(null);
  const [revenuePageInitialState, setRevenuePageInitialState] = useState<{
    viewMode: 'daily' | 'analysis';
    dateRange?: { start: string; end: string };
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as
      | 'dark'
      | 'light'
      | null;
    const preferredTheme =
      storedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    setTheme(preferredTheme);
    document.documentElement.classList.toggle('dark', preferredTheme === 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setFetchError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!session) {
      setUser(null);
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setUser(data as User);
      } catch (error: any) {
        console.error('Error fetching user:', error);
        setFetchError(error.message || 'Failed to load user data');
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      try {
        const { data: dayData, error: dayError } = await supabase
          .from('day_data')
          .select('*')
          .eq('userId', user.id);

        if (dayError) throw dayError;

        const dataMap: { [key: string]: DayData } = {};
        dayData?.forEach((d: any) => {
          dataMap[d.date] = d as DayData;
        });
        setAllData(dataMap);

        // Fetch transactions based on role
        let transactionsQuery = supabase
          .from('transactions')
          .select('*');
        
        // Sales reps only see their assigned transactions
        if (user.role !== 'Admin' && user.role !== 'admin') {
          transactionsQuery = transactionsQuery.eq('assigned_to', user.id);
        }
        // Admins see all transactions in their company
        else {
          transactionsQuery = transactionsQuery.eq('company_id', user.company_id);
        }
        
        const { data: transactionData, error: transactionError } = await transactionsQuery
          .order('date', { ascending: false });

        if (transactionError) throw transactionError;
        setTransactions(transactionData as Transaction[]);

        // Fetch hot leads based on role
        let hotLeadsQuery = supabase
          .from('hot_leads')
          .select('*');
        
        // Sales reps only see their assigned hot leads
        if (user.role !== 'Admin' && user.role !== 'admin') {
          hotLeadsQuery = hotLeadsQuery.eq('assigned_to', user.id);
        }
        // Admins see all hot leads in their company
        else {
          hotLeadsQuery = hotLeadsQuery.eq('company_id', user.company_id);
        }
        
        const { data: hotLeadsData, error: hotLeadsError } = await hotLeadsQuery
          .order('created_at', { ascending: false });

        if (hotLeadsError) throw hotLeadsError;
        setHotLeads(hotLeadsData as Contact[]);

        // Fetch clients based on role
        let clientsQuery = supabase
          .from('new_clients')
          .select('*');
        
        // Sales reps only see their assigned clients
        if (user.role !== 'Admin' && user.role !== 'admin') {
          clientsQuery = clientsQuery.eq('assigned_to', user.id);
        }
        // Admins see all clients in their company
        else {
          clientsQuery = clientsQuery.eq('company_id', user.company_id);
        }
        
        const { data: newClientsData, error: newClientsError } = await clientsQuery
          .order('close_date', { ascending: false });

        if (newClientsError) throw newClientsError;
        setNewClients(newClientsData as NewClient[]);

        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('userId', user.id)
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;
        setSavedQuotes(quotesData as Quote[]);

        if (user.role === 'manager' || user.role === 'admin') {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('name', { ascending: true });

          if (usersError) throw usersError;
          setUsers(usersData as User[]);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setFetchError(error.message || 'Failed to load application data');
      }
    };

    fetchAllData();
  }, [user]);

  const handleUpsertDayData = async (dateKey: string, data: DayData) => {
    try {
      const { error } = await supabase.from('day_data').upsert({
        ...data,
        date: dateKey,
        userId: user?.id,
      });

      if (error) throw error;

      setAllData((prev) => ({ ...prev, [dateKey]: data }));
    } catch (error) {
      console.error('Error upserting day data:', error);
    }
  };

  const handleSaveTransaction = async (transaction: Transaction) => {
    try {
      const { error } = await supabase.from('transactions').upsert(transaction);

      if (error) throw error;

      setTransactions((prev) => {
        const filtered = prev.filter((t) => t.id !== transaction.id);
        return [transaction, ...filtered];
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleAddHotLead = async (contact: Contact) => {
    try {
      const { data, error } = await supabase
        .from('hot_leads')
        .insert({ ...contact, userId: user?.id })
        .select()
        .single();

      if (error) throw error;

      setHotLeads((prev) => [data as Contact, ...prev]);
    } catch (error) {
      console.error('Error adding hot lead:', error);
    }
  };

  const handleUpdateHotLead = async (contact: Contact) => {
    try {
      const { error } = await supabase
        .from('hot_leads')
        .update(contact)
        .eq('id', contact.id);

      if (error) throw error;

      setHotLeads((prev) =>
        prev.map((c) => (c.id === contact.id ? contact : c))
      );
    } catch (error) {
      console.error('Error updating hot lead:', error);
    }
  };

  const handleDeleteHotLead = async (id: string) => {
    try {
      const { error } = await supabase.from('hot_leads').delete().eq('id', id);

      if (error) throw error;

      setHotLeads((prev) => prev.filter((c) => c.id !== Number(id)));
    } catch (error) {
      console.error('Error deleting hot lead:', error);
    }
  };

  const handleSaveNewClient = async (client: NewClient) => {
    try {
      const { error } = await supabase.from('new_clients').upsert(client);

      if (error) throw error;

      setNewClients((prev) => {
        const filtered = prev.filter((c) => c.id !== client.id);
        return [client, ...filtered];
      });
    } catch (error) {
      console.error('Error saving new client:', error);
    }
  };

  const handleSaveQuote = async (quote: Quote) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert({ ...quote, userId: user?.id })
        .select()
        .single();

      if (error) throw error;

      setSavedQuotes((prev) => [data as Quote, ...prev]);
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const handleSetAppointment = async (event: CalendarEvent) => {
    const dateKey = event.date;
    const dayData = allData[dateKey] || getInitialDayData();
    const updatedData = {
      ...dayData,
      appointments: [...(dayData.appointments || []), event],
    };
    await handleUpsertDayData(dateKey, updatedData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate('/');
  };

  const handleAddWin = (dateKey: string, message: string) => {
    setWinMessage(message);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleConvertToClient = async (contact: Contact) => {
    const closeDate = new Date().toISOString().split('T')[0];
    const initialAmountCollected = 0;
    await handleSaveNewClient({
      id: `new-${Date.now()}`,
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      closeDate: closeDate,
      stage: 'New',
      userId: user!.id,
    });
    await handleSaveTransaction({
      id: 'new-',
      date: closeDate,
      clientName: contact.name,
      product: 'Initial Service',
      amount: initialAmountCollected,
      isRecurring: false,
      userId: user!.id,
    });
    await handleDeleteHotLead(String(contact.id));
    handleAddWin(closeDate, `New Client Won! ${contact.name}`);
    setView('new-clients');
  };

  const handleViewUserTrends = (userId: string) => {
    setContextualUserId(userId);
    setView('performance-dashboard');
  };

  const handleNavigateToRevenue = (
    period: 'today' | 'week' | 'month' | 'ytd' | 'mcv' | 'acv'
  ) => {
    const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
    let initialState:
      | {
          viewMode: 'daily' | 'analysis';
          dateRange?: { start: string; end: string };
        }
      | null = { viewMode: 'analysis' };
    if (period === 'today') {
      initialState = { viewMode: 'daily' };
    } else {
      let startDate = new Date(selectedDate);
      let endDate = new Date(selectedDate);
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - selectedDate.getDay());
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          break;
        case 'month':
        case 'mcv':
        case 'acv':
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          endDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0
          );
          break;
        case 'ytd':
          startDate = new Date(selectedDate.getFullYear(), 0, 1);
          break;
      }
      initialState.dateRange = {
        start: getDateKey(startDate),
        end: getDateKey(endDate),
      };
    }
    setRevenuePageInitialState(initialState);
    setView('revenue');
  };

  const retryConnection = () => window.location.reload();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (fetchError) {
    return <FullPageError message={fetchError} onRetry={retryConnection} />;
  }

  // Password reset route - accessible without authentication
  if (location.pathname === '/reset-password') {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  if (!session || !user) {
    return <LandingPage />;
  }

  const renderView = () => {
    const userEODSubmissions: EODSubmissions = Object.entries(allData).reduce(
      (acc: any, [dateKey, dayData]) => {
        const typedDayData = dayData as DayData;
        if (typedDayData && typedDayData.eodSubmitted && typedDayData.userId) {
          const userId = typedDayData.userId;
          if (!acc[userId]) {
            acc[userId] = {};
          }
          acc[userId][dateKey] = true;
        }
        return acc;
      },
      {}
    );

    switch (view) {
      case 'day-view':
        return (
          <DayView
            user={user}
            onDataChange={handleUpsertDayData}
            allData={allData}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddWin={handleAddWin}
            onAddHotLead={handleAddHotLead}
            onUpdateHotLead={handleUpdateHotLead}
            hotLeads={hotLeads}
            transactions={transactions}
            users={users}
            onNavigateToRevenue={handleNavigateToRevenue}
          />
        );
      case 'month-view':
        return (
          <MonthViewPage
            allData={allData}
            onDataChange={handleUpsertDayData}
            transactions={transactions}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            setView={setView}
          />
        );
      case 'prospecting':
        return (
          <ProspectingPage
            allData={allData}
            onDataChange={handleUpsertDayData}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddHotLead={handleAddHotLead}
            onAddWin={handleAddWin}
            handleSetAppointment={handleSetAppointment}
            hotLeads={hotLeads}
          />
        );
      case 'hot-leads':
        return (
          <HotLeadsPage
            hotLeads={hotLeads}
            onAddHotLead={handleAddHotLead}
            onUpdateHotLead={handleUpdateHotLead}
            onDeleteHotLead={handleDeleteHotLead}
            onConvertToClient={handleConvertToClient}
          />
        );
      case 'new-clients':
        return (
          <NewClientsPage
            newClients={newClients}
            onSaveClient={handleSaveNewClient}
          />
        );
      case 'revenue':
        return (
          <RevenuePage
            transactions={transactions}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            initialState={revenuePageInitialState}
          />
        );
      case 'ai-images':
        return <AIImagesPage savedQuotes={savedQuotes} onSaveQuote={handleSaveQuote} />;
      case 'ai-content':
        return <AIContentPage />;
      case 'coaching':
        return <CoachingPage />;
      case 'team-control':
        return (
          <TeamControlPage
            users={users}
            onViewUserTrends={handleViewUserTrends}
          />
        );
      case 'performance-dashboard':
        return (
          <PerformanceDashboardPage
            allData={allData}
            transactions={transactions}
            users={users}
            contextualUserId={contextualUserId}
            setContextualUserId={setContextualUserId}
            eodSubmissions={userEODSubmissions}
          />
        );
      case 'eod-report':
        return (
          <EODReportPage
            allData={allData}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            hotLeads={hotLeads}
            transactions={transactions}
            onSubmission={(dateKey) =>
              handleAddWin(dateKey, 'EOD Report Submitted!')
            }
            userId={user.id}
            onDataChange={handleUpsertDayData}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-brand-light-bg dark:bg-brand-ink transition-colors duration-300">
      {showConfetti && <Confetti />}
      <Header
        theme={theme}
        setTheme={setTheme}
        setView={setView}
        currentView={view}
        userRole={user.role}
        onLogout={handleLogout}
        userName={user.name}
        isDemoMode={isDemoMode}
      />
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      {showConfetti && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-brand-lime text-brand-ink font-bold p-4 rounded-lg shadow-2xl z-50">
          🎉 {winMessage} 🎉
        </div>
      )}
      <ChatIcon onClick={() => setIsChatOpen(true)} />
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;
