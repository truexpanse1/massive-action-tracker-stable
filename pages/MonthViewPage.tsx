


import React, { useState, useMemo } from 'react';
import { DayData, Transaction, CalendarEvent, getInitialDayData, CalendarEventType, formatTime12Hour, View } from '../types';
import AddEventModal from '../components/AddEventModal';
import ActivityListModal from '../components/ActivityListModal';


interface MonthViewPageProps {
  allData: { [key: string]: DayData };
  onDataChange: (dateKey: string, data: DayData) => Promise<void>;
  transactions: Transaction[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  setView: (view: View) => void;
}

const formatCurrency = (value: number) => {
    if (value === 0) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const calculateKpiScore = (dayData: DayData): number => {
    if (!dayData || !dayData.prospectingContacts) return 0;
    // FIX: Removed 'CB' as it is not a valid ProspectingCode
    const scoreMap: Record<string, number> = { SW: 3, SA: 10, EP: 5, LM: 1, ST: 1, NA: 1 };
    let score = 0;
    dayData.prospectingContacts.forEach(contact => {
        for (const code in contact.prospecting) {
            if (contact.prospecting[code as keyof typeof contact.prospecting]) {
                score += scoreMap[code as keyof typeof scoreMap] || 0;
            }
        }
    });
    return score;
};

const eventTypeColors: Record<CalendarEventType, string> = {
    Appointment: 'bg-brand-blue text-white', Meeting: 'bg-purple-600 text-white', Call: 'bg-brand-lime text-brand-ink',
    'Follow-up': 'bg-yellow-500 text-brand-ink', Personal: 'bg-pink-500 text-white', Task: 'bg-brand-gray text-white',
};


const MonthViewPage: React.FC<MonthViewPageProps> = ({ allData, onDataChange, transactions, selectedDate, onDateChange, setView }) => {
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isActivityListModalOpen, setIsActivityListModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ title: string; events: CalendarEvent[]; day: Date } | null>(null);
    const [editingEvent, setEditingEvent] = useState<{ event: CalendarEvent | null, date: Date | null }>({ event: null, date: null });

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const grid: (Date | null)[] = [];
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(currentYear, currentMonth, i));
        }
        return grid;
    }, [currentMonth, currentYear]);

    const dailyMetrics = useMemo(() => {
        const metrics: { [key: string]: { revenue: number; kpiScore: number; events: CalendarEvent[] } } = {};
        transactions.forEach(t => {
            const date = new Date(t.date + 'T00:00:00');
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                if (!metrics[t.date]) metrics[t.date] = { revenue: 0, kpiScore: 0, events: [] };
                metrics[t.date].revenue += t.amount;
            }
        });

        Object.keys(allData).forEach(dateKey => {
            const date = new Date(dateKey + 'T00:00:00');
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                if (!metrics[dateKey]) metrics[dateKey] = { revenue: 0, kpiScore: 0, events: [] };
                metrics[dateKey].kpiScore = calculateKpiScore(allData[dateKey]);
                metrics[dateKey].events = allData[dateKey].events || [];
            }
        });
        return metrics;
    }, [allData, transactions, currentMonth, currentYear]);

    const handlePrevMonth = () => onDateChange(new Date(currentYear, currentMonth - 1, 1));
    const handleNextMonth = () => onDateChange(new Date(currentYear, currentMonth + 1, 1));
    
    const openAddEventForDay = (day: Date) => {
        setEditingEvent({ event: null, date: day });
        setIsEventModalOpen(true);
    };

    const openEditEvent = (event: CalendarEvent, day: Date) => {
        setIsActivityListModalOpen(false); // Close list modal if open
        setEditingEvent({ event, date: day });
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = (eventData: CalendarEvent, originalDateKey: string | null, newDateKey: string) => {
        // If event moved date, remove from old date
        if (originalDateKey && allData[originalDateKey] && originalDateKey !== newDateKey) {
            const originalDayData = allData[originalDateKey];
            const updatedEvents = originalDayData.events.filter(e => e.id !== eventData.id);
            onDataChange(originalDateKey, { ...originalDayData, events: updatedEvents });
        }
        
        // Add/update event on new date
        const newDayData = allData[newDateKey] || getInitialDayData();
        const existingEventIndex = newDayData.events.findIndex(e => e.id === eventData.id);
        
        if (existingEventIndex > -1) {
            newDayData.events[existingEventIndex] = eventData;
        } else {
            newDayData.events.push(eventData);
        }
        
        newDayData.events.sort((a, b) => a.time.localeCompare(b.time));
        onDataChange(newDateKey, newDayData);
        
        setIsEventModalOpen(false);
        setEditingEvent({ event: null, date: null });
    };

    const handleDeleteEvent = (eventId: string, dateKey: string) => {
        const dayData = allData[dateKey];
        if (dayData) {
            const updatedEvents = dayData.events.filter(e => e.id !== eventId);
            onDataChange(dateKey, { ...dayData, events: updatedEvents });
        }
        setIsEventModalOpen(false);
        setEditingEvent({ event: null, date: null });
    };

    const openActivityList = (day: Date) => {
        const dayKey = day.toISOString().split('T')[0];
        const events = dailyMetrics[dayKey]?.events || [];
        setModalData({ title: `Activities for ${day.toLocaleDateString()}`, events, day });
        setIsActivityListModalOpen(true);
    };
    
    const handleGoToDay = (date: Date) => {
        onDateChange(date);
        setView('day-view');
        setIsEventModalOpen(false);
    }

    return (
        <>
            <AddEventModal 
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                date={editingEvent.date}
                eventToEdit={editingEvent.event}
                onGoToDay={handleGoToDay}
            />
            <ActivityListModal 
                isOpen={isActivityListModalOpen}
                onClose={() => setIsActivityListModalOpen(false)}
                data={modalData}
                onEditEvent={openEditEvent}
            />

            <div className="bg-brand-light-card dark:bg-brand-navy p-4 sm:p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                     <button onClick={handlePrevMonth} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray/50" aria-label="Previous month">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-brand-light-text dark:text-white">
                        {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                     <button onClick={handleNextMonth} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray/50" aria-label="Next month">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-brand-light-border dark:bg-brand-gray">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-bold text-xs text-gray-500 dark:text-gray-400 py-2 uppercase bg-brand-light-bg dark:bg-brand-gray/50">{day}</div>
                    ))}
                    
                    {/* Calendar Days */}
                    {calendarGrid.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} className="bg-brand-light-bg dark:bg-brand-ink/50"></div>;

                        const dayKey = day.toISOString().split('T')[0];
                        const metrics = dailyMetrics[dayKey] || { revenue: 0, kpiScore: 0, events: [] };
                        const isToday = dayKey === new Date().toISOString().split('T')[0];
                        const isSelected = dayKey === selectedDate.toISOString().split('T')[0];

                        return (
                            <div 
                                key={dayKey} 
                                className={`relative p-2 min-h-[120px] flex flex-col group bg-brand-light-card dark:bg-brand-navy ${isSelected ? 'bg-brand-blue/10 dark:bg-brand-blue/20' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm font-bold ${isToday ? 'bg-brand-red text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-brand-light-text dark:text-white'}`}>
                                        {day.getDate()}
                                    </span>
                                    <button onClick={() => openAddEventForDay(day)} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-blue font-bold text-lg rounded-full w-6 h-6 flex items-center justify-center hover:bg-brand-blue/20">+</button>
                                </div>
                                
                                <div className="flex-grow mt-1 text-xs space-y-1">
                                    {metrics.revenue > 0 && <p className="text-brand-lime font-semibold">{formatCurrency(metrics.revenue)}</p>}
                                    {metrics.kpiScore > 0 && <p className="text-yellow-500 font-semibold">Score: {metrics.kpiScore}</p>}
                                    
                                    <div className="space-y-1 overflow-hidden">
                                        {metrics.events.slice(0, 2).map(event => (
                                            <div key={event.id} onClick={() => openEditEvent(event, day)} className={`p-1 rounded-sm cursor-pointer text-[10px] leading-tight font-semibold truncate ${eventTypeColors[event.type]}`}>
                                                {event.title}
                                            </div>
                                        ))}
                                        {metrics.events.length > 2 && (
                                            <button onClick={() => openActivityList(day)} className="text-blue-500 hover:underline text-xs font-semibold w-full text-left">
                                                + {metrics.events.length - 2} more
                                            </button>
                                        )}
                                    </div>
                                </div>
                                 <button onClick={() => { onDateChange(day); setView('day-view'); }} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-brand-blue">
                                     &rarr;
                                 </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default MonthViewPage;
