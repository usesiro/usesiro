"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import MonoButton from "@/components/mono/MonoButton";
import { 
  PencilSquareIcon, 
  PhotoIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Audit Logs");

  const tabs = ["Personal Info", "Business Info", "Automation", "Notification", "Security", "Audit Logs"];

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
                <span className="text-sm text-gray-700">Connect to Sync</span>
                <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <MonoButton 
            label="Connect Bank"
            className="bg-primary text-white text-sm font-medium py-2 px-6 rounded-lg w-fit hover:bg-blue-700 transition"
            onSuccess={() => window.location.reload()}
          />
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-gray-600 font-medium mb-6">Email Forwarding</h3>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Inactive</span>
                <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <button className="bg-gray-100 text-gray-500 text-sm font-medium py-2 px-6 rounded-lg w-fit cursor-not-allowed">Coming Soon</button>
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
    </div>
  );

  const AuditLogs = () => {
    const logs = [
      { date: "07,Jan 2026", time: "10:30 AM", user: "John Doe", action: "VAT Update", details: "Updated VAT from None to 7.5%" },
    ];

    return (
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Audit Logs</h2>
        </div>
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
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
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