"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  PencilSquareIcon, 
  PhotoIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowDownTrayIcon, // Added for Export button
  CalendarIcon,      // Added for Date picker
  ChevronLeftIcon,   // Added for Pagination
  ChevronDownIcon    // Added for Dropdowns
} from "@heroicons/react/24/outline";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Audit Logs"); // Default to Audit Logs as requested

  const tabs = ["Personal Info", "Business Info", "Automation", "Notification", "Security", "Audit Logs"];

  // --- TAB CONTENT COMPONENTS ---

  const PersonalInfo = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Personal Information</h2>
          <p className="text-gray-500 text-sm">This information will be displayed so be careful what you share</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-blue-50 transition">
          <PencilSquareIcon className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
          <PhotoIcon className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">First Name</label>
          <div className="font-semibold text-gray-700">Joe</div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Last Name</label>
          <div className="font-semibold text-gray-700">Doe</div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Email</label>
          <div className="font-semibold text-gray-700">Joe@gmail.com</div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Phone No</label>
          <div className="font-semibold text-gray-700">091000000000</div>
        </div>
      </div>
    </div>
  );

  const BusinessInfo = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Business Information</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-blue-50 transition">
          <PencilSquareIcon className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Business Name</label>
          <div className="font-semibold text-gray-700">House Of Salam</div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Business Type</label>
          <div className="font-semibold text-gray-700">Sole Business</div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Industry</label>
          <div className="font-semibold text-gray-700">Fashion</div>
        </div>
      </div>
    </div>
  );

  const AutomationSettings = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-800">Automation Methods</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-gray-600 font-medium mb-6">Bank Integration</h3>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Connected</span>
                <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <p className="text-sm text-gray-500">Details:</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Sync</span>
                <span className="text-gray-600">Today, 10:42AM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coverage</span>
                <span className="text-gray-600">52%</span>
              </div>
            </div>
          </div>
          <button className="bg-primary text-white text-sm font-medium py-2 px-6 rounded-lg w-fit hover:bg-blue-700 transition">Manage</button>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-gray-600 font-medium mb-6">Email Forwarding</h3>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Connected</span>
                <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <p className="text-sm text-gray-500">Details:</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Sync</span>
                <span className="text-gray-600">Today, 10:42AM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coverage</span>
                <span className="text-gray-600">30%</span>
              </div>
            </div>
          </div>
          <button className="bg-primary text-white text-sm font-medium py-2 px-6 rounded-lg w-fit hover:bg-blue-700 transition">Manage</button>
        </div>

        <button className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary hover:text-primary hover:bg-blue-50/30 transition h-full min-h-[300px]">
          <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-white">
            <PlusIcon className="w-8 h-8" />
          </div>
          <span className="font-medium text-sm">Add Automation Method</span>
        </button>
      </div>
    </div>
  );

  const Notification = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Notification</h2>
        <p className="text-gray-500 text-sm">Get notified for every time you login to your account</p>
      </div>
      <div className="border border-gray-100 rounded-xl p-6 flex flex-col md:flex-row gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer transition hover:opacity-90">
             <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
          </div>
          <span className="text-gray-600 text-sm">Email</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer transition hover:opacity-90">
             <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
          </div>
          <span className="text-gray-600 text-sm">Push Notification</span>
        </div>
      </div>
    </div>
  );

  const Security = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Change Password</h2>
        <p className="text-gray-500 text-sm mb-6">Change your password at any time</p>
        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
          Change Password <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Device Sessions</h2>
        <p className="text-gray-500 text-sm mb-8">You are currently logged into these device(s):</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold tracking-wide border-b border-gray-100">
                <th className="py-4 px-4 rounded-tl-lg">Device Name</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Signed In Via</th>
                <th className="py-4 px-4 rounded-tr-lg text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array(4).fill(null).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-4 text-sm text-gray-600 font-medium">iPhone 12</td>
                  <td className="py-4 px-4 text-sm text-gray-600">Jabi, Abuja</td>
                  <td className="py-4 px-4 text-sm text-gray-600">Mobile</td>
                  <td className="py-4 px-4 text-sm text-gray-600 text-right">07, Jan 2026</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // --- NEW AUDIT LOGS COMPONENT ---
  const AuditLogs = () => {
    const logs = [
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "VAT Update", details: "Updated VAT from None to 7.5%" },
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "Modify Transfer", details: "Edited amount from 50,000 to 57,000 for #5758" },
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "Attach Document", details: "Upload Invoice_123 to #7584" },
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "VAT Update", details: "Updated VAT from None to 7.5%" },
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "Delete Attachment", details: "Updated VAT from None to 7.5%" },
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "Categorized Expense", details: "Assigned Category \"Utilities\" to #5789" },
    ];

    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Audit Logs</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
             <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>All Action</option>
                  <option>Update</option>
                  <option>Delete</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <ChevronDownIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>All Users</option>
                  <option>John Doe</option>
                  <option>Admin</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <ChevronDownIcon className="w-4 h-4" />
                </div>
              </div>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
               <ArrowDownTrayIcon className="w-4 h-4" /> Export
             </button>
             <button className="w-full md:w-auto px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-left text-gray-500 flex items-center justify-between gap-2">
               <span>2026-01-20 &rarr; 2026-04-02</span>
               <CalendarIcon className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-600 text-xs font-bold tracking-wide border-b border-gray-100">
                <th className="py-4 px-4 rounded-tl-lg">Date</th>
                <th className="py-4 px-4">Time</th>
                <th className="py-4 px-4">User</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4 rounded-tr-lg">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">{log.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{log.time}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{log.user}</td>
                  <td className="py-4 px-4 text-sm text-gray-700 font-medium">{log.action}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-8 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button 
                key={page}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 text-sm hover:border-primary hover:text-primary transition"
              >
                {page}
              </button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>

      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        
        {/* --- TABS HEADER --- */}
        <div className="bg-gray-100/50 p-1.5 rounded-xl flex flex-wrap gap-2 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === tab 
                  ? "bg-white text-gray-800 border border-gray-200" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- DYNAMIC CONTENT --- */}
        <div className="animate-fade-in-up">
          {activeTab === "Personal Info" && <PersonalInfo />}
          {activeTab === "Business Info" && <BusinessInfo />}
          {activeTab === "Automation" && <AutomationSettings />}
          {activeTab === "Notification" && <Notification />}
          {activeTab === "Security" && <Security />}
          {activeTab === "Audit Logs" && <AuditLogs />}
        </div>

      </div>
    </DashboardLayout>
  );
}