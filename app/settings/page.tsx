"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  PencilSquareIcon, 
  PhotoIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Security"); // Defaulting to Security as requested

  const tabs = ["Personal Info", "Business Info", "Notification", "Security"];

  // --- TAB CONTENT COMPONENTS ---

  const PersonalInfo = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-lg font-bold text-dark mb-1">Personal Information</h2>
          <p className="text-gray-500 text-sm">This information will be displayed so be careful what you share</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-blue-50 transition">
          <PencilSquareIcon className="w-4 h-4" /> Edit
        </button>
      </div>

      {/* Avatar Placeholder */}
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
          <PhotoIcon className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-gray-500 text-sm mb-1">First Name</label>
          <div className="font-bold text-dark">Joe</div>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Last Name</label>
          <div className="font-bold text-dark">Doe</div>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Email</label>
          <div className="font-bold text-dark">Joe@gmail.com</div>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Phone No</label>
          <div className="font-bold text-dark">091000000000</div>
        </div>
      </div>
    </div>
  );

  const BusinessInfo = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-lg font-bold text-dark mb-1">Business Information</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-blue-50 transition">
          <PencilSquareIcon className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-gray-500 text-sm mb-1">Business Name</label>
          <div className="font-bold text-dark">House Of Salam</div>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Business Type</label>
          <div className="font-bold text-dark">Sole Business</div>
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1">Industry</label>
          <div className="font-bold text-dark">Fashion</div>
        </div>
      </div>
    </div>
  );

  const Notification = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-dark mb-1">Notification</h2>
        <p className="text-gray-500 text-sm">Get notified for every time you login to your account</p>
      </div>

      <div className="border border-gray-100 rounded-xl p-6 flex flex-col md:flex-row gap-8">
        <div className="flex items-center gap-3">
          {/* Toggle Switch ON */}
          <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer transition hover:opacity-90">
             <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow-sm"></div>
          </div>
          <span className="text-gray-600 text-sm">Email</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Switch ON */}
          <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer transition hover:opacity-90">
             <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow-sm"></div>
          </div>
          <span className="text-gray-600 text-sm">Push Notification</span>
        </div>
      </div>
    </div>
  );

  const Security = () => (
    <div className="space-y-6">
      
      {/* 1. Change Password Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-dark mb-2">Change Password</h2>
        <p className="text-gray-500 text-sm mb-6">Change your password at any time</p>
        
        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
          Change Password <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Device Sessions Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-dark mb-2">Device Sessions</h2>
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

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        
        {/* --- TABS HEADER --- */}
        <div className="bg-gray-100/50 p-1.5 rounded-xl flex flex-wrap gap-2 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab 
                  ? "bg-white text-dark shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-dark hover:bg-gray-200/50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- DYNAMIC CONTENT --- */}
        <div className="animate-fade-in-up">
          {activeTab === "Personal Info" && <PersonalInfo />}
          {activeTab === "Business Info" && <BusinessInfo />}
          {activeTab === "Notification" && <Notification />}
          {activeTab === "Security" && <Security />}
        </div>

      </div>
    </DashboardLayout>
  );
}