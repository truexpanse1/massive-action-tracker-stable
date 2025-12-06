
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Calendar from './Calendar';

interface DatePickerProps {
  value: string; // Expects YYYY-MM-DD
  onChange: (value: string) => void; // Returns YYYY-MM-DD
  className?: string;
}

const formatDateToMMDDYY = (dateStr: string): string => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
    const date = new Date(dateStr + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
};

const parseInputToYYYYMMDD = (input: string): string | null => {
  const cleanInput = input.trim();
  if (!cleanInput) return null;

  const parts = cleanInput.split(/[/-]/);
  if (parts.length !== 3) return null;

  let [month, day, year] = parts.map(p => parseInt(p, 10));

  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;

  // Handle 2-digit year
  if (year >= 0 && year < 100) {
    year += year > 50 ? 1900 : 2000;
  }
  
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null; // Invalid date like Feb 30
  }
  
  return date.toISOString().split('T')[0];
};


const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className }) => {
    const [displayValue, setDisplayValue] = useState(formatDateToMMDDYY(value));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedDateObject = useMemo(() => {
        return value && /^\d{4}-\d{2}-\d{2}$/.test(value) 
            ? new Date(value + 'T00:00:00') 
            : new Date();
    }, [value]);

    useEffect(() => {
        setDisplayValue(formatDateToMMDDYY(value));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                if (isCalendarOpen) {
                    handleInputBlur();
                }
                setIsCalendarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef, isCalendarOpen, displayValue, value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    }

    const handleInputBlur = () => {
        const parsedDate = parseInputToYYYYMMDD(displayValue);
        if (parsedDate) {
            if (parsedDate !== value) {
                onChange(parsedDate);
            }
        } else {
            if (displayValue.trim() !== '') {
                setDisplayValue(formatDateToMMDDYY(value));
            }
        }
    };
    
    const handleCalendarSelect = (date: Date) => {
        const newDateStr = date.toISOString().split('T')[0];
        onChange(newDateStr);
        setIsCalendarOpen(false);
    };
    
    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <div className="relative">
                <input 
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="mm/dd/yy"
                    className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid pr-8"
                />
                <button 
                    type="button" 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)} 
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-brand-blue"
                    aria-label="Open calendar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
            {isCalendarOpen && (
                <div className="absolute top-full mt-2 z-30 bg-brand-light-card dark:bg-brand-navy shadow-lg rounded-lg border border-brand-light-border dark:border-brand-gray">
                    <Calendar selectedDate={selectedDateObject} onDateChange={handleCalendarSelect} />
                </div>
            )}
        </div>
    );
};

export default DatePicker;
