"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Squares2X2Icon, UsersIcon, ServerStackIcon, 
  Bars3Icon, XMarkIcon, ArrowTrendingDownIcon, 
  BanknotesIcon, XCircleIcon, ShieldCheckIcon, 
  ChatBubbleLeftEllipsisIcon, PlusIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/outline";

// Structured navigation matching the Figma groups
const navigation = [
  {
    section: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/admin", icon: Squares2X2Icon },
    ],
  },
  {
    section: "USERS",
    items: [
      { name: "All Users", href: "/admin/users", icon: UsersIcon },
      { name: "Churn Risk", href: "/admin/churn", icon: ArrowTrendingDownIcon, badge: 4 },
    ],
  },
  {
    section: "REVENUE",
    items: [
      { name: "Revenue", href: "/admin/revenue", icon: BanknotesIcon },
      { name: "Failed Payments", href: "/admin/failed-payments", icon: XCircleIcon, badge: 4 },
    ],
  },
  {
    section: "PLATFORM",
    items: [
      { name: "Platform Health", href: "/admin/health", icon: ShieldCheckIcon },
      { name: "API Logs", href: "/admin/logs", icon: ServerStackIcon },
    ],
  },
  {
    section: "COMMUNICATIONS",
    items: [
      { name: "Support", href: "/admin/support", icon: ChatBubbleLeftEllipsisIcon },
    ],
  }
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      // 1. Tell the server to kill the session (kills HttpOnly cookies)
      await fetch("/api/v1/auth/logout", { method: "POST" });
      
      // 2. Clear client-side as a backup
      document.cookie = "siro_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      // 3. Force a full page reload to the auth screen
      window.location.href = "/admin/auth";
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback redirect even if API fails
      window.location.href = "/admin/auth";
    }
  };

  // Dynamic header title matching Figma screenshots
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/users") return "User Management";
    if (pathname === "/admin/revenue") return "Revenue";
    if (pathname === "/admin/health") return "Platform Health";
    return navigation.flatMap(g => g.items).find(i => i.href === pathname)?.name || "Dashboard";
  };

  const NavContent = () => (
    <div className="flex-1 py-6 overflow-y-auto">
      {navigation.map((group, index) => (
        <div key={group.section} className={index !== 0 ? "mt-8" : ""}>
          <h3 className="px-6 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {group.section}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 pr-6 transition-all
                    ${isActive 
                      ? "border-l-[3px] border-primary text-primary bg-blue-50/20 font-semibold" 
                      : "border-l-[3px] border-transparent text-gray-500 hover:bg-gray-50 font-medium"
                    }`}
                >
                  <div className="flex items-center gap-3 pl-5">
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  
                  {/* Red Notification Badge */}
                  {item.badge && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex relative font-sans">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR (MOBILE & DESKTOP) --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center justify-between px-6">
          <Image src="/logo.svg" alt="Siro Logo" width={90} height={36} className="mt-2" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors lg:hidden"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <NavContent />

        {/* --- SIDEBAR FOOTER (USER PROFILE & LOGOUT) --- */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-sm font-bold shadow-sm">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-700 leading-tight">Admin</span>
              <span className="text-[10px] text-gray-400 font-medium">Super Admin</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col w-full lg:ml-64">
        
        {/* --- TOP HEADER --- */}
        <header className="bg-[#F9FAFB] h-24 px-6 md:px-10 flex items-center justify-between sticky top-0 z-20 pt-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <h1 className="text-xl md:text-[22px] font-bold text-gray-600 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
          
          <div>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30">
               <PlusIcon className="w-4 h-4 stroke-[3]" />
               Add Admin
             </button>
          </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        <main className="p-6 md:p-10 max-w-[1600px] mx-auto w-full pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}