"use client";

import React, { useState, useEffect } from "react";

interface TimeSlotPickerProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function TimeSlotPicker({ selectedDate, selectedTime, onTimeSelect }: TimeSlotPickerProps) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      setIsLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await fetch(`/api/v1/bookings?date=${dateStr}`);
        const data = await res.json();
        
        if (data.bookings) {
          // Extract time strings (HH:MM) from booked slots
          const booked = data.bookings.map((b: any) => {
            const d = new Date(b.startTime);
            return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
          });
          setBookedSlots(booked);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailability();
  }, [selectedDate]);

  const slots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="font-fraunces text-xl font-bold text-gray-900 mb-6">
        Select Time
      </h3>
      
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {slots.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            const isSelected = selectedTime === slot;

            return (
              <button
                key={slot}
                disabled={isBooked}
                onClick={() => onTimeSelect(slot)}
                className={`
                  py-3 px-4 rounded-xl text-sm font-semibold transition-all border
                  ${isBooked 
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through" 
                    : "hover:border-primary hover:text-primary border-gray-100 text-gray-700"}
                  ${isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-white"}
                `}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center sm:text-left">
        All times in UTC / GMT
      </p>
    </div>
  );
}
