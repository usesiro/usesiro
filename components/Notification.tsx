"use client";

import React from "react";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-white/90 border-green-100 text-green-800 shadow-green-100/20",
          iconBg: "bg-green-50 text-green-600",
          Icon: CheckCircleIcon
        };
      case "error":
        return {
          container: "bg-white/90 border-red-100 text-red-800 shadow-red-100/20",
          iconBg: "bg-red-50 text-red-600",
          Icon: XCircleIcon
        };
      case "warning":
        return {
          container: "bg-white/90 border-amber-100 text-amber-800 shadow-amber-100/20",
          iconBg: "bg-amber-50 text-amber-600",
          Icon: ExclamationTriangleIcon
        };
      default:
        return {
          container: "bg-white/90 border-blue-100 text-blue-800 shadow-blue-100/20",
          iconBg: "bg-blue-50 text-blue-600",
          Icon: InformationCircleIcon
        };
    }
  };

  const { container, iconBg, Icon } = getStyles();

  return (
    <div className="fixed top-8 left-1/2 z-[100] min-w-[340px] max-w-lg animate-toast-in">
      <div className={`
        flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300
        ${container}
      `}>
        {/* Icon */}
        <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-[13px] font-bold tracking-tight leading-snug">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        {/* Progress Bar (Visual only to match 5s duration) */}
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-10 rounded-full animate-pulse w-full"></div>
      </div>
    </div>
  );
}
