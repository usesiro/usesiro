"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Squares2X2Icon, DocumentTextIcon, ClipboardDocumentCheckIcon, 
  MapPinIcon, ChartBarIcon, Cog6ToothIcon, BellIcon, Bars3Icon, 
  XMarkIcon, QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon,
  ChevronLeftIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [businessData, setBusinessData] = useState({ name: "Loading...", industry: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/business/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
        });
        if (res.ok) setBusinessData(await res.json());
      } catch (err) { console.error(err); }
    }
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("siro_access_token");
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
    { name: "Transactions", href: "/transactions", icon: DocumentTextIcon },
    { name: "Reconciliation", href: "/reconciliation", icon: ClipboardDocumentCheckIcon }, 
    { name: "Tax Readiness", href: "/tax-readiness", icon: MapPinIcon },
    { name: "Reports", href: "/reports", icon: ChartBarIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex relative">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- MOBILE SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
          <Image src="/logo.svg" alt="Logo" width={100} height={40} />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${pathname === item.href ? "bg-primary text-white shadow-md shadow-blue-100" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1">
          <Link 
            href="/help"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
              ${pathname === "/help" ? "bg-primary text-white shadow-md shadow-blue-100" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <QuestionMarkCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Help Centre</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

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
            {/* NEW: HAMBURGER BUTTON FOR MOBILE */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg md:text-xl font-black text-gray-900 truncate">
              {pathname === "/help" 
                ? "Help Centre" 
                : menuItems.find(i => i.href === pathname)?.name || "Overview"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
              <BellIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-gray-100">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-gray-900 leading-none">{businessData.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Administrator</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 text-sm md:text-base">
                {getInitials(businessData.name)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}