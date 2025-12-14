import React, { useMemo, useState, useEffect } from 'react';
import {
  DayData,
  RevenueData,
  CalendarEvent,
  Goal,
  Contact,
  Transaction,
  User,
  getInitialDayData,
  formatCurrency,
  formatTime12Hour,
} from '../types';
import { getSalesChallenges } from '../services/geminiService';
import Calendar from '../components/Calendar';
import RevenueCard from '../components/RevenueCard';
import AIChallengeCard from '../components/AIChallengeCard';
import ProspectingKPIs from '../components/ProspectingKPIs';
import GoalsBlock from '../components/GoalsBlock';
import NewLeadsBlock from '../components/NewLeadsBlock';
import DailyFollowUps from '../components/DailyFollowUps';
import AddLeadModal from '../components/AddLeadModal';
import AddEventModal from '../components/AddEventModal';
import ViewLeadsModal from '../components/ViewLeadsModal';
import WinsTodayCard from '../components/WinsTodayCard';

interface DayViewProps {
  allData: { [key: string]: DayData };
  onDataChange: (dateKey: string, data: DayData) => Promise<void>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddWin: (dateKey: string, winMessage: string) => void;
  onAddHotLead: (leadData: Omit<Contact, 'id'>) => Promise<Contact | null>;
  onUpdateHotLead: (lead: Contact) => void;
  hotLeads: Contact[];
  transactions: Transaction[];
  users: User[];
  onNavigateToRevenue: (
    period: 'today' | 'week' | 'month' | 'ytd' | 'mcv' | 'acv'
  ) => void;
  user: User;
}

const DayView: React.FC<DayViewProps> = ({
  allData,
  onDataChange,
  selectedDate,
  onDateChange,
  onAddWin,
  onAddHotLead,
  onUpdateHotLead,
  hotLeads,
  transactions,
  users,
  onNavigateToRevenue,
  user,
}) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isViewLeadsModalOpen, setIsViewLeadsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAiChallengeLoading, setIsAiChallengeLoading] = useState(false);

  const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
  const currentDateKey = getDateKey(selectedDate);

  // Single source of truth for the day
  const currentData: DayData = allData[currentDateKey] || getInitialDayData();

  // ---------- Automatic Rollover Logic ----------
  useEffect(() => {
    const performRollover = async () => {
      // Get yesterday's date
      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getDateKey(yesterday);
      const yesterdayData = allData[yesterdayKey];

      // Only rollover if:
      // 1. Yesterday's data exists
      // 2. Today's data doesn't already have rolled items (prevent duplicate rollovers)
      if (!yesterdayData) return;

      const todayTopTargets = currentData.topTargets || [];
      const todayMassiveGoals = currentData.massiveGoals || [];

      // Check if we've already rolled over (any item has rolledOver flag)
      const alreadyRolledOver = 
        todayTopTargets.some(g => g.rolledOver) || 
        todayMassiveGoals.some(g => g.rolledOver);

      if (alreadyRolledOver) return;

      // Find uncompleted targets from yesterday that haven't been rolled yet
      const uncompletedTargets = (yesterdayData.topTargets || [])
        .filter(g => !g.completed && !g.rolledOver) // Don't roll items that were already rolled
        .map(g => ({ ...g, rolledOver: true, id: `${g.id}-rolled-${currentDateKey}` })); // Unique ID per day

      // Find uncompleted massive goals from yesterday that haven't been rolled yet
      const uncompletedGoals = (yesterdayData.massiveGoals || [])
        .filter(g => !g.completed && !g.id.includes('-rolled')) // Don't roll items that were already rolled
        .map(g => ({ ...g, id: `${g.id}-rolled-${currentDateKey}` })); // Unique ID per day

      // If there are items to roll over
      if (uncompletedTargets.length > 0 || uncompletedGoals.length > 0) {
        // Merge: rolled items at TOP, then today's items
        // Limit to 6 items maximum for each section
        const newTopTargets = [...uncompletedTargets, ...todayTopTargets].slice(0, 6);
        const newMassiveGoals = [...uncompletedGoals, ...todayMassiveGoals].slice(0, 6);

        await saveDayData({
          topTargets: newTopTargets,
          massiveGoals: newMassiveGoals,
        });
      }
    };

    performRollover();
  }, [currentDateKey]); // Run when date changes

  // ---------- Helper: persist full DayData snapshot ----------
  const saveDayData = async (partial: Partial<DayData>) => {
    const merged: DayData = {
      ...getInitialDayData(),
      ...currentData,
      ...partial,
    };
    await onDataChange(currentDateKey, merged);
  };

  // ---------- Revenue ----------
  const calculatedRevenue = useMemo<RevenueData>(() => {
    const todayKey = getDateKey(selectedDate);
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    const startOfWeekKey = getDateKey(startOfWeek);
    const endOfWeekKey = getDateKey(endOfWeek);
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    let today = 0,
      week = 0,
      month = 0,
      ytd = 0,
      mcv = 0;

    (transactions || []).forEach((t) => {
      const transactionDate = new Date(t.date + 'T00:00:00');
      if (t.date === todayKey) today += t.amount;
      if (t.date >= startOfWeekKey && t.date <= endOfWeekKey) week += t.amount;
      if (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      ) {
        month += t.amount;
        if (t.isRecurring) mcv += t.amount;
      }
      if (transactionDate.getFullYear() === currentYear) ytd += t.amount;
    });

    const acv = mcv * 12;

    return {
      today: formatCurrency(today),
      week: formatCurrency(week),
      month: formatCurrency(month),
      ytd: formatCurrency(ytd),
      mcv: formatCurrency(mcv),
      acv: formatCurrency(acv),
    };
  }, [transactions, selectedDate]);

  // ---------- Appointments ----------
  const appointments = useMemo(() => {
    return (currentData.events || [])
      .filter((e): e is CalendarEvent => e?.type === 'Appointment')
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [currentData.events]);

  const leadsAddedToday = useMemo(
    () =>
      (hotLeads || []).filter((c) =>
        c.dateAdded?.startsWith(currentDateKey)
      ),
    [hotLeads, currentDateKey]
  );

  // ---------- AI Challenges ----------
  const handleAcceptAIChallenge = async () => {
    setIsAiChallengeLoading(true);
    try {
      const newChallenges = await getSalesChallenges();
      if (!newChallenges?.length) throw new Error('No challenges');

      const currentTopTargets = [...(currentData.topTargets || [])];
      let placed = 0;
      for (
        let i = 0;
        i < currentTopTargets.length && placed < newChallenges.length;
        i++
      ) {
        const goal = currentTopTargets[i];
        if (!goal.text?.trim()) {
          currentTopTargets[i] = { ...goal, text: newChallenges[placed++] };
        }
      }

      await saveDayData({
        topTargets: currentTopTargets,
        aiChallenge: {
          ...currentData.aiChallenge,
          challengesAccepted: true,
          challenges: [],
        },
      });

      onAddWin(currentDateKey, 'AI Challenges Added to Targets!');
    } catch (err) {
      alert('Failed to generate AI challenges.');
    } finally {
      setIsAiChallengeLoading(false);
    }
  };

  // ---------- Goals (Top 6 + Massive) ----------
  const handleGoalChange = async (
    type: 'topTargets' | 'massiveGoals',
    updatedGoal: Goal,
    isCompletion: boolean
  ) => {
    const goals = (currentData[type] || []) as Goal[];
    const newGoals = goals.map((g) =>
      g.id === updatedGoal.id
        ? { ...updatedGoal, completed: isCompletion }
        : g
    );

    await saveDayData({ [type]: newGoals } as Partial<DayData>);

    if (isCompletion && updatedGoal.text?.trim()) {
      onAddWin(currentDateKey, `Target Completed: ${updatedGoal.text}`);
    }
  };

  // ---------- Event Add / Edit / Delete ----------
  const handleEventSaved = async (savedEvent: CalendarEvent) => {
    const existingEvents = currentData.events || [];
    const normalized: CalendarEvent = {
      ...savedEvent,
      conducted: savedEvent.conducted ?? false,
    };

    const updatedEvents = editingEvent
      ? existingEvents.map((e) => (e.id === savedEvent.id ? normalized : e))
      : [...existingEvents, normalized];

    await saveDayData({ events: updatedEvents });
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventDelete = async (eventId: string) => {
    const updatedEvents = (currentData.events || []).filter(
      (e) => e.id !== eventId
    );
    await saveDayData({ events: updatedEvents });
  };

  // ---------- Toggle Appointment Conducted ----------
  const handleToggleAppointment = async (event: CalendarEvent) => {
    const newConducted = !event.conducted;

    const updatedEvents = (currentData.events || []).map((evt) =>
      evt.id === event.id ? { ...evt, conducted: newConducted } : evt
    );

    await saveDayData({ events: updatedEvents });

    const label = event.client
      ? `${event.client} — ${event.title || 'Appointment'}`
      : event.title || 'Appointment';

    if (newConducted) {
      onAddWin(currentDateKey, `Appointment Conducted: ${label}`);
      // place follow-up trigger here if needed
    }
  };

  // ---------- Render ----------
  return (
    <>
      <AddLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={() => {}}
      />

      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEventSaved}
        onDelete={handleEventDelete}
        date={selectedDate}
        eventToEdit={editingEvent}
      />

      <ViewLeadsModal
        isOpen={isViewLeadsModalOpen}
        onClose={() => setIsViewLeadsModalOpen(false)}
        leads={leadsAddedToday}
        users={users}
      />

      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold uppercase text-brand-light-text dark:text-white">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </h2>
        <p className="text-brand-light-gray dark:text-gray-400 text-sm font-medium">
          {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
          <RevenueCard
            data={calculatedRevenue}
            onNavigate={onNavigateToRevenue}
          />
          <AIChallengeCard
            data={currentData.aiChallenge}
            isLoading={isAiChallengeLoading}
            onAcceptChallenge={handleAcceptAIChallenge}
          />
        </div>

        {/* MIDDLE COLUMN */}
        <div className="space-y-8">
          <ProspectingKPIs
            contacts={currentData.prospectingContacts || []}
            events={currentData.events || []}
          />

          {/* TODAY'S APPOINTMENTS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">
                TODAY&apos;S APPOINTMENTS
              </h3>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                + Add
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-gray-500 italic">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((event) => {
                  const label = event.client
                    ? `${event.client} — ${event.title || 'Appointment'}`
                    : event.title || 'Appointment';

                  return (
                    <div key={event.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 form-checkbox text-green-600 rounded focus:ring-green-500"
                        checked={!!event.conducted}
                        onChange={() => handleToggleAppointment(event)}
                      />
                      <div
                        className={
                          event.conducted ? 'line-through text-gray-500' : ''
                        }
                      >
                        <p className="font-medium">{label}</p>
                        {event.time && (
                          <p className="text-sm text-gray-600">
                            {formatTime12Hour(event.time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DailyFollowUps
            hotLeads={hotLeads}
            onUpdateHotLead={onUpdateHotLead}
            selectedDate={selectedDate}
            onWin={(msg) => onAddWin(currentDateKey, msg)}
          />

          <WinsTodayCard wins={currentData.winsToday || []} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <GoalsBlock
            title="Today's Top 6 Targets"
            goals={currentData.topTargets || []}
            onGoalChange={(goal, isCompletion) =>
              handleGoalChange('topTargets', goal, isCompletion)
            }
          />
          <GoalsBlock
            title="Massive Action Goals"
            goals={currentData.massiveGoals || []}
            onGoalChange={(goal, isCompletion) =>
              handleGoalChange('massiveGoals', goal, isCompletion)
            }
            highlight
            iconType="target"
          />
          <NewLeadsBlock
            leads={leadsAddedToday}
            userRole={user.role}
            onAddLeadClick={() => setIsLeadModalOpen(true)}
            onViewLeadsClick={() => setIsViewLeadsModalOpen(true)}
          />
        </div>
      </div>
    </>
  );
};

export default DayView;
