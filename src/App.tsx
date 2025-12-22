import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { syncClientToGHL } from './services/ghlSyncService';

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
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Header from '../components/Header';
import DayView from '../pages/DayView';
import ProspectingPage from '../pages/ProspectingPage';
import HotLeadsPage from '../pages/HotLeadsPage';
import NewClientsPage from '../pages/NewClientsPage';
import RevenuePage from '../pages/RevenuePage';
import MonthViewPage from '../pages/MonthViewPage';
import AIImagesPageEnhanced from '../pages/AIImagesPageEnhanced';
import AIContentPage from '../pages/AIContentPage';
import CoachingPage from '../pages/CoachingPage';
import TeamControlPage from '../pages/TeamControlPage';
import PerformanceDashboardPage from '../pages/PerformanceDashboardPage';
import EODReportPage from '../pages/EODReportPage';
import AccountSettingsPage from '../pages/AccountSettingsPage';
import GHLIntegrationPage from '../pages/GHLIntegrationPage';
import DreamClientStudioPage from '../pages/DreamClientStudioPage';
import ScorecardDashboard from '../pages/ScorecardDashboard';

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
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchInitialSession = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (!session) setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial session:', error);
        setFetchError('Could not connect to authentication service.');
        setIsLoading(false);
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          setUser(null);
          setAllData({});
          setHotLeads([]);
          setTransactions([]);
          setNewClients([]);
          setSavedQuotes([]);
          setUsers([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileError) throw profileError;

        // Check subscription status via company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('stripe_subscription_id, subscription_tier, account_status')
          .eq('id', userProfile.company_id)
          .single();

        if (companyError) {
          console.error('Error fetching company data:', companyError);
        }

        // Check if account is disabled (for gifted accounts)
        if (companyData?.account_status === 'disabled') {
          await supabase.auth.signOut();
          setFetchError('Your account has been disabled. Please contact your account sponsor.');
          setIsLoading(false);
          return;
        }

        // If company has a Stripe subscription ID, verify it's still active
        if (companyData?.stripe_subscription_id) {
          try {
            const response = await fetch('/.netlify/functions/check-subscription-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscriptionId: companyData.stripe_subscription_id })
            });
            
            const result = await response.json();
            
            // If subscription is not active, log them out
            if (!result.isActive) {
              await supabase.auth.signOut();
              setFetchError('Your subscription has expired. Please contact support to renew access.');
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error checking subscription status:', error);
            // Continue loading - don't block on subscription check failure
          }
        }

        setUser(userProfile);

        const userIdToFetch = userProfile.role === 'Manager' ? null : userProfile.id;

        let dayDataQuery = supabase.from('day_data').select('*');
        let hotLeadsQuery = supabase.from('hot_leads').select('*');
        let transactionsQuery = supabase.from('transactions').select('*');
        let clientsQuery = supabase.from('clients').select('*').eq('company_id', userProfile.company_id);
        let quotesQuery = supabase.from('quotes').select('*');

        if (userIdToFetch) {
          dayDataQuery = dayDataQuery.eq('user_id', userIdToFetch);
          hotLeadsQuery = hotLeadsQuery.eq('user_id', userIdToFetch);
          transactionsQuery = transactionsQuery.eq('user_id', userIdToFetch);
          clientsQuery = clientsQuery.eq('user_id', userIdToFetch);
          quotesQuery = quotesQuery.eq('user_id', userIdToFetch);
        }

        const [dayDataRes, hotLeadsRes, transactionsRes, clientsRes, quotesRes, usersRes] =
          await Promise.all([
            dayDataQuery,
            hotLeadsQuery,
            transactionsQuery,
            clientsQuery,
            quotesQuery,
            supabase.from('users').select('*'),
          ]);

        for (const res of [
          dayDataRes,
          hotLeadsRes,
          transactionsRes,
          clientsRes,
          quotesRes,
          usersRes,
        ]) {
          if (res.error) throw res.error;
        }

        if (dayDataRes.data)
          setAllData(
            dayDataRes.data.reduce(
              (acc, row) => ({
                ...acc,
                [row.date]: { ...row.data, userId: row.user_id },
              }),
              {}
            )
          );
        if (hotLeadsRes.data)
          setHotLeads(
            hotLeadsRes.data.map((lead: any) => ({
              ...lead,
              id: String(lead.id),
              interestLevel: lead.interest_level,
              dateAdded: lead.date_added,
              appointmentDate: lead.appointment_date,
              completedFollowUps: lead.completed_follow_ups,
              userId: lead.user_id,
            }))
          );
        if (transactionsRes.data)
          setTransactions(
            transactionsRes.data.map((t: any) => ({
              ...t,
              id: String(t.id),
              clientName: t.client_name,
              isRecurring: t.is_recurring,
              userId: t.user_id,
            }))
          );
        if (clientsRes.data)
          setNewClients(
            clientsRes.data.map((c: any) => ({
              ...c,
              id: String(c.id),
              city: c.city,
              state: c.state,
              zip: c.zip,
              monthlyContractValue: c.monthly_contract_value,
              initialAmountCollected: c.initial_amount_collected,
              closeDate: c.close_date,
              salesProcessLength: c.sales_process_length,
              userId: c.user_id,
            }))
          );
        if (quotesRes.data)
          setSavedQuotes(
            quotesRes.data.map((q: any) => ({
              ...q,
              id: String(q.id),
              savedAt: q.saved_at,
            }))
          );
        if (usersRes.data) setUsers(usersRes.data as any[]);
      } catch (error: any) {
        console.error('Error fetching application data:', error);
        setFetchError(
          error.message || 'Failed to load application data. This might be a temporary network issue.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [session]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setWinMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  const handleUpsertDayData = async (dateKey: string, data: DayData) => {
    if (!user) return;

    const userIdForDb = data.userId || user.id;
    const dataForState = { ...data, userId: userIdForDb };

    // update local state
    setAllData((prev) => ({ ...prev, [dateKey]: dataForState }));

    // strip userId before sending to DB
    const { userId, ...dataForDb } = dataForState;

    await supabase
      .from('day_data')
      .upsert(
        {
          user_id: userIdForDb,
          company_id: user.company_id,
          date: dateKey,
          data: dataForDb,
        },
        { onConflict: 'user_id, date' }
      );
  };

  // 🔹 FIXED: avoid overwriting fresh checkbox state with stale data
  const handleAddWin = (dateKey: string, message: string) => {
    setAllData((prev) => {
      const existing: DayData = prev[dateKey] || getInitialDayData();
      const updatedWins = [...(existing.winsToday || []), message];

      const updatedDay: DayData = {
        ...existing,
        winsToday: updatedWins,
      };

      // Fire Supabase upsert using this updated snapshot
      (async () => {
        if (!user) return;
        const userIdForDb = updatedDay.userId || user.id;
        const { userId, ...dataForDb } = { ...updatedDay };

        await supabase
          .from('day_data')
          .upsert(
            {
              user_id: userIdForDb,
              company_id: user.company_id,
              date: dateKey,
              data: dataForDb,
            },
            { onConflict: 'user_id, date' }
          );
      })();

      return { ...prev, [dateKey]: updatedDay };
    });

    setWinMessage(message);
    setShowConfetti(true);
  };

  const handleAddHotLead = async (
    leadData: Omit<Contact, 'id'>
  ): Promise<Contact | null> => {
    if (!user) return null;
    const payload = {
      user_id: user.id,
      company_id: user.company_id,
      name: leadData.name,
      company: leadData.company,
      date: leadData.date,
      phone: leadData.phone,
      email: leadData.email,
      interest_level: leadData.interestLevel,
      prospecting: leadData.prospecting,
      date_added: leadData.dateAdded,
      appointment_date: leadData.appointmentDate,
      completed_follow_ups: leadData.completedFollowUps,
    };
    const { data, error } = await supabase
      .from('hot_leads')
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error('Error adding hot lead:', error);
      return null;
    }
    const newLead: Contact = {
      ...data,
      id: String(data.id),
      interestLevel: data.interest_level,
      dateAdded: data.date_added,
      appointmentDate: data.appointment_date,
      completedFollowUps: data.completed_follow_ups,
      userId: data.user_id,
    };
    setHotLeads((prev) => [...prev, newLead]);
    return newLead;
  };

  const handleUpdateHotLead = async (lead: Contact) => {
    setHotLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
    if (!user) return;
    await supabase
      .from('hot_leads')
      .update({
        name: lead.name,
        company: lead.company,
        date: lead.date,
        phone: lead.phone,
        email: lead.email,
        interest_level: lead.interestLevel,
        prospecting: lead.prospecting,
        date_added: lead.dateAdded,
        appointment_date: lead.appointmentDate,
        completed_follow_ups: lead.completedFollowUps,
      })
      .eq('id', lead.id);
  };

  const handleDeleteHotLead = async (leadId: string) => {
    setHotLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (!user) return;
    await supabase.from('hot_leads').delete().eq('id', leadId);
  };

  const handleSaveNewClient = async (clientData: NewClient) => {
    console.log('📥 handleSaveNewClient called with:', clientData);
    if (!user) {
      console.log('⚠️ No user, returning early');
      return;
    }
    const payload: any = {
      name: clientData.name,
      company: clientData.company,
      phone: clientData.phone,
      email: clientData.email,
      address: clientData.address,
      city: clientData.city,
      state: clientData.state,
      zip: clientData.zip,
      sales_process_length: clientData.salesProcessLength,
      monthly_contract_value: clientData.monthlyContractValue,
      initial_amount_collected: clientData.initialAmountCollected,
      close_date: clientData.closeDate,
      stage: clientData.stage,
      user_id: clientData.userId,
      company_id: user.company_id,
    };
    
    // Add GHL contact ID if present (for imported contacts)
    if (clientData.ghl_contact_id) {
      payload.ghl_contact_id = clientData.ghl_contact_id;
    }
    if (!clientData.id || String(clientData.id).startsWith('manual-') || String(clientData.id).startsWith('ghl-') || String(clientData.id).startsWith('auto-')) {
      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single();
      if (data) {
        setNewClients((prev) => [
          ...prev,
          {
            ...data,
            id: String(data.id),
            city: data.city,
            state: data.state,
            zip: data.zip,
            monthlyContractValue: data.monthly_contract_value,
            initialAmountCollected: data.initial_amount_collected,
            closeDate: data.close_date,
            salesProcessLength: data.sales_process_length,
            userId: data.user_id,
          },
        ]);
        
        // Sync to GoHighLevel (non-blocking) - but skip if already from GHL
        if (!data.ghl_contact_id) {
          console.log('🔄 Attempting to sync client to GHL:', data.id);
          syncClientToGHL(String(data.id))
            .then((ghlContactId) => {
              console.log('✅ Client synced to GHL successfully! GHL Contact ID:', ghlContactId);
            })
            .catch((err) => {
              console.error('❌ GHL sync failed:', err);
              // Sync failure doesn't prevent client creation
            });
        } else {
          console.log('⏭️  Skipping GHL sync - contact imported from GHL (ID:', data.ghl_contact_id, ')');
        }
      } else {
        console.error('❌ Failed to insert client:', error);
        throw error;
      }
    } else {
      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', clientData.id)
        .select()
        .single();
      if (data) {
        setNewClients((prev) =>
          prev.map((c) =>
            c.id === clientData.id
              ? {
                  ...data,
                  id: String(data.id),
                  city: data.city,
                  state: data.state,
                  zip: data.zip,
                  monthlyContractValue: data.monthly_contract_value,
                  initialAmountCollected: data.initial_amount_collected,
                  closeDate: data.close_date,
                  salesProcessLength: data.sales_process_length,
                  userId: data.user_id,
                }
              : c
          )
        );
        
        // Sync to GoHighLevel (non-blocking) - but skip if already from GHL
        if (!data.ghl_contact_id) {
          console.log('🔄 Attempting to sync client to GHL:', data.id);
          syncClientToGHL(String(data.id))
            .then((ghlContactId) => {
              console.log('✅ Client synced to GHL successfully! GHL Contact ID:', ghlContactId);
            })
            .catch((err) => {
              console.error('❌ GHL sync failed:', err);
            });
        } else {
          console.log('⏭️  Skipping GHL sync - contact imported from GHL (ID:', data.ghl_contact_id, ')');
        }
      } else {
        console.error('❌ Failed to insert client:', error);
        throw error;
      }
    }
  };

  const handleSaveTransaction = async (transData: Transaction) => {
    if (!user) throw new Error('User not authenticated');
    const payload = {
      user_id: user.id,
      company_id: user.company_id,
      date: transData.date,
      client_name: transData.clientName,
      product: transData.product,
      amount: transData.amount,
      is_recurring: transData.isRecurring,
    };
    if (String(transData.id).startsWith('new-')) {
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single();
      if (error) {
        console.error('Error saving new transaction:', error);
        throw error;
      }
      if (data)
        setTransactions((prev) => [
          ...prev,
          {
            ...data,
            id: String(data.id),
            clientName: data.client_name,
            isRecurring: data.is_recurring,
            userId: data.user_id,
          },
        ]);
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transData.id)
        .select()
        .single();
      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }
      if (data)
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transData.id
              ? {
                  ...data,
                  id: String(data.id),
                  clientName: data.client_name,
                  isRecurring: data.is_recurring,
                  userId: data.user_id,
                }
              : t
          )
        );
    }
  };

  const handleDeleteTransaction = async (transId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transId));
    if (!user) return;
    await supabase.from('transactions').delete().eq('id', transId);
  };

  const handleSaveQuote = async (quoteData: Omit<Quote, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('quotes')
      .insert({ ...quoteData, user_id: user.id, company_id: user.company_id })
      .select()
      .single();
    if (data)
      setSavedQuotes((prev) => [
        { ...data, id: String(data.id), savedAt: data.saved_at },
        ...prev,
      ]);
    else console.error(error);
  };

  const handleRemoveQuote = async (quoteId: string) => {
    setSavedQuotes((prev) => prev.filter((q) => q.id !== quoteId));
    if (!user) return;
    await supabase.from('quotes').delete().eq('id', quoteId);
  };

  const handleSetAppointment = (
    appointment: { client: string; lead: string; time: string; details?: string },
    date: Date
  ) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayData = allData[dateKey] || getInitialDayData();
    const newEvent: CalendarEvent = {
      id: `appt-${Date.now()}`,
      time: appointment.time,
      type: 'Appointment',
      title: `Appt: ${appointment.client}`,
      client: appointment.client,
      details: appointment.details || `From ${appointment.lead}`,
      conducted: false,
    };
    const events = [...(dayData.events || []), newEvent].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    handleUpsertDayData(dateKey, { ...dayData, events });
    const todayDateKey = new Date().toISOString().split('T')[0];
    handleAddWin(todayDateKey, `Appointment Set: ${appointment.client}`);
    setView('month-view');
    setSelectedDate(date);
  };

  const handleConvertToClient = async (
    contact: Contact,
    initialAmountCollected: number
  ) => {
    if (!user) return;
    const closeDate = new Date().toISOString().split('T')[0];
    await handleSaveNewClient({
      id: `manual-${Date.now()}`,
      name: contact.name,
      company: contact.company || '',
      phone: contact.phone,
      email: contact.email,
      address: '',
      salesProcessLength: '',
      monthlyContractValue: 0,
      initialAmountCollected: initialAmountCollected,
      closeDate: closeDate,
      stage: 'New',
      userId: user.id,
    });
    await handleSaveTransaction({
      id: 'new-',
      date: closeDate,
      clientName: contact.name,
      product: 'Initial Service',
      amount: initialAmountCollected,
      isRecurring: false,
      userId: user.id,
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

  // Check if we're on a billing page
  const urlParams = new URLSearchParams(window.location.search);
  const isBillingSuccess = window.location.pathname.includes('/billing/success');
  const isBillingCancelled = window.location.pathname.includes('/billing/cancelled');
  
  if (isBillingSuccess || isBillingCancelled) {
    // Show billing result page without requiring authentication
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          {isBillingSuccess ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. Please check your email to verify your account.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800"><strong>Next Steps:</strong></p>
                <ol className="text-sm text-blue-700 text-left mt-2 space-y-1">
                  <li>1. Check your email inbox</li>
                  <li>2. Click the verification link</li>
                  <li>3. Return to this page</li>
                  <li>4. Sign in with your credentials</li>
                </ol>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
              <p className="text-gray-600 mb-6">
                Your payment was cancelled. No charges have been made to your account.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Check if user is on password reset page
  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordPage />;
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
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            handleSetAppointment={handleSetAppointment}
            onConvertToClient={handleConvertToClient}
          />
        );
      case 'new-clients':
        return (
          <NewClientsPage
            newClients={newClients}
            onSaveClient={handleSaveNewClient}
            onSaveTransaction={handleSaveTransaction}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            loggedInUser={user}
            users={users}
            transactions={transactions}
            companyId={user.company_id || ''}
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
            onInitialStateConsumed={() => setRevenuePageInitialState(null)}
            loggedInUser={user}
            companyId={user.company_id || ''}
          />
        );
      case 'ai-images':
        return <AIImagesPageEnhanced />;
      case 'ai-content':
        return <AIContentPage />;
      case 'coaching':
        return (
          <CoachingPage
            savedQuotes={savedQuotes}
            onSaveQuote={handleSaveQuote}
            onRemoveQuote={handleRemoveQuote}
          />
        );
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
      case 'account-settings':
        return <AccountSettingsPage />;
      case 'ghl-integration':
        return (
          <GHLIntegrationPage
            userId={user.id}
            companyId={user.company_id || ''}
            userRole={user.role}
          />
        );
      case 'dream-avatars':
        return <DreamClientStudioPage user={user} />;
      case 'scorecard-dashboard':
        return <ScorecardDashboard user={user} />;
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
