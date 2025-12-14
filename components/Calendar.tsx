import React from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datesWithActivity?: string[]; // Array of date strings (YYYY-MM-DD) that have activity
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, datesWithActivity = [] }) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const currentDate = selectedDate.getDate();

  const handlePrevMonth = () => {
    onDateChange(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (day: number) => {
    if (day > 0) {
        const newDate = new Date(currentYear, currentMonth, day);
        onDateChange(newDate);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const hasActivity = (day: number): boolean => {
    if (!day) return false;
    const dateKey = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return datesWithActivity.includes(dateKey);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-3 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <div className="flex justify-between items-center mb-3 px-1">
        <button onClick={handlePrevMonth} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray/50" aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h4 className="font-bold text-sm text-center text-brand-light-text dark:text-white select-none">
          {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button onClick={handleNextMonth} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-gray/50" aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
        {daysOfWeek.map((day, i) => <div key={i} className="font-semibold w-7 h-7 flex items-center justify-center">{day}</div>)}
        {calendarDays.map((day, index) => {
          const isSelected = day === currentDate;
          const hasLeads = hasActivity(day as number);
          
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day as number)}
              disabled={!day}
              className={`p-1 rounded-full w-7 h-7 mx-auto flex items-center justify-center text-xs transition-colors relative ${
                  !day ? 'cursor-default' : 'hover:bg-gray-200 dark:hover:bg-brand-gray'
              } ${isSelected ? 'bg-brand-blue text-white font-bold' : 'text-brand-light-text dark:text-gray-300'}`}
            >
              {day}
              {hasLeads && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-lime'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
