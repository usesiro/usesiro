"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BellIcon, 
  EllipsisHorizontalIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

interface Notification {
  id: string;
  type: 'activity' | 'action';
  title: string;
  message: string;
  time: string;
  status: string;
  metadata?: any;
}

export default function NotificationDropdown({ onOpenModal, externalUnreadCount }: { onOpenModal: () => void, externalUnreadCount?: number }) {
  const { isMuted, toggleMute } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(externalUnreadCount || 0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (externalUnreadCount !== undefined) {
      if (externalUnreadCount > unreadCount) {
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 3000);
      }
      setUnreadCount(externalUnreadCount);
    }
  }, [externalUnreadCount]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        setUnreadCount(0);
        // We could also refresh notifications here if needed, 
        // but marking as read just clears the badge.
      }
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors relative"
      >
        <BellIcon className={`w-6 h-6 ${isRinging ? 'animate-bell-ring text-primary' : unreadCount > 0 ? 'text-primary' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 ring-1 ring-black/5 z-[100] overflow-hidden animate-fade-in-up">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button 
                onClick={toggleMute}
                className="p-1 text-gray-300 hover:text-primary transition-colors"
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              >
                {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
              </button>
            </div>
            <button 
              onClick={() => { setIsOpen(false); onOpenModal(); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              View More
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Fetching updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <InformationCircleIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.slice(0, 6).map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center 
                        ${notif.type === 'action' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        {notif.type === 'action' ? <ExclamationTriangleIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-sm font-bold text-gray-900 truncate">{notif.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                            {formatTime(notif.time)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        {notif.type === 'action' && (
                          <Link 
                            href="/reconciliation" 
                            onClick={() => setIsOpen(false)}
                            className="inline-block mt-2 text-[10px] font-black text-red-500 uppercase tracking-wider hover:underline"
                          >
                            Resolve Now &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
            <button 
              onClick={() => { markAllAsRead(); }}
              className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
