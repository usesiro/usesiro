"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Squares2X2Icon, DocumentTextIcon, ClipboardDocumentCheckIcon, 
  MapPinIcon, ChartBarIcon, Cog6ToothIcon, BellIcon, Bars3Icon, 
  XMarkIcon, EnvelopeIcon, DocumentCheckIcon, ChevronLeftIcon, ChevronRightIcon 
} from "@heroicons/react/24/outline";

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // --- NEW: Dynamic Business State ---
  const [businessData, setBusinessData] = useState({ name: "Loading...", industry: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/business/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBusinessData(data);
        }
      } catch (err) {
        console.error("Layout fetch error:", err);
      }
    }
    fetchProfile();
  }, []);

  const businessName = businessData.name;

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
    { name: "Transactions", href: "/transactions", icon: DocumentTextIcon },
    { name: "Reconciliation", href: "/reconciliation", icon: ClipboardDocumentCheckIcon }, 
    { name: "Tax Readiness", href: "/tax-readiness", icon: MapPinIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  const activeItem = menuItems.find(item => item.href === pathname);
  const pageTitle = activeItem ? activeItem.name : "Dashboard"; 

  const recentNotifications = [
    { id: 1, text: "New Message From Support", time: "2m ago", icon: EnvelopeIcon, color: "text-blue-500 bg-blue-50" },
    { id: 2, text: "New Income Recorded", time: "1h ago", icon: DocumentCheckIcon, color: "text-green-500 bg-green-50" },
    { id: 3, text: "Tax Readiness Updated", time: "5h ago", icon: MapPinIcon, color: "text-red-500 bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex transition-all duration-300">
      {/* MOBILE SIDEBAR */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col p-6 animate-slide-in-left">
            <div className="flex justify-between items-center mb-8">
              <Image src="/logo.svg" alt="Siro Logo" width={80} height={34} className="object-contain" />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${pathname === item.href ? "bg-blue-50 text-primary" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col border-r border-gray-100 fixed h-full z-10 bg-white transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? "w-64" : "w-20"}`}>
        <div className={`h-20 flex items-center border-b border-gray-50 transition-all duration-300 ${isDesktopSidebarOpen ? "px-8 justify-start" : "px-0 justify-center"}`}>
          <Link href="/">
             {isDesktopSidebarOpen ? (
                <Image src="/logo.svg" alt="Siro Logo" width={80} height={34} className="object-contain" />
             ) : (
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
             )}
          </Link>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap group relative
                ${isDesktopSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3"} 
                ${pathname === item.href ? "bg-blue-50 text-primary" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <item.icon className={`flex-shrink-0 transition-all ${isDesktopSidebarOpen ? "w-5 h-5" : "w-6 h-6"}`} />
              <span className={`transition-all duration-300 overflow-hidden ${isDesktopSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} className={`w-full flex items-center rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors ${isDesktopSidebarOpen ? "justify-start gap-3" : "justify-center"}`}>
            {isDesktopSidebarOpen ? <><ChevronLeftIcon className="w-5 h-5" /> <span className="text-sm font-medium">Collapse</span></> : <ChevronRightIcon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="bg-white border-b border-gray-100 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-600 p-2"><Bars3Icon className="w-6 h-6" /></button>
            <h1 className="text-xl font-bold text-dark">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative text-gray-500"><BellIcon className="w-6 h-6" /></button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {getInitials(businessName)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-dark leading-tight">{businessName}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}