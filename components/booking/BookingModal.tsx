"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { getCalApi } from "@calcom/embed-react";
import BookingCalendar from "./BookingCalendar";
import TimeSlotPicker from "./TimeSlotPicker";
import BookingForm from "./BookingForm";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'success'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Initialize Cal.com for fallback
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { 
        styles: { branding: { brandColor: "#2F6EF6" } },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  if (!isOpen) return null;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('details');
  };

  const resetModal = () => {
    setStep('date');
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Left Panel: Info */}
        <div className="w-full md:w-80 bg-gray-50 p-8 flex flex-col justify-between border-r border-gray-100">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-fraunces font-bold text-gray-900 mb-2 leading-tight">
              Book a <span className="text-primary italic">Siro</span> Demo
            </h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              We'll show you how to automate your tax readiness in 30 minutes.
            </p>

            {selectedDate && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedDate.toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </p>
                </div>
                {selectedTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-sm font-semibold text-gray-700">{selectedTime}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="text-sm font-semibold text-gray-700">30 min Walkthrough</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Prefer Cal?
            </p>
            <button 
              data-cal-link="use-siro/30min"
              className="text-primary text-xs font-bold hover:underline underline-offset-4"
              onClick={() => {
                // Cal.com embed handles the popup, so we can close ours or just let it stay
              }}
            >
              Use Cal.com Fallback →
            </button>
          </div>
        </div>

        {/* Right Panel: Interactive Flow */}
        <div className="flex-grow p-8 md:p-12 overflow-y-auto">
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {step === 'date' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <BookingCalendar 
                selectedDate={selectedDate} 
                onDateSelect={handleDateSelect} 
              />
            </div>
          )}

          {step === 'time' && selectedDate && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <button 
                onClick={() => setStep('date')}
                className="text-primary text-xs font-bold uppercase tracking-widest mb-4 hover:underline"
              >
                ← Back to dates
              </button>
              <TimeSlotPicker 
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          )}

          {step === 'details' && selectedDate && selectedTime && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <BookingForm 
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBack={() => setStep('time')}
                onSuccess={() => setStep('success')}
                onError={() => {
                  // Automated fallback: If ours fails, give them the Cal.com option prominently
                  const calButton = document.querySelector('[data-cal-link]') as HTMLElement;
                  if (calButton) {
                    setTimeout(() => calButton.click(), 1000);
                  }
                }}
              />
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-fraunces text-3xl font-bold text-gray-900 mb-4">
                Booking Confirmed!
              </h3>
              <p className="text-gray-500 max-w-sm mb-8 leading-relaxed font-medium">
                Check your inbox for a confirmation email and the calendar invite. We can't wait to chat!
              </p>
              <button 
                onClick={handleClose}
                className="px-10 py-4 bg-primary text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                Continue to Siro
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
