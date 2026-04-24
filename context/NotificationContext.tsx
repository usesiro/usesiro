"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Notification from "@/components/Notification";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize mute state from localStorage
  useEffect(() => {
    const savedMute = localStorage.getItem("siro_noti_muted");
    if (savedMute === "true") setIsMuted(true);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newVal = !prev;
      localStorage.setItem("siro_noti_muted", String(newVal));
      return newVal;
    });
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = "success") => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // 5-second auto-dismiss for all types (as per user request)
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, isMuted, toggleMute }}>
      {children}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={hideNotification} 
        />
      )}
    </NotificationContext.Provider>
  );
};
