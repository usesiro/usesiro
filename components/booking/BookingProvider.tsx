"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import BookingModal from "./BookingModal";

interface BookingContextType {
  openBookingModal: () => void;
  closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBookingModal = () => setIsModalOpen(true);
  const closeBookingModal = () => setIsModalOpen(false);

  return (
    <BookingContext.Provider value={{ openBookingModal, closeBookingModal }}>
      {children}
      <BookingModal isOpen={isModalOpen} onClose={closeBookingModal} />
    </BookingContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingProvider");
  }
  return context;
}
