"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Squares2X2Icon, DocumentTextIcon, MapPinIcon, 
  ChartBarIcon, Bars3Icon, Cog6ToothIcon,
  QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon,
  ClipboardDocumentCheckIcon, XMarkIcon
} from "@heroicons/react/24/outline";

interface DashboardBottomNavProps {
  handleLogout: () => Promise<void>;
}

export default function DashboardBottomNav({ handleLogout }: DashboardBottomNavProps) {
  const pathname = usePathname();
  const [isDropUpOpen, setIsDropUpOpen] = useState(false);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Squares2X2Icon },
    { name: "Transactions", href: "/transactions", icon: DocumentTextIcon },
    { name: "Tax Ready", href: "/tax-readiness", icon: MapPinIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
  ];

  const moreItems = [
    { name: "Reconciliation", href: "/reconciliation", icon: ClipboardDocumentCheckIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
    { name: "Help Centre", href: "/help", icon: QuestionMarkCircleIcon },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* --- DROP-UP MENU --- */}
      {isDropUpOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsDropUpOpen(false)}>
          <div 
            className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-2xl p-4 animate-in slide-in-from-bottom-10 duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">More Actions</span>
              <button onClick={() => setIsDropUpOpen(false)} className="p-1 text-gray-400 hover:text-gray-900">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              {moreItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsDropUpOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all
                    ${isActive(item.href) ? "bg-primary text-white shadow-lg shadow-blue-100" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              ))}
              
              <div className="h-px bg-gray-50 my-2" />
              
              <button 
                onClick={() => {
                  setIsDropUpOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAV BAR --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative
                ${isActive(item.href) ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
            >
              {isActive(item.href) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_1px_4px_rgba(47,110,246,0.3)]" />
              )}
              
              <item.icon className={`w-5 h-5 transition-transform ${isActive(item.href) ? "stroke-[2.5px] scale-110" : "stroke-[2px]"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-tight 
                ${isActive(item.href) ? "opacity-100" : "opacity-70"}`}>
                {item.name}
              </span>
            </Link>
          ))}

          <button 
            onClick={() => setIsDropUpOpen(!isDropUpOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all
              ${isDropUpOpen ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Bars3Icon className={`w-5 h-5 transition-transform ${isDropUpOpen ? "stroke-[2.5px] scale-110" : "stroke-[2px]"}`} />
            <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
