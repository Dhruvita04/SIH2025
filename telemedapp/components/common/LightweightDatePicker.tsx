"use client";
import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface LightweightDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  maxDate?: Date;
  className?: string;
}

const LightweightDatePicker: React.FC<LightweightDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  maxDate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formattedValue = value && isValid(value) ? format(value, 'yyyy-MM-dd') : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        onChange(parsedDate);
      } else {
        onChange(null);
      }
    } catch (error) {
      onChange(null);
    }
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        onChange(parsedDate);
        setIsOpen(false);
      }
    } catch (error) {
      // Invalid date, keep current value or set to null
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={datePickerRef}>
      <div className="relative">
        <input
          type="text"
          ref={inputRef}
          value={formattedValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border-2 rounded-xl transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-200 focus:ring-opacity-20 ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <input
            type="date"
            value={formattedValue}
            onChange={handleDateSelect}
            max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
            className="w-full text-gray-900"
          />
        </div>
      )}
    </div>
  );
};

export default LightweightDatePicker;
