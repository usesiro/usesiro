"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Squares2X2Icon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  MapPinIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon, 
  DocumentCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

// --- HELPER FUNCTION: Get Initials ---
const getInitials = (name: string) => {
  if (!name) return "U"; // Fallback if no name exists
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  // Takes the first letter of the first word, and first letter of the last word
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // State for Mobile Sidebar (Slide over)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for Desktop Sidebar (Collapsible) - Default is OPEN
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  
  // State for Notification Dropdown
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Hardcoded for now (later this will come from your backend/auth state)
  const businessName = "House of Salam";

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
    { name: "Transactions", href: "/transactions", icon: DocumentTextIcon },
    { name: "Reconciliation", href: "/reconciliation", icon: ClipboardDocumentCheckIcon }, 
    { name: "Tax Readiness", href: "/tax-readiness", icon: MapPinIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  // Dynamic Title Logic
  const activeItem = menuItems.find(item => item.href === pathname);
  const pageTitle = activeItem ? activeItem.name : "Dashboard"; 

  const recentNotifications = [
    { id: 1, text: "New Message From Support", time: "2m ago", icon: EnvelopeIcon, color: "text-blue-500 bg-blue-50" },
    { id: 2, text: "New Income Recorded", time: "1h ago", icon: DocumentCheckIcon, color: "text-green-500 bg-green-50" },
    { id: 3, text: "Tax Readiness Updated", time: "5h ago", icon: MapPinIcon, color: "text-red-500 bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex transition-all duration-300">
      
      {/* MOBILE SIDEBAR (Drawer) */}
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

      {/* DESKTOP SIDEBAR (Collapsible) */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-gray-100 fixed h-full z-10 bg-white transition-all duration-300 ease-in-out
          ${isDesktopSidebarOpen ? "w-64" : "w-20"}`} // Width changes from 64 to 20
      >
        {/* LOGO AREA */}
        <div className={`h-20 flex items-center border-b border-gray-50 transition-all duration-300
          ${isDesktopSidebarOpen ? "px-8 justify-start" : "px-0 justify-center"}`}
        >
          <Link href="/">
             {/* Show Logo only when open, otherwise show a simplified icon or nothing (to avoid overflow) */}
             {isDesktopSidebarOpen ? (
                <Image src="/logo.svg" alt="Siro Logo" width={80} height={34} className="object-contain" />
             ) : (
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
             )}
          </Link>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                title={!isDesktopSidebarOpen ? item.name : ""} // Tooltip on hover when collapsed
                className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap group relative
                  ${isDesktopSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3"} 
                  ${isActive 
                    ? "bg-blue-50 text-primary" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-dark"
                  }`}
              >
                <item.icon className={`flex-shrink-0 transition-all ${isDesktopSidebarOpen ? "w-5 h-5" : "w-6 h-6"}`} />
                
                {/* Text Label - Hides when collapsed */}
                <span className={`transition-all duration-300 overflow-hidden ${isDesktopSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
                  {item.name}
                </span>

                {/* Floating Tooltip for Mini Sidebar */}
                {!isDesktopSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* COLLAPSE TRIGGER */}
        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className={`w-full flex items-center rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors
              ${isDesktopSidebarOpen ? "justify-start gap-3" : "justify-center"}`}
          >
            {isDesktopSidebarOpen ? (
              <>
                <ChevronLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
        ${isDesktopSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`} // Margin adjusts here
      >
        
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-100 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Hamburger for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="lg:hidden text-gray-600 hover:text-primary transition p-2 rounded-lg hover:bg-gray-50"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-dark">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-gray-500 hover:text-primary transition outline-none p-1"
              >
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
              </button>

              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsNotificationOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl z-40 overflow-hidden animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-sm text-dark">Notifications</h3>
                      <Link href="/notifications" className="text-xs text-primary hover:underline" onClick={() => setIsNotificationOpen(false)}>View All</Link>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {recentNotifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                            <notif.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 leading-tight mb-1">{notif.text}</p>
                            <p className="text-[10px] text-gray-400">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              
              {/* --- NEW INITIALS AVATAR --- */}
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
                {getInitials(businessName)}
              </div>
              
              <div className="hidden md:block">
                <p className="text-sm font-bold text-dark leading-tight">{businessName}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}