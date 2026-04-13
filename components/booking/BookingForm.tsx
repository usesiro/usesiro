"use client";

import React, { useState } from "react";

interface BookingFormProps {
  selectedDate: Date;
  selectedTime: string;
  onSuccess: () => void;
  onBack: () => void;
  onError?: () => void;
}

export default function BookingForm({ selectedDate, selectedTime, onSuccess, onBack, onError }: BookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Construct start and end dates
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setUTCHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setUTCMinutes(startTime.getUTCMinutes() + 30);

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      onSuccess();
    } catch (err: any) {
      // If it's a conflict (409), just show the error
      // If it's a system error (500, etc), trigger the fallback if it exists
      const isConflict = err.message.includes("already been booked");
      
      if (!isConflict && onError) {
        setError(`System glitch detected. Automatically opening our backup (Cal.com) in 1 second...`);
        onError();
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={onBack}
        className="text-primary text-xs font-bold uppercase tracking-widest mb-4 hover:underline"
      >
        ← Back to slots
      </button>
      
      <h3 className="font-fraunces text-2xl font-bold text-gray-900 mb-2">
        Enter Details
      </h3>
      <p className="text-gray-500 text-sm mb-8">
        {selectedDate.toLocaleDateString('en-GB', { dateStyle: 'full' })} at {selectedTime}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Full Name *
          </label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Work Email *
          </label>
          <input
            required
            type="email"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Company Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900"
            placeholder="Acme Inc."
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
            Additional Notes
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 resize-none"
            placeholder="Tell us about your business needs..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          disabled={isSubmitting}
          type="submit"
          className={`
            w-full py-4 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95
            ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}
          `}
        >
          {isSubmitting ? "Scheduling..." : "Schedule Event"}
        </button>
      </form>
    </div>
  );
}
