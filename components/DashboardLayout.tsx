"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Squares2X2Icon, DocumentTextIcon, ClipboardDocumentCheckIcon, 
  MapPinIcon, ChartBarIcon, Cog6ToothIcon, BellIcon, Bars3Icon, 
  XMarkIcon, QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon,
  ChevronLeftIcon, ChevronRightIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon
} from "@heroicons/react/24/outline";
import { useNotification } from "@/context/NotificationContext";
import { useProductTour } from "@/hooks/useProductTour";
import NotificationDropdown from "./NotificationDropdown";
import NotificationModal from "./NotificationModal";
import DashboardBottomNav from "./dashboard/DashboardBottomNav";

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatBusinessName = (name: string) => {
  if (!name) return "";
  const LIMIT = 18;
  return name.length > LIMIT ? name.substring(0, LIMIT).trim() + "..." : name;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMuted } = useNotification();
  const { startTour } = useProductTour();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [businessData, setBusinessData] = useState({ name: "Loading...", industry: "" });
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        const latestNotifs = data.notifications || [];
        
        // --- World Class Ringing Logic ---
        // 1. Only ring if NOT muted
        // 2. Only ring if unreadCount increased
        // 3. Only ring if the latest NEWEST notification is an 'action'
        // 4. Use localStorage to ensure we only ring once per item across all tabs
        if (!isMuted && data.unreadCount > unreadCount) {
          const newestAction = latestNotifs.find((n: any) => n.type === 'action');
          const lastRungId = localStorage.getItem("siro_last_rung_id");
          
          if (newestAction && newestAction.id !== lastRungId) {
            // It's a brand new high-priority action we haven't rung for
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"); // Subtle modern ping
            audio.play().catch(e => console.log("Audio play blocked"));
            localStorage.setItem("siro_last_rung_id", newestAction.id);
          }
        }
        
        setUnreadCount(data.unreadCount);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/business/me");
        if (res.ok) setBusinessData(await res.json());
      } catch (err) { console.error(err); }
    }
    fetchProfile();
    fetchUnreadCount();

    // Polling every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isMuted, unreadCount]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: Squares2X2Icon },
    { name: "Transactions", href: "/transactions", icon: DocumentTextIcon },
    { name: "Reconciliation", href: "/reconciliation", icon: ClipboardDocumentCheckIcon }, 
    { name: "Tax Readiness", href: "/tax-readiness", icon: MapPinIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex relative">
      

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`hidden lg:flex flex-col border-r border-gray-100 fixed h-full z-30 bg-white transition-all duration-300 ${isDesktopSidebarOpen ? "w-64" : "w-20"}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-50">
          <Image src="/logo.svg" alt="Logo" width={100} height={40} className={`${!isDesktopSidebarOpen && "hidden"}`} />
          {!isDesktopSidebarOpen && <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">S</div>}
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${pathname === item.href ? "bg-primary text-white shadow-md shadow-blue-100" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`${!isDesktopSidebarOpen && "hidden"}`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1">
          <Link 
            href="/help"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
              ${pathname === "/help" ? "bg-primary text-white shadow-md shadow-blue-100" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <QuestionMarkCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className={`${!isDesktopSidebarOpen && "hidden"}`}>Help Centre</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            <span className={`${!isDesktopSidebarOpen && "hidden"}`}>Logout</span>
          </button>

          <button 
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="w-full mt-2 flex items-center justify-center py-2 text-gray-300 hover:text-gray-500"
          >
            {isDesktopSidebarOpen ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${isDesktopSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">

          <div className="flex items-center gap-3">
            {/* Mobile logo — visible when sidebar is hidden */}
            <Image src="/logo.svg" alt="Siro" width={80} height={32} className="lg:hidden object-contain" />

            <h1 className="text-lg md:text-xl font-black text-gray-900 truncate hidden lg:block">
              {pathname === "/help" 
                ? "Help Centre" 
                : menuItems.find(i => i.href === pathname)?.name || "Overview"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => {
                if (pathname === "/transactions") {
                  // Already on transactions, start tour directly
                  setTimeout(() => startTour(), 300);
                } else {
                  // Navigate to transactions first, then start tour
                  router.push("/transactions");
                  setTimeout(() => startTour(), 800);
                }
              }}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Tour
            </button>
            <NotificationDropdown 
              onOpenModal={() => setIsNotificationModalOpen(true)} 
              externalUnreadCount={unreadCount}
            />
            <Link 
              href="/settings"
              className="flex items-center gap-3 sm:pl-4 sm:border-l border-gray-100 hover:bg-gray-50 p-1.5 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-gray-900 leading-none group-hover:text-primary transition-colors">
                  {formatBusinessName(businessData.name)}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Administrator</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 text-sm md:text-base group-hover:scale-105 transition-transform">
                {getInitials(businessData.name)}
              </div>
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>

      <DashboardBottomNav handleLogout={handleLogout} />

      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
    </div>
  );
}
