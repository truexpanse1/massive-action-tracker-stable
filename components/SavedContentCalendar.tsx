import React, { useState, useEffect } from 'react';

interface SavedContentCalendarProps {
  datesWithContent: Set<string>;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onViewSavedContent: () => void;
  savedContentCount: number;
}

const SavedContentCalendar: React.FC<SavedContentCalendarProps> = ({
  datesWithContent,
  selectedDate,
  onSelectDate,
  onViewSavedContent,
  savedContentCount,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date: Date): boolean => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasContent = (date: Date): boolean => {
    return datesWithContent.has(formatDateKey(date));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    if (hasContent(newDate)) {
      onViewSavedContent();
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isCurrentDay = isToday(date);
    const isSelected = isSelectedDate(date);
    const hasContentOnDay = hasContent(date);

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          h-8 flex flex-col items-center justify-center rounded text-sm relative
          ${isSelected ? 'bg-blue-500 text-white font-bold' : ''}
          ${isCurrentDay && !isSelected ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''}
          ${!isSelected && !isCurrentDay ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
          ${!isSelected ? 'text-gray-700 dark:text-gray-300' : ''}
        `}
      >
        <span>{day}</span>
        {hasContentOnDay && (
          <div className="absolute bottom-0.5 w-1 h-1 bg-purple-500 rounded-full"></div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">
        SAVED CONTENT
      </h3>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          ◀
        </button>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {monthName}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          ▶
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="h-6 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 mb-4">{days}</div>

      {/* View Saved Content Button */}
      <button
        onClick={onViewSavedContent}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition font-semibold text-sm"
      >
        View Saved ({savedContentCount})
      </button>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
        • = Saved content on this date
      </p>
    </div>
  );
};

export default SavedContentCalendar;
