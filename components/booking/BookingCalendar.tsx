"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function BookingCalendar({ selectedDate, onDateSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  // Padding for previous month
  for (let i = 0; i < offset; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 md:h-12" />);
  }

  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const isPast = date < today;
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isToday = date.toDateString() === today.toDateString();

    days.push(
      <button
        key={d}
        disabled={isPast}
        onClick={() => onDateSelect(date)}
        className={`
          h-10 md:h-12 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all
          ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-primary/10 text-gray-700"}
          ${isSelected ? "bg-primary text-white hover:bg-primary scale-105 shadow-md shadow-primary/20" : ""}
          ${isToday && !isSelected ? "text-primary font-bold border border-primary/20" : ""}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-fraunces text-xl font-bold text-gray-900">
          {monthNames[month]} <span className="text-gray-400 font-sans font-normal">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days}
      </div>
    </div>
  );
}
