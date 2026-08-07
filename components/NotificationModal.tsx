"use client";

import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  type: 'activity' | 'action';
  title: string;
  message: string;
  time: string;
  status: string;
  metadata?: any;
}

export default function NotificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'actions' | 'activity'>('all');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/notifications");
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

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications/mark-read", {
        method: "POST"
      });
      if (res.ok) {
        // Just refresh to update UI if needed, though dropdown handles the badge
        fetchNotifications();
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'actions') return n.type === 'action';
    if (filter === 'activity') return n.type === 'activity';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity & Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time log of your business actions</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* FILTERS */}
        <div className="px-6 py-4 border-b border-gray-50 flex gap-2">
          {['all', 'actions', 'activity'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all
                ${filter === f ? 'bg-primary text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {f}
            </button>
          ))}
          <button 
            onClick={fetchNotifications}
            className="ml-auto p-2 text-gray-400 hover:text-primary transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading && 'animate-spin'}`} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading && notifications.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
               <ArrowPathIcon className="w-10 h-10 mx-auto mb-4 animate-spin opacity-20" />
               <p className="font-medium">Syncing activity logs...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-50 rounded-3xl">
               <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
               <p className="font-medium text-gray-500">No {filter !== 'all' ? filter : ''} notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50/80 transition-all border border-transparent hover:border-gray-100 group">
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm
                  ${notif.type === 'action' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
                  {notif.type === 'action' ? <ExclamationTriangleIcon className="w-6 h-6" /> : <ClockIcon className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900">{notif.title}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                      {new Date(notif.time).toLocaleString('en-GB', { 
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
           <p className="text-xs text-gray-400 font-medium font-black uppercase tracking-widest">Audit Intelligence Active</p>
           <button 
             onClick={markAllAsRead}
             className="flex items-center gap-2 text-xs font-black text-primary hover:text-blue-600 transition-colors uppercase tracking-widest"
           >
             Mark all as read
           </button>
        </div>

      </div>
    </div>
  );
}
