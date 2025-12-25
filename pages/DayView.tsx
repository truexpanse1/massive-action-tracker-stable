import React, { useState, useMemo, useEffect } from 'react';
import {
  DayData,
  RevenueData,
  CalendarEvent,
  Goal,
  SpeedOfImplementationTarget,
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
import SpeedOfImplementationBlock from '../components/SpeedOfImplementationBlock';
import ProspectingKPIs from '../components/ProspectingKPIs';
import GoalsBlock from '../components/GoalsBlock';
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

  // ---------- Manual Rollover Logic ----------
  // Check if there are uncompleted items from yesterday
  const getUncompletedItemsFromYesterday = () => {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);
    const yesterdayData = allData[yesterdayKey];

    if (!yesterdayData) return { targets: [], goals: [] };

    // Check if we've already rolled over TODAY
    if (currentData.lastRolloverDate === currentDateKey) {
      return { targets: [], goals: [] };
    }

    const uncompletedTargets = (yesterdayData.topTargets || [])
      .filter(g => !g.completed && !g.rolledOver && g.text && g.text.trim() !== '');
    
    const uncompletedGoals = (yesterdayData.massiveGoals || [])
      .filter(g => !g.completed && !g.id.includes('-rolled') && g.text && g.text.trim() !== '');

    return { targets: uncompletedTargets, goals: uncompletedGoals };
  };

  const uncompletedFromYesterday = getUncompletedItemsFromYesterday();
  const hasUncompletedItems = uncompletedFromYesterday.targets.length > 0 || uncompletedFromYesterday.goals.length > 0;

  // Manual rollover function
  const handleRollForward = async () => {
    const todayTopTargets = currentData.topTargets || [];
    const todayMassiveGoals = currentData.massiveGoals || [];

    // Map uncompleted items with new IDs and rolledOver flag
    const uncompletedTargets = uncompletedFromYesterday.targets
      .map(g => ({ ...g, rolledOver: true, id: `${g.id}-rolled-${currentDateKey}` }));
    
    const uncompletedGoals = uncompletedFromYesterday.goals
      .map(g => ({ ...g, id: `${g.id}-rolled-${currentDateKey}` }));

    // Merge: rolled items at TOP, then today's items, limit to 6
    const newTopTargets = [...uncompletedTargets, ...todayTopTargets].slice(0, 6);
    const newMassiveGoals = [...uncompletedGoals, ...todayMassiveGoals].slice(0, 6);

    await saveDayData({
      topTargets: newTopTargets,
      massiveGoals: newMassiveGoals,
      lastRolloverDate: currentDateKey,
    });
  };

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

  // ---------- Events (All Types) ----------
  const appointments = useMemo(() => {
    return (currentData.events || [])
      .filter((e): e is CalendarEvent => !!e?.type)
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
      g.id === updatedGoal.id ? updatedGoal : g
    );
    await saveDayData({ [type]: newGoals });
  };

  // ---------- Speed of Implementation ----------
  const handleSOITargetChange = async (
    updatedTarget: SpeedOfImplementationTarget,
    isCompletion: boolean
  ) => {
    const targets = currentData.speedOfImplementation || [];
    const newTargets = targets.map((t) =>
      t.id === updatedTarget.id ? updatedTarget : t
    );
    await saveDayData({ speedOfImplementation: newTargets });
  };

  const handleSOIMoveToTomorrow = async (target: SpeedOfImplementationTarget) => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = getDateKey(tomorrow);
    const tomorrowData = allData[tomorrowKey] || getInitialDayData();

    // Update target with incremented day counter
    const forwardedTarget = {
      ...target,
      id: `${target.id}-fwd-${tomorrowKey}`,
      currentDay: target.currentDay + 1,
      completed: false,
      rolledOver: false,
    };

    // Add to tomorrow's Speed of Implementation (find first empty slot)
    const tomorrowTargets = [...(tomorrowData.speedOfImplementation || [])];
    const emptyIndex = tomorrowTargets.findIndex(t => !t.text || t.text.trim() === '');
    if (emptyIndex !== -1) {
      tomorrowTargets[emptyIndex] = forwardedTarget;
    }

    // Mark as completed on today's list
    const todayTargets = (currentData.speedOfImplementation || []).map((t) =>
      t.id === target.id ? { ...t, completed: true } : t
    );

    // Save both days
    await onDataChange(tomorrowKey, { ...tomorrowData, speedOfImplementation: tomorrowTargets });
    await saveDayData({ speedOfImplementation: todayTargets });
  };

  // ---------- Move Target to Tomorrow ----------
  const handleMoveToTomorrow = async (type: 'topTargets' | 'massiveGoals', goal: Goal) => {
    // Get tomorrow's date
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = getDateKey(tomorrow);
    const tomorrowData = allData[tomorrowKey] || getInitialDayData();

    // Update the goal with forward tracking
    const forwardedGoal = {
      ...goal,
      id: `${goal.id}-fwd-${tomorrowKey}`,
      forwarded_from_date: currentDateKey,
      forward_count: ((goal as any).forward_count || 0) + 1,
      last_forwarded_at: new Date().toISOString(),
    };

    // Add to top of tomorrow's list
    const tomorrowGoals = [forwardedGoal, ...(tomorrowData[type] || [])].slice(0, 6);

    // Mark as forwarded on today's list (gray it out)
    const todayGoals = (currentData[type] || []).map((g) =>
      g.id === goal.id ? { ...g, completed: false, forwarded: true } : g
    );

    // Save both days
    await saveDayData({ [type]: todayGoals });
    await onDataChange(tomorrowKey, { ...tomorrowData, [type]: tomorrowGoals });
  };

  // ---------- Event Add / Edit / Delete ----------
  const handleEventSaved = async (
    savedEvent: CalendarEvent,
    originalDateKey: string | null,
    newDateKey: string
  ) => {
    const normalized: CalendarEvent = {
      ...savedEvent,
      conducted: savedEvent.conducted ?? false,
    };

    // If editing an existing event, just update it on the target date
    if (editingEvent) {
      const targetDateKey = newDateKey;
      const targetData = allData[targetDateKey] || getInitialDayData();
      const updatedEvents = (targetData.events || []).map((e) =>
        e.id === savedEvent.id ? normalized : e
      );
      const merged: DayData = {
        ...getInitialDayData(),
        ...targetData,
        events: updatedEvents,
      };
      await onDataChange(targetDateKey, merged);
    } else {
      // Creating a new event
      if (savedEvent.isRecurring && savedEvent.groupId) {
        // Parse the number of weeks from groupId (format: "timestamp-weeks")
        const parts = savedEvent.groupId.split('-');
        const repeatWeeks = parseInt(parts[parts.length - 1], 10) || 1;

        // Create recurring events for each week
        for (let week = 0; week < repeatWeeks; week++) {
          const eventDate = new Date(newDateKey);
          eventDate.setDate(eventDate.getDate() + week * 7);
          const eventDateKey = getDateKey(eventDate);

          // Create a unique ID for each occurrence
          const occurrenceId = `${savedEvent.id}-week${week}`;
          const occurrenceEvent: CalendarEvent = {
            ...normalized,
            id: occurrenceId,
          };

          // Get or create day data for this date
          const targetData = allData[eventDateKey] || getInitialDayData();
          const updatedEvents = [...(targetData.events || []), occurrenceEvent];
          const merged: DayData = {
            ...getInitialDayData(),
            ...targetData,
            events: updatedEvents,
          };
          await onDataChange(eventDateKey, merged);
        }
      } else {
        // Non-recurring event, just add to the specified date
        const targetDateKey = newDateKey;
        const targetData = allData[targetDateKey] || getInitialDayData();
        const updatedEvents = [...(targetData.events || []), normalized];
        const merged: DayData = {
          ...getInitialDayData(),
          ...targetData,
          events: updatedEvents,
        };
        await onDataChange(targetDateKey, merged);
      }
    }

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
      ? `${event.client} — ${event.title || event.type}`
      : event.title || event.type;

    if (newConducted) {
      onAddWin(currentDateKey, `${event.type} Conducted: ${label}`);
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
          <SpeedOfImplementationBlock
            targets={currentData.speedOfImplementation || []}
            onTargetChange={handleSOITargetChange}
            onMoveToTomorrow={handleSOIMoveToTomorrow}
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
                    ? `${event.client} — ${event.title || event.type}`
                    : event.title || event.type;

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
                          event.conducted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                        }
                      >
                        <p className="font-medium">{label}</p>
                        {event.time && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
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
          {/* Roll Forward Button */}
          {hasUncompletedItems && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    📋 Uncompleted Items from Yesterday
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {uncompletedFromYesterday.targets.length} target(s) and {uncompletedFromYesterday.goals.length} goal(s)
                  </p>
                </div>
                <button
                  onClick={handleRollForward}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Roll Forward ➡️
                </button>
              </div>
            </div>
          )}
          <GoalsBlock
            title="Today's Top 6 Targets"
            goals={currentData.topTargets || []}
            onGoalChange={(goal, isCompletion) =>
              handleGoalChange('topTargets', goal, isCompletion)
            }
            onMoveToTomorrow={(goal) => handleMoveToTomorrow('topTargets', goal)}
            showForwardTip={true}
          />
          <GoalsBlock
            title="Massive Action Goals"
            goals={currentData.massiveGoals || []}
            onGoalChange={(goal, isCompletion) =>
              handleGoalChange('massiveGoals', goal, isCompletion)
            }
            onMoveToTomorrow={(goal) => handleMoveToTomorrow('massiveGoals', goal)}
            highlight
            iconType="target"
            showForwardTip={true}
          />
          {/* DAILY REFLECTION */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-brand-blue mb-4">
              💭 DAILY REFLECTION
            </h3>
            <textarea
              value={currentData.dailyNotes || ''}
              onChange={(e) => saveDayData({ dailyNotes: e.target.value })}
              placeholder="Reflect on your day...\n\n• What went well today?\n• What could be improved?\n• Key learnings or insights?\n• Tomorrow's priorities?"
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-brand-light-text dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Auto-saves as you type
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DayView;
